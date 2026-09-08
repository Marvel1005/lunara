'use client';

import React, { useState } from 'react';
import { format, parseISO, isValid, isAfter } from 'date-fns';
import { Sparkles, Calendar as CalendarIcon, Sliders, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { usePeriods } from '@/lib/hooks/use-periods';

interface CycleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CycleSetupModal({ isOpen, onClose }: CycleSetupModalProps) {
  const { updateSettings } = useCycleSettings();
  const { periods, addPeriod } = usePeriods();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const parsedDate = parseISO(startDate);
    if (!isValid(parsedDate)) {
      setError('Please select a valid period start date.');
      return;
    }

    if (isAfter(parsedDate, new Date())) {
      setError('Period start date cannot be in the future.');
      return;
    }

    if (cycleLength < 21 || cycleLength > 45) {
      setError('Average cycle length must be between 21 and 45 days.');
      return;
    }

    if (periodLength < 2 || periodLength > 10) {
      setError('Average period length must be between 2 and 10 days.');
      return;
    }

    if (periodLength >= cycleLength) {
      setError('Period length must be less than total cycle length.');
      return;
    }

    setLoading(true);

    try {
      // 1. Save cycle settings
      await updateSettings({
        average_cycle_length: cycleLength,
        average_period_length: periodLength,
      });

      // 2. If user has no recorded period, create initial period record
      if (periods.length === 0) {
        await addPeriod({
          start_date: startDate,
          end_date: format(new Date(parsedDate.getTime() + (periodLength - 1) * 86400000), 'yyyy-MM-dd'),
          flow: 'medium',
          notes: 'Initial cycle setup period entry',
        });
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save cycle configuration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel p-5 sm:p-6 rounded-2xl shadow-comfort border border-white/60 text-foreground relative space-y-5">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-lunara-plum" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Welcome to Lunara Cycle Setup</h2>
            <p className="text-xs text-muted-fg mt-0.5">Let&apos;s personalize predictions for your body and rhythm</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Last Period Start Date */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>When did your last period start?</span>
            </label>
            <input
              type="date"
              required
              max={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground"
            />
          </div>

          {/* Average Cycle Length */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>Average Cycle Length</span>
              </label>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
                {cycleLength} days
              </span>
            </div>
            <input
              type="range"
              min={21}
              max={45}
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-fg mt-1">
              <span>21 days</span>
              <span>28 days (typical)</span>
              <span>45 days</span>
            </div>
          </div>

          {/* Average Period Length */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>Average Period Duration</span>
              </label>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
                {periodLength} days
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-fg mt-1">
              <span>2 days</span>
              <span>5 days (typical)</span>
              <span>10 days</span>
            </div>
          </div>

          {/* Calm Non-Medical Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 text-[11px] text-muted-fg space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Sanctuary Note</span>
            </div>
            <p className="leading-relaxed">
              Cycle predictions are mathematical estimates based on your logged history. They vary naturally over time and are not guaranteed biological determinations.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-muted-fg hover:text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Saving settings...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Setup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
