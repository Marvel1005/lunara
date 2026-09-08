'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Droplets,
  Moon as MoonIcon,
  Zap,
  Film,
  BookHeart,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Info,
  HeartPulse,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '@/providers/theme-provider';
import { useAuth } from '@/providers/auth-provider';
import { usePeriods } from '@/lib/hooks/use-periods';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { useTodayWellness, useTodayMood } from '@/lib/hooks/use-wellness';
import { calculateCycleSummary } from '@/lib/cycle/engine';
import dynamic from 'next/dynamic';
import { ThemeBadge } from '@/components/theme/theme-decorations';

const CycleSetupModal = dynamic(
  () => import('@/components/cycle/cycle-setup-modal').then((m) => m.CycleSetupModal),
  { ssr: false }
);
const PeriodModal = dynamic(
  () => import('@/components/cycle/period-modal').then((m) => m.PeriodModal),
  { ssr: false }
);
const PeriodHistoryModal = dynamic(
  () => import('@/components/cycle/period-history-modal').then((m) => m.PeriodHistoryModal),
  { ssr: false }
);
const HurtingFlowModal = dynamic(
  () => import('@/components/pain/hurting-flow-modal').then((m) => m.HurtingFlowModal),
  { ssr: false }
);

export default function DashboardPage() {
  const { isComfortMode, autoComfortMode, setAutoComfortMode } = useTheme();
  const { userName } = useAuth();

  // Real Supabase persistence hooks
  const { periods } = usePeriods();
  const { settings } = useCycleSettings();
  const { waterMl, sleepHours, energy, updateWellness } = useTodayWellness();
  const { mood, setMood } = useTodayMood();

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isLogPeriodOpen, setIsLogPeriodOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHurtingOpen, setIsHurtingOpen] = useState(false);

  // Compute live cycle calculations (Source of Truth)
  const summary = calculateCycleSummary(periods, settings);

  const getCycleGreeting = () => {
    if (!summary.hasCycleData) return 'Welcome to your personal comfort sanctuary.';
    if (summary.isPeriod) {
      if (summary.periodDay === 1) return 'Take today a little slower. Your body is resetting.';
      if (summary.periodDay === 2) return "Let's focus on making today as comfortable as possible.";
      return "You're getting through it. Be gentle with yourself today.";
    }
    if (summary.phase === 'luteal') return 'Your period may be getting closer. A little preparation makes things easier.';
    if (summary.phase === 'ovulation') return 'Your energy is naturally building up today.';
    return 'How is your body feeling today?';
  };

  const moods = [
    { label: 'Calm', emoji: '🧘‍♀️' },
    { label: 'Happy', emoji: '😊' },
    { label: 'Okay', emoji: '😌' },
    { label: 'Tired', emoji: '😴' },
    { label: 'Uncomfortable', emoji: '😣' },
    { label: 'Emotional', emoji: '🥺' },
  ];

  const energyLevels = ['Very Low', 'Low', 'Okay', 'Good', 'High'];

  const progressPercent = Math.min(
    100,
    Math.round((summary.currentCycleDay / summary.totalCycleLength) * 100)
  );

  return (
    <div className="space-y-5 pb-10 max-w-4xl mx-auto">
      {/* Modals */}
      <CycleSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
      <PeriodModal isOpen={isLogPeriodOpen} onClose={() => setIsLogPeriodOpen(false)} />
      <PeriodHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <HurtingFlowModal isOpen={isHurtingOpen} onClose={() => setIsHurtingOpen(false)} />

      {/* 1. GENTLE HEADER & IMMEDIATE ACTIONS */}
      <section className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {summary.hasCycleData ? (summary.isPeriod ? `Period Day ${summary.periodDay}` : summary.phaseName) : 'Sanctuary'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Hello, {userName}
            </h1>
          </div>

          {/* Quick Care Actions */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 flex-wrap">
            {summary.hasCycleData ? (
              <>
                <button
                  onClick={() => setIsHurtingOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-primary text-white text-xs font-semibold shadow-soft hover:opacity-95 transition-all cursor-pointer min-h-[40px] tactile-button"
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>I&apos;m Hurting</span>
                </button>

                <button
                  onClick={() => setIsLogPeriodOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all cursor-pointer min-h-[40px] tactile-button"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Period</span>
                </button>

                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-muted/60 hover:bg-muted border border-border text-foreground text-xs font-medium transition-all cursor-pointer min-h-[40px]"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-fg" />
                  <span>History</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsSetupOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Set Up Cycle Rhythm</span>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-fg leading-relaxed">
          {getCycleGreeting()}
        </p>
      </section>

      {/* 2. CYCLE CONTEXT RHYTHM */}
      {summary.hasCycleData ? (
        <section className="p-5 sm:p-6 rounded-3xl border border-border bg-card/60 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{summary.isPeriod ? '🩸' : '🌙'}</span>
              <div>
                <h2 className="text-sm font-bold text-foreground">{summary.phaseName}</h2>
                <p className="text-xs text-muted-fg">
                  {summary.isPeriod
                    ? `Day ${summary.periodDay} of period (~${summary.daysRemainingInPeriod ?? 0} days left)`
                    : `Next cycle expected ~${format(summary.nextPeriodStartDate, 'MMM d')}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">Day {summary.currentCycleDay}</span>
              <span className="text-[11px] text-muted-fg block">of ~{summary.totalCycleLength} days</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-fg pt-0.5">
              <span>Period</span>
              <span>Estimated Ovulation: {format(summary.estimatedOvulationDate, 'MMM d')}</span>
              <span>Next: {summary.daysUntilNextPeriod}d</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="p-6 rounded-3xl border border-dashed border-border bg-muted/20 text-center space-y-3">
          <p className="text-xs text-muted-fg max-w-sm mx-auto">
            Log when your last period began to see personalized estimates, ovulation predictions, and automatic comfort modes.
          </p>
          <button
            onClick={() => setIsSetupOpen(true)}
            className="px-4 py-2 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95"
          >
            Start Setup
          </button>
        </section>
      )}

      {/* 3. DAILY FEELING & WELLNESS (REAL SUPABASE PERSISTENCE) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-fg">Today&apos;s Feeling</h2>
          <p className="text-xs text-muted-fg mt-0.5">Your updates personalize your comfort and partner sharing in real time.</p>
        </div>

        {/* Mood Selector Row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {moods.map((m) => {
            const isSelected = mood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => setMood({ mood: m.label })}
                className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer tactile-button ${
                  isSelected
                    ? 'bg-primary text-primary-fg border-primary shadow-soft font-bold scale-[1.02]'
                    : 'bg-muted/30 border-border/70 hover:bg-muted/60 text-foreground'
                }`}
              >
                <span className="text-xl block mb-0.5">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Energy & Hydration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Energy Selector */}
          <div className="p-4 rounded-3xl border border-border bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-foreground">Energy</span>
              </div>
              <span className="text-xs font-semibold text-primary capitalize">
                {energy || 'Not logged'}
              </span>
            </div>

            <div className="flex gap-1.5">
              {energyLevels.map((lvl) => {
                const isSelected = energy?.toLowerCase() === lvl.toLowerCase();
                return (
                  <button
                    key={lvl}
                    onClick={() => updateWellness({ energy: lvl.toLowerCase() })}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-soft font-bold'
                        : 'bg-muted/50 text-muted-fg hover:bg-muted'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hydration Logger */}
          <div className="p-4 rounded-3xl border border-border bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-foreground">Hydration</span>
              </div>
              <span className="text-xs font-bold text-blue-600">{waterMl} ml</span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (waterMl / 2000) * 100)}%` }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateWellness({ water_ml: waterMl + 250 })}
                className="flex-1 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
              >
                + 250 ml
              </button>
              <button
                onClick={() => updateWellness({ water_ml: waterMl + 500 })}
                className="flex-1 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
              >
                + 500 ml
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REST & COMFORT RESOURCES */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-fg">Comfort for Today</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/comfort"
            className="p-4 rounded-2xl border border-border/80 bg-card/40 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Comfort Positions
              </span>
              <p className="text-[11px] text-muted-fg">Bed, sofa & desk body poses</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-fg group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/movies"
            className="p-4 rounded-2xl border border-border/80 bg-card/40 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Comfort Movies
              </span>
              <p className="text-[11px] text-muted-fg">Calming, low-tension watches</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-fg group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/journal"
            className="p-4 rounded-2xl border border-border/80 bg-card/40 hover:bg-card hover:border-primary/40 transition-all flex items-center justify-between group"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                Private Journal
              </span>
              <p className="text-[11px] text-muted-fg">Quiet reflections for your day</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-fg group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* 5. COMFORT ADAPTATION TOGGLE */}
      <section className="p-4 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Heart className={`w-4 h-4 ${isComfortMode ? 'fill-current text-primary' : 'text-muted-fg'}`} />
          <div className="text-xs">
            <span className="font-semibold text-foreground">Automatic Period Comfort Mode</span>
            <p className="text-[11px] text-muted-fg">Softens atmosphere and colors during your period</p>
          </div>
        </div>

        <button
          onClick={() => setAutoComfortMode(!autoComfortMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            autoComfortMode
              ? 'bg-primary text-primary-fg shadow-soft'
              : 'bg-muted text-muted-fg hover:text-foreground border border-border'
          }`}
        >
          {autoComfortMode ? 'Enabled' : 'Disabled'}
        </button>
      </section>
    </div>
  );
}
