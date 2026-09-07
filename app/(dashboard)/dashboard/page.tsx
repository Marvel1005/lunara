'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Droplets,
  Moon as MoonIcon,
  Zap,
  Film,
  Utensils,
  CheckCircle2,
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
import { calculateCycleSummary } from '@/lib/cycle/engine';
import dynamic from 'next/dynamic';
import { ThemeCornerDecor, ThemeBadge } from '@/components/theme/theme-decorations';

const CycleSetupModal = dynamic(() => import('@/components/cycle/cycle-setup-modal').then((m) => m.CycleSetupModal), { ssr: false });
const PeriodModal = dynamic(() => import('@/components/cycle/period-modal').then((m) => m.PeriodModal), { ssr: false });
const PeriodHistoryModal = dynamic(() => import('@/components/cycle/period-history-modal').then((m) => m.PeriodHistoryModal), { ssr: false });
const HurtingFlowModal = dynamic(() => import('@/components/pain/hurting-flow-modal').then((m) => m.HurtingFlowModal), { ssr: false });

export default function DashboardPage() {
  const { isComfortMode, autoComfortMode, setAutoComfortMode } = useTheme();
  const { userName } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string>('Tired');
  const [waterMl, setWaterMl] = useState<number>(1250);
  const [energyLevel, setEnergyLevel] = useState<string>('Low');

  // Cycle hooks
  const { periods } = usePeriods();
  const { settings } = useCycleSettings();

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isLogPeriodOpen, setIsLogPeriodOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHurtingOpen, setIsHurtingOpen] = useState(false);

  // Compute live cycle calculations (Source of Truth)
  const summary = calculateCycleSummary(periods, settings);

  const getCycleGreeting = () => {
    if (!summary.hasCycleData) return "Welcome to your personal comfort sanctuary.";
    if (summary.isPeriod) {
      if (summary.periodDay === 1) return "Take today a little slower. Your body is resetting.";
      if (summary.periodDay === 2) return "Let's focus on making today as comfortable as possible.";
      return "You're getting through it. Be gentle with yourself today.";
    }
    if (summary.phase === 'luteal') return "Your period may be getting closer. A little preparation makes things easier.";
    if (summary.phase === 'ovulation') return "Your energy is naturally building up today.";
    return "How are you feeling today?";
  };

  const moods = [
    { label: 'Happy', emoji: '😊', bg: 'hover:bg-amber-100/60' },
    { label: 'Okay', emoji: '😌', bg: 'hover:bg-emerald-100/60' },
    { label: 'Sad', emoji: '🥺', bg: 'hover:bg-blue-100/60' },
    { label: 'Tired', emoji: '😴', bg: 'hover:bg-purple-100/60' },
    { label: 'Uncomfortable', emoji: '😣', bg: 'hover:bg-rose-100/60' },
    { label: 'Irritated', emoji: '😤', bg: 'hover:bg-orange-100/60' },
    { label: 'Calm', emoji: '🧘‍♀️', bg: 'hover:bg-teal-100/60' },
  ];

  const progressPercent = Math.min(
    100,
    Math.round((summary.currentCycleDay / summary.totalCycleLength) * 100)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Modals */}
      <CycleSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
      <PeriodModal isOpen={isLogPeriodOpen} onClose={() => setIsLogPeriodOpen(false)} />
      <PeriodHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* 1. PERSONALIZED EMOTIONAL GREETING */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 card-depth-primary p-6 sm:p-8 relative overflow-hidden"
      >
        <ThemeCornerDecor size="lg" className="top-0 right-0" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <ThemeBadge>
              {summary.hasCycleData ? (summary.isPeriod ? `Period Day ${summary.periodDay}` : summary.phaseName) : 'Sanctuary'}
            </ThemeBadge>
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-gentle-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Good morning, {userName} 🌷
          </h1>
          <p className="text-sm text-muted-fg max-w-xl leading-relaxed font-medium">
            {getCycleGreeting()}
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap relative z-10">
          {!summary.hasCycleData ? (
            <button
              onClick={() => setIsSetupOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:scale-[1.02] active:scale-95 transition-all cursor-pointer tactile-button"
            >
              <Sparkles className="w-4 h-4" />
              <span>Set Up Your Rhythm</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsHurtingOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-primary text-white text-xs font-bold shadow-comfort hover:opacity-95 transition-all cursor-pointer min-h-[44px] tactile-button"
              >
                <HeartPulse className="w-4 h-4" />
                <span>I&apos;m Hurting</span>
              </button>

              <button
                onClick={() => setIsLogPeriodOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-comfort hover:opacity-95 transition-all cursor-pointer min-h-[44px] tactile-button"
              >
                <Plus className="w-4 h-4" />
                <span>Log Period</span>
              </button>

              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted border border-border text-foreground text-xs font-semibold transition-all cursor-pointer min-h-[44px] tactile-button"
              >
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>History</span>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* 2. CYCLE SUMMARY FOCAL CARD & COMFORT CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-2 card-depth-primary p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden"
        >
          <ThemeCornerDecor size="md" className="top-0 right-0" />

          {!summary.hasCycleData ? (
            <div className="space-y-4 py-2 text-center sm:text-left relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center text-xl shadow-soft">
                    ✨
                  </div>
                  <div>
                    <span className="text-xs text-muted-fg font-medium">Cycle Status</span>
                    <h3 className="text-lg font-bold text-foreground">First-Time Setup Required</h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsSetupOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all cursor-pointer tactile-button"
                >
                  Start Setup
                </button>
              </div>
              <p className="text-xs text-muted-fg leading-relaxed">
                Log when your last period started to receive personalized cycle estimates and automatic comfort mode during period days.
              </p>
            </div>
          ) : (
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-soft flex items-center justify-center text-xl shadow-soft border border-primary/20">
                    {summary.isPeriod ? '🩸' : '🌙'}
                  </div>
                  <div>
                    <span className="text-xs text-muted-fg font-medium">Current Cycle Rhythm</span>
                    <h3 className="text-lg font-bold text-foreground">{summary.phaseName}</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">Day {summary.currentCycleDay}</span>
                  <span className="text-xs text-muted-fg block">of ~{summary.totalCycleLength} days</span>
                </div>
              </div>

              {/* Cycle Rhythm Progress */}
              <div className="space-y-2 my-2">
                <div className="flex justify-between text-xs font-semibold text-muted-fg">
                  <span>
                    {summary.isPeriod
                      ? `Active Period (~${summary.daysRemainingInPeriod ?? 0} days remaining)`
                      : `Phase: ${summary.phaseName}`}
                  </span>
                  <span>
                    Next Period: {format(summary.nextPeriodStartDate, 'MMM d')} (~{summary.daysUntilNextPeriod} days)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden relative border border-border/50">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-fg gap-2">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Estimated Ovulation: {format(summary.estimatedOvulationDate, 'MMM d')}
                </span>
                <span className="italic flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Calculated from cycle history
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Automatic Comfort Mode Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className={`p-6 rounded-3xl border transition-all duration-500 flex flex-col justify-between ${
            isComfortMode
              ? 'bg-primary text-primary-fg shadow-elevated border-primary/40'
              : 'card-depth-secondary text-foreground border-border'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${isComfortMode ? 'fill-current text-white' : 'text-primary'}`} />
                <h3 className="font-bold text-base">Comfort Sanctuary</h3>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-current">
                {isComfortMode ? 'Active' : 'Standby'}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${isComfortMode ? 'text-white/90' : 'text-muted-fg'}`}>
              Automatically transforms Lunara into a soft, warm environment during your period to reduce visual clutter and prioritize comfort.
            </p>
          </div>

          <button
            onClick={() => setAutoComfortMode(!autoComfortMode)}
            className={`mt-6 w-full py-2.5 px-4 rounded-2xl text-xs font-semibold transition-all cursor-pointer tactile-button ${
              isComfortMode
                ? 'bg-white text-primary hover:bg-white/95 shadow-soft'
                : 'bg-primary text-primary-fg hover:opacity-95 shadow-soft'
            }`}
          >
            {autoComfortMode ? 'Automatic Adaptation ON' : 'Turn ON Comfort Adaptation'}
          </button>
        </motion.div>
      </div>

      {/* 3. INTERACTIVE MOOD CHECK-IN */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-depth-primary p-6 sm:p-7 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">How are you feeling today?</h3>
            <p className="text-xs text-muted-fg">Logging your mood personalizes your recommendations in real time.</p>
          </div>
          <ThemeBadge>
            Selected: {selectedMood}
          </ThemeBadge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {moods.map((m) => {
            const isSelected = selectedMood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => setSelectedMood(m.label)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer tactile-button ${
                  isSelected
                    ? 'bg-primary text-primary-fg border-primary shadow-comfort scale-105 font-bold'
                    : `bg-muted/40 border-border text-foreground ${m.bg}`
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. TODAY'S COMFORT PLAN & WELLNESS TRACKERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hydration Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card-depth-secondary p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Hydration</h4>
                <p className="text-xs text-muted-fg">Goal: 2000 ml</p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-600">{waterMl} ml</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden border border-border/50">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (waterMl / 2000) * 100)}%` }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setWaterMl((prev) => prev + 250)}
              className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-700 text-xs font-semibold hover:bg-blue-500/20 transition-colors tactile-button cursor-pointer"
            >
              + 250 ml
            </button>
            <button
              onClick={() => setWaterMl((prev) => prev + 500)}
              className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-700 text-xs font-semibold hover:bg-blue-500/20 transition-colors tactile-button cursor-pointer"
            >
              + 500 ml
            </button>
          </div>
        </motion.div>

        {/* Sleep Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card-depth-secondary p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <MoonIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Sleep & Rest</h4>
                <p className="text-xs text-muted-fg">Last night</p>
              </div>
            </div>
            <span className="text-sm font-bold text-purple-600">7.5 hrs</span>
          </div>

          <p className="text-xs text-muted-fg leading-relaxed">
            Quality logged as <span className="font-semibold text-foreground">Restful</span>. Good deep sleep helps reduce body tension.
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-purple-700 font-medium">
            <span>Target: 8.0 hrs</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 font-bold">Restful</span>
          </div>
        </motion.div>

        {/* Energy Meter */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="card-depth-secondary p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Energy Meter</h4>
                <p className="text-xs text-muted-fg">Today&apos;s level</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700">
              {energyLevel}
            </span>
          </div>

          <div className="flex gap-1.5">
            {['Very Low', 'Low', 'Okay', 'Good', 'High'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEnergyLevel(lvl)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-semibold transition-all tactile-button cursor-pointer ${
                  energyLevel === lvl
                    ? 'bg-amber-500 text-white shadow-soft font-bold'
                    : 'bg-muted/60 text-muted-fg hover:bg-muted'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-fg italic">
            Lower energy is natural right now. Take breaks whenever needed.
          </p>
        </motion.div>
      </div>

      {/* 5. NEED SOMETHING? COMFORT ECOSYSTEM GRID */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">Made for today</h3>
            <p className="text-xs text-muted-fg">Curated suggestions based on your period and mood state.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/comfort"
            className="group card-depth-secondary p-5 hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/40 text-accent-fg flex items-center justify-center text-lg">
                🛋️
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Comfort Positions
                </h4>
                <p className="text-xs text-muted-fg mt-1">
                  Side-lying pillow support and restful body poses you may find comfortable.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
              <span>Explore positions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/movies"
            className="group card-depth-secondary p-5 hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center text-lg">
                🎬
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Film className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-primary uppercase">Feel-Good Picks</span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Comfort Movies
                </h4>
                <p className="text-xs text-muted-fg mt-0.5">
                  Lighthearted comfort watches picked for a quiet day.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
              <span>Browse movies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/journal"
            className="group card-depth-secondary p-5 hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden"
          >
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg">
                📖
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-semibold text-amber-700 uppercase">Private Space</span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  Private Reflections
                </h4>
                <p className="text-xs text-muted-fg mt-0.5">
                  Put your thoughts and body sensations into words.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
              <span>Write journal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Hurting Flow Modal */}
      <HurtingFlowModal
        isOpen={isHurtingOpen}
        onClose={() => setIsHurtingOpen(false)}
      />
    </div>
  );
}
