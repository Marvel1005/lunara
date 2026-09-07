'use client';

import React, { useState } from 'react';
import { ThemeCornerDecor, ThemeBadge } from '@/components/theme/theme-decorations';
import { Sparkles, Heart, Flame, BedDouble, Maximize2, ShieldAlert, ChevronRight, Wind } from 'lucide-react';

export default function ComfortPage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'breathing' | 'warmth'>('positions');
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const positions = [
    {
      id: 'fetal-curl',
      title: 'Supported Side Fetal Curl',
      subtitle: 'Gentle pressure relief for pelvic muscles',
      description: 'Lie on your side with knees tucked toward your chest. Place a soft pillow between your knees and a second pillow tucked against your abdomen for gentle support.',
      pillowTip: 'Place a medium pillow between knees to align your hips and spine.',
      guidance: 'Try for as long as feels good to you. Take deep, slow breaths.',
      icon: '🛋️',
    },
    {
      id: 'legs-up-wall',
      title: 'Legs-Up-the-Wall (Viparita Karani)',
      subtitle: 'Soothes lower back and encourages circulation',
      description: 'Lie flat on your back near a wall and extend your legs straight up against the wall. Keep your arms relaxed at your sides with palms facing up.',
      pillowTip: 'Place a folded blanket or thin pillow underneath your lower back.',
      guidance: 'Relax in this pose for as long as comfortable. Excellent for low energy.',
      icon: '🧘‍♀️',
    },
    {
      id: 'child-pose',
      title: 'Wide-Knee Child’s Pose',
      subtitle: 'Eases lower back tightness and pelvic tension',
      description: 'Kneel on a soft surface with big toes touching and knees wide apart. Fold your torso forward and rest your forehead gently on a pillow.',
      pillowTip: 'Place a large bolster or two pillows under your chest for complete support.',
      guidance: 'Hold for as long as comfortable. Focus on expanding your lower back as you breathe.',
      icon: '🌸',
    },
    {
      id: 'knee-to-chest',
      title: 'Single Knee-to-Chest Stretch',
      subtitle: 'Gentle abdominal decompression',
      description: 'Lie on your back, gently draw one knee toward your chest while keeping the other leg extended or bent comfortably.',
      pillowTip: 'Rest your head on a soft pillow to keep your neck relaxed.',
      guidance: 'Switch sides after taking 5 deep breaths, or stay as long as feels good.',
      icon: '✨',
    },
    {
      id: 'supported-recline',
      title: 'Supported Butterfly Recline',
      subtitle: 'Opens inner thighs and pelvic area',
      description: 'Lie back on a stack of pillows supporting your upper back. Bring the soles of your feet together and let your knees open gently outward.',
      pillowTip: 'Place pillows under both outer knees so your legs are fully supported without straining.',
      guidance: 'Rest here for as long as comfortable.',
      icon: '🛋️',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>Comfort Positions & Soothing Zone</span>
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            Restful body positions you may find comfortable during your cycle.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'positions' ? 'bg-primary text-primary-fg shadow-soft' : 'text-muted-fg hover:text-foreground'
            }`}
          >
            Positions
          </button>
          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'breathing' ? 'bg-primary text-primary-fg shadow-soft' : 'text-muted-fg hover:text-foreground'
            }`}
          >
            Calm Breathing
          </button>
          <button
            onClick={() => setActiveTab('warmth')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'warmth' ? 'bg-primary text-primary-fg shadow-soft' : 'text-muted-fg hover:text-foreground'
            }`}
          >
            Warm Compress Guidelines
          </button>
        </div>
      </div>

      {activeTab === 'positions' && (
        <div className="space-y-6">
          <div className="card-depth-primary p-6 sm:p-7 relative overflow-hidden">
            <ThemeCornerDecor size="md" className="top-0 right-0" />
            <div className="space-y-2">
              <ThemeBadge>
                <Heart className="w-3.5 h-3.5 fill-current" /> Gentle Body Rest
              </ThemeBadge>
              <h2 className="text-lg font-bold text-foreground">Positions You May Find Comfortable</h2>
              <p className="text-xs text-muted-fg max-w-2xl leading-relaxed">
                Every body is unique. Listen to your body and try these positions with supportive pillows for as long as feels good to you.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positions.map((pos) => (
              <div key={pos.id} className="card-depth-secondary p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center text-2xl shadow-soft">
                      {pos.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{pos.title}</h3>
                      <p className="text-xs text-primary font-medium">{pos.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-fg leading-relaxed">
                    {pos.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 text-xs space-y-1">
                    <span className="font-bold text-foreground block">Pillow Tip:</span>
                    <p className="text-muted-fg">{pos.pillowTip}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 text-[11px] text-primary font-semibold italic">
                  {pos.guidance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'breathing' && (
        <div className="card-depth-primary p-8 text-center rounded-4xl space-y-6 max-w-xl mx-auto relative overflow-hidden">
          <ThemeCornerDecor size="lg" className="top-0 right-0" />
          <div className="w-16 h-16 rounded-3xl bg-primary-soft text-primary flex items-center justify-center text-3xl mx-auto shadow-soft animate-gentle-pulse">
            <Wind className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">4-7-8 Soothing Breath</h2>
            <p className="text-xs text-muted-fg max-w-md mx-auto leading-relaxed">
              Deep, slow breathing helps relax smooth pelvic muscles and calms your nervous system.
            </p>
          </div>

          <div className="py-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary-soft to-accent/40 border-4 border-primary text-primary flex items-center justify-center text-lg font-bold mx-auto shadow-elevated animate-pulse">
              {breathPhase}
            </div>
          </div>

          <p className="text-xs text-muted-fg italic">
            Inhale quietly through your nose for 4 seconds, hold gently for 7 seconds, exhale completely through your mouth for 8 seconds.
          </p>
        </div>
      )}

      {activeTab === 'warmth' && (
        <div className="space-y-6">
          <div className="card-depth-secondary p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Warm Compress & Heating Pad Tips</h3>
                <p className="text-xs text-muted-fg">Safe, gentle warmth for lower abdomen and back</p>
              </div>
            </div>

            <ul className="text-xs text-muted-fg space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Place a soft towel or cloth layer between your skin and heating pad.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Use low to moderate warmth for 15–20 minutes at a time while resting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Never fall asleep with an electric heating pad turned on.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
