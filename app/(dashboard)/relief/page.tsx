'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Coffee,
  BedDouble,
  Activity,
  Maximize2,
  Sparkles,
  ShieldAlert,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';
import { HurtingFlowModal } from '@/components/pain/hurting-flow-modal';
import { PainHistoryModal } from '@/components/pain/pain-history-modal';
import { ThemeCornerDecor, ThemeBadge } from '@/components/theme/theme-decorations';

type CategoryFilter = 'all' | 'warmth' | 'rest' | 'hydration' | 'movement' | 'positioning' | 'head';

export default function ReliefPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [isHurtingModalOpen, setIsHurtingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const categories: { key: CategoryFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'all', label: 'All Remedies', icon: Sparkles },
    { key: 'warmth', label: 'Warmth & Heat', icon: Flame },
    { key: 'rest', label: 'Rest & Calm', icon: BedDouble },
    { key: 'hydration', label: 'Hydration', icon: Coffee },
    { key: 'movement', label: 'Gentle Movement', icon: Activity },
    { key: 'positioning', label: 'Positioning', icon: Maximize2 },
    { key: 'head', label: 'Head Relief', icon: HeartPulse },
  ];

  return (
    <div className="space-y-5 pb-10 max-w-4xl mx-auto">
      <HurtingFlowModal
        isOpen={isHurtingModalOpen}
        onClose={() => setIsHurtingModalOpen(false)}
      />
      <PainHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HeartPulse className="w-6 h-6 text-primary" />
            <span>Comfort & Relief Center</span>
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            General comfort strategies and soothing body practices for cycle care.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all cursor-pointer min-h-[44px] tactile-button"
          >
            Pain Logs History
          </button>
          <button
            onClick={() => setIsHurtingModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-primary text-white text-xs font-bold shadow-comfort hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] tactile-button"
          >
            <HeartPulse className="w-4 h-4" />
            <span>I&apos;m Hurting Right Now</span>
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 min-h-[44px] ${
                isActive
                  ? 'bg-primary text-primary-fg shadow-comfort font-bold'
                  : 'bg-muted/40 hover:bg-muted text-foreground border border-border/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Comfort Zone Banner Link */}
      <div className="card-depth-primary p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ThemeCornerDecor size="md" className="top-0 right-0" />
        <div className="space-y-1">
          <ThemeBadge>
            <Sparkles className="w-3 h-3" /> Comfort Positions & Breathing
          </ThemeBadge>
          <h3 className="text-base font-bold text-foreground">Looking for supported rest positions?</h3>
          <p className="text-xs text-muted-fg leading-relaxed">
            Explore illustrated positions you may find comfortable with pillow placement tips and calm breathing.
          </p>
        </div>
        <Link
          href="/comfort"
          className="px-5 py-2.5 rounded-2xl bg-primary text-primary-fg text-xs font-semibold shadow-soft flex items-center gap-1.5 shrink-0 self-start sm:self-auto hover:opacity-95 transition-all tactile-button"
        >
          <span>View Comfort Zone</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Relief Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. WARMTH */}
        {(activeCategory === 'all' || activeCategory === 'warmth') && (
          <div className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Warmth & Heat Therapy</h3>
            <p className="text-xs text-muted-fg leading-relaxed">
              Applying a heating pad or warm towel to your lower abdomen or lower back may feel soothing for tight pelvic muscles.
            </p>
            <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-200 text-[11px] text-rose-900 space-y-1">
              <span className="font-bold block text-rose-950">Safe Use Notice:</span>
              <p>
                Always place a cloth layer between skin and heat source. Avoid sleeping with an active heating pad turned on.
              </p>
            </div>
          </div>
        )}

        {/* 2. REST */}
        {(activeCategory === 'all' || activeCategory === 'rest') && (
          <div className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Restful Recovery</h3>
            <p className="text-xs text-muted-fg leading-relaxed">
              Allowing yourself to step back from unnecessary exertion can help your body recharge during intense cycle days.
            </p>
            <ul className="text-xs text-muted-fg space-y-1.5 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span>Dim room lighting to rest your eyes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span>Take 10 minutes of silent deep breathing</span>
              </li>
            </ul>
          </div>
        )}

        {/* 3. HYDRATION */}
        {(activeCategory === 'all' || activeCategory === 'hydration') && (
          <div className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Hydration & Herbal Elixirs</h3>
            <p className="text-xs text-muted-fg leading-relaxed">
              Sipping warm water or caffeine-free chamomile and ginger tea if comfortable can help support healthy hydration.
            </p>
            <p className="text-[11px] text-muted-fg italic">
              Keep a fresh water bottle nearby so you don&apos;t need to get up frequently.
            </p>
          </div>
        )}

        {/* 4. GENTLE MOVEMENT */}
        {(activeCategory === 'all' || activeCategory === 'movement') && (
          <div className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Gentle Movement & Stretching</h3>
            <p className="text-xs text-muted-fg leading-relaxed">
              Light cat-cow stretches or a short easy walk may feel soothing if you feel up to it. Stop immediately if any movement causes discomfort.
            </p>
            <div className="text-[11px] text-emerald-800 bg-emerald-500/10 p-2.5 rounded-xl font-medium">
              Listen to your body — rest whenever needed.
            </div>
          </div>
        )}

        {/* 5. POSITIONING */}
        {(activeCategory === 'all' || activeCategory === 'positioning') && (
          <div className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Maximize2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Supported Body Positioning</h3>
            <p className="text-xs text-muted-fg leading-relaxed">
              Lying on your side in a gentle fetal curl with a soft pillow between your knees can take pressure off your lower back and pelvis.
            </p>
            <p className="text-xs text-muted-fg">
              Alternatively, sit supported with a cushion behind your lower back.
            </p>
          </div>
        )}

        {/* 6. HEAD DISCOMFORT */}
        {(activeCategory === 'all' || activeCategory === 'head') && (
          <div className="card-depth-secondary p-6 space-y-3 relative overflow-hidden">
            <ThemeCornerDecor size="sm" className="top-1 right-1" />
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Head & Neck Comfort</h3>
            <p className="text-xs text-muted-fg leading-relaxed">
              If experiencing head tension, lowering phone screen brightness and placing a cool damp washcloth across your forehead may offer relief.
            </p>
          </div>
        )}
      </div>

      {/* Safety & Medical Disclaimer Section */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-300 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Care & Safety Guidance</span>
        </div>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          Lunara provides general comfort strategies for everyday cycle wellbeing and does not provide medical diagnoses or prescriptions. If your pain is unusually severe, sudden, worsening, persistent, or accompanied by symptoms such as fever or dizziness, please seek evaluation from a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
