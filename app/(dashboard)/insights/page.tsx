'use client';

import React, { useState } from 'react';
import { usePeriods } from '@/lib/hooks/use-periods';
import { usePainLogs } from '@/lib/hooks/use-pain';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { calculateCycleSummary } from '@/lib/cycle/engine';
import { ThemeCornerDecor, ThemeEmptyStateDecor, ThemeBadge } from '@/components/theme/theme-decorations';
import {
  LineChart as LineChartIcon,
  Sparkles,
  HeartPulse,
  Calendar,
  Smile,
  Zap,
  Moon,
  Info,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function InsightsPage() {
  const { periods, isLoading: isLoadingPeriods } = usePeriods();
  const { painLogs, isLoading: isLoadingPain } = usePainLogs();
  const { settings } = useCycleSettings();
  const summary = calculateCycleSummary(periods, settings);

  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1yr'>('6m');

  const hasData = periods.length > 0 || painLogs.length > 0;

  // Calculate real metrics from actual Supabase records
  const totalPeriodsLogged = periods.length;
  const totalPainLogsLogged = painLogs.length;

  // Average pain severity from real logs
  const avgPainSeverity = painLogs.length > 0
    ? (painLogs.reduce((acc, log) => acc + log.severity, 0) / painLogs.length).toFixed(1)
    : null;

  // Most common pain location from real logs
  const locationCounts: Record<string, number> = {};
  painLogs.forEach((log) => {
    const loc = log.body_area || 'Lower Abdomen';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topPainLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <LineChartIcon className="w-6 h-6 text-primary" />
            <span>Cycle Insights</span>
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            Observational patterns and trends based on your recorded rhythm history.
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border text-xs self-start sm:self-auto">
            {(['3m', '6m', '1yr'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-primary text-primary-fg shadow-soft'
                    : 'text-muted-fg hover:text-foreground'
                }`}
              >
                {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasData ? (
        /* Emotionally Appropriate Warm Empty State */
        <ThemeEmptyStateDecor
          title="We're still getting to know your rhythm"
          description="Keep checking in and logging your periods or comfort moments, and we'll gradually uncover your gentle patterns over time."
          action={
            <div className="flex items-center gap-2">
              <ThemeBadge>
                <Sparkles className="w-3.5 h-3.5" /> Observational Insights Ready Soon
              </ThemeBadge>
            </div>
          }
        />
      ) : (
        <>
          {/* 1. YOUR CYCLE AT A GLANCE */}
          <div className="card-depth-primary p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <ThemeCornerDecor size="lg" className="top-0 right-0" />

            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                ✨
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Your Cycle at a Glance</h2>
                <p className="text-xs text-muted-fg">Calculated from your logged period history.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
                <span className="text-xs font-semibold text-muted-fg">Average Cycle Length</span>
                <p className="text-2xl font-bold text-primary">~{settings?.average_cycle_length || 28} days</p>
                <span className="text-[11px] text-muted-fg block">
                  &quot;Your cycles have been around {settings?.average_cycle_length || 28} days lately.&quot;
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
                <span className="text-xs font-semibold text-muted-fg">Average Period Duration</span>
                <p className="text-2xl font-bold text-primary">~{settings?.average_period_length || 5} days</p>
                <span className="text-[11px] text-muted-fg block">Typical flow duration recorded</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
                <span className="text-xs font-semibold text-muted-fg">Current Cycle Day</span>
                <p className="text-2xl font-bold text-primary">Day {summary.currentCycleDay}</p>
                <span className="text-[11px] text-muted-fg block">{summary.phaseName}</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
                <span className="text-xs font-semibold text-muted-fg">Recorded History</span>
                <p className="text-2xl font-bold text-primary">{totalPeriodsLogged} periods</p>
                <span className="text-[11px] text-muted-fg block">{totalPainLogsLogged} pain check-ins logged</span>
              </div>
            </div>
          </div>

          {/* 2. REAL OBSERVED PATTERNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Patterns */}
            <div className="card-depth-secondary p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Discomfort & Pain Observations</h3>
                  <p className="text-xs text-muted-fg">Logged physical check-ins</p>
                </div>
              </div>

              {painLogs.length === 0 ? (
                <p className="text-xs text-muted-fg italic p-4 rounded-2xl bg-muted/30">
                  No pain logs recorded yet. Check-in anytime you experience discomfort.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-fg">Average Logged Severity</span>
                    <span className="text-sm font-bold text-primary">{avgPainSeverity} / 10</span>
                  </div>

                  {topPainLocation && (
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-fg">Most Common Area</span>
                      <span className="text-xs font-bold text-foreground capitalize">
                        {topPainLocation.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-muted-fg leading-relaxed italic pt-1">
                    &quot;You tend to check in most often during your period days. Keep listening to your body.&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Rhythm Observations */}
            <div className="card-depth-secondary p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Rhythm & Rest Patterns</h3>
                  <p className="text-xs text-muted-fg">General wellbeing trends</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-xs font-bold text-foreground">Cycle Rhythm Consistency</span>
                  <p className="text-xs text-muted-fg leading-relaxed">
                    Your cycle length is estimated at ~{settings?.average_cycle_length || 28} days based on your recent period logs.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-xs font-bold text-foreground">Recommended Focus</span>
                  <p className="text-xs text-muted-fg leading-relaxed">
                    Prioritize warm hydration, rest, and supported positioning during your early period days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. REAL DATA TREND GRAPH */}
          {periods.length > 1 && (
            <div className="card-depth-secondary p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">Period History Timeline</h3>
                    <p className="text-xs text-muted-fg">Recorded start dates over recent cycles</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {periods.slice(0, 5).map((p) => (
                  <div key={p.id} className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {format(parseISO(p.start_date), 'MMMM d, yyyy')}
                    </span>
                    <span className="text-muted-fg capitalize">
                      {p.end_date ? `Ended ${format(parseISO(p.end_date), 'MMM d')}` : 'Duration ~' + (settings?.average_period_length || 5) + ' days'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-Diagnostic Disclaimer */}
          <div className="p-5 rounded-3xl bg-muted/30 border border-border/80 flex items-start gap-3 text-xs text-muted-fg">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Lunara insights are purely observational calculations based on your self-logged records. They are intended for personal reflection and comfort awareness and do not constitute medical diagnoses or health guarantees.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
