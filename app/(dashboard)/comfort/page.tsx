'use client';

import React, { useState } from 'react';
import { Sparkles, Bed, Sofa, Laptop, Car, Moon, Wind } from 'lucide-react';

type SituationKey = 'bed' | 'sofa' | 'desk' | 'travel' | 'sleep';

interface ComfortPosition {
  id: string;
  situation: SituationKey;
  title: string;
  subtitle: string;
  description: string;
  cushionTip: string;
  gentleGuidance: string;
}

const positions: ComfortPosition[] = [
  // Bed
  {
    id: 'bed-side-curl',
    situation: 'bed',
    title: 'Supported Side Curl',
    subtitle: 'Gentle on the lower back and abdomen',
    description:
      'Lie on your side with your knees comfortably drawn toward your chest. Place a soft pillow between your knees and tuck a small folded blanket against your abdomen.',
    cushionTip: 'A pillow between your knees keeps your hips aligned without muscular strain.',
    gentleGuidance: 'Try this position if it feels comfortable. Rest your arms loosely around a pillow and breathe at your own natural pace.',
  },
  {
    id: 'bed-knee-elevation',
    situation: 'bed',
    title: 'Elevated Knee Rest',
    subtitle: 'Relieves lower back pressure when lying flat',
    description:
      'Lie on your back with two standard pillows or a soft folded duvet stacked underneath your knees, letting your legs rest with a slight bend.',
    cushionTip: 'Having your knees elevated allows your lower back to settle flat against the mattress.',
    gentleGuidance: 'Stay here for as long as feels good. You can rest a warm compress on your lower belly.',
  },

  // Sofa
  {
    id: 'sofa-recline',
    situation: 'sofa',
    title: 'Supported Sofa Recline',
    subtitle: 'Comfortable semi-seated rest during the day',
    description:
      'Lean back into the sofa corner with generous pillow support behind your upper and lower back. Draw your feet up onto the sofa cushions with knees bent loosely to one side.',
    cushionTip: 'Place a small cushion under your lower ribs to avoid slouching or hunching.',
    gentleGuidance: 'A cozy choice for watching a movie or resting when lying completely flat feels too heavy.',
  },
  {
    id: 'sofa-chest-support',
    situation: 'sofa',
    title: 'Forward Cushion Embrace',
    subtitle: 'Warmth and counter-pressure while resting on a couch',
    description:
      'Kneel or sit sideways on the sofa and lean your upper body forward onto a stack of soft cushions, resting your cheek on the side.',
    cushionTip: 'Stack two cushions so your chest is fully supported without twisting your neck.',
    gentleGuidance: 'Allow your belly to be completely soft and relaxed against the cushions.',
  },

  // Desk / Studying / Working
  {
    id: 'desk-cushion-lean',
    situation: 'desk',
    title: 'Desk Forward Lean',
    subtitle: 'Quiet rest during study or work breaks',
    description:
      'Place a soft jacket, sweater, or cushion on your desk in front of you. Fold your arms over it and rest your forehead gently on your forearms for a few minutes.',
    cushionTip: 'Fold a thick scarf or sweater if a dedicated cushion is not available.',
    gentleGuidance: 'Take 2–3 minutes to let your shoulders drop away from your ears and soften your jaw.',
  },
  {
    id: 'desk-lumbar-ground',
    situation: 'desk',
    title: 'Grounded Seated Posture',
    subtitle: 'Reduces pelvic strain while sitting at a computer',
    description:
      'Sit fully back in your chair with a small cushion behind your lower back. Rest both feet flat on the floor or on a small footstool or binder.',
    cushionTip: 'Slightly elevating your feet reduces tension in the hip flexors.',
    gentleGuidance: 'Try this if you need to be at your desk. Stand up and take a gentle 30-second walk every hour if you can.',
  },

  // Travelling
  {
    id: 'travel-seated-support',
    situation: 'travel',
    title: 'Travel Lumbar Support',
    subtitle: 'Comfort on trains, buses, or flights',
    description:
      'Roll a light jacket, cardigan, or travel pillow and place it firmly at your lower back curve. Rest your hands loosely in your lap with a warm drink or heat patch.',
    cushionTip: 'A rolled scarf or sweatshirt provides customized lower back support.',
    gentleGuidance: 'Focus on gentle, slow breaths down into your lower abdomen during transit.',
  },
  {
    id: 'travel-knee-cross',
    situation: 'travel',
    title: 'Low-Angle Foot Rest',
    subtitle: 'Eases sitting fatigue in tight seats',
    description:
      'Place your backpack or personal item under your feet to act as an impromptu footrest, lifting your knees slightly above hip level.',
    cushionTip: 'Even 2–3 inches of foot elevation softens abdominal muscle engagement.',
    gentleGuidance: 'Adjust whenever you feel pressure shift. Wear loose, non-restrictive waistbands.',
  },

  // Sleeping
  {
    id: 'sleep-side-body',
    situation: 'sleep',
    title: 'Full Body Alignment',
    subtitle: 'For restful night sleep during painful nights',
    description:
      'Lie on your side with a medium pillow between your knees and your top arm draped comfortably over a second body pillow.',
    cushionTip: 'A full-length body pillow prevents your upper hip from twisting forward during the night.',
    gentleGuidance: 'If one side feels tender, gently shift to the other side. Keep a glass of water and comfort items nearby.',
  },
  {
    id: 'sleep-supine-cradle',
    situation: 'sleep',
    title: 'Supine Pelvic Cradle',
    subtitle: 'When side sleeping causes pressure',
    description:
      'Sleep on your back with a firm pillow under your knees and a low, soft pillow under your head so your neck stays relaxed.',
    cushionTip: 'Keep your knees slightly parted to let your inner thighs and pelvic floor relax completely.',
    gentleGuidance: 'Try this position if it feels comfortable. A soft, warm blanket adds soothing weight.',
  },
];

const situations: { key: SituationKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'bed', label: 'In Bed', icon: Bed },
  { key: 'sofa', label: 'On the Sofa', icon: Sofa },
  { key: 'desk', label: 'Studying & Desk', icon: Laptop },
  { key: 'travel', label: 'Travelling', icon: Car },
  { key: 'sleep', label: 'Night Sleep', icon: Moon },
];

export default function ComfortPage() {
  const [activeSituation, setActiveSituation] = useState<SituationKey>('bed');
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const filteredPositions = positions.filter((p) => p.situation === activeSituation);

  return (
    <div className="space-y-5 pb-10 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Comfort Positions</span>
        </h1>
        <p className="text-sm text-muted-fg">
          Restful body positions tailored to where you are right now. Try any position that feels soothing for your body.
        </p>
      </div>

      {/* Situation Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {situations.map((sit) => {
          const Icon = sit.icon;
          const isActive = activeSituation === sit.key;
          return (
            <button
              key={sit.key}
              onClick={() => setActiveSituation(sit.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-primary text-primary-fg shadow-soft font-bold'
                  : 'bg-muted/40 hover:bg-muted text-foreground border border-border/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sit.label}</span>
            </button>
          );
        })}
      </div>

      {/* Positions Grid */}
      <div className="space-y-4">
        {filteredPositions.map((pos) => (
          <div
            key={pos.id}
            className="p-5 sm:p-6 rounded-3xl border border-border bg-card/60 backdrop-blur-sm space-y-3"
          >
            <div>
              <h2 className="text-base font-bold text-foreground">{pos.title}</h2>
              <p className="text-xs text-primary font-medium mt-0.5">{pos.subtitle}</p>
            </div>

            <p className="text-xs text-muted-fg leading-relaxed">
              {pos.description}
            </p>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground space-y-1">
              <span className="font-semibold text-primary block">Pillow & Cushion Tip:</span>
              <p className="text-muted-fg text-[11px] leading-relaxed">{pos.cushionTip}</p>
            </div>

            <p className="text-[11px] text-muted-fg/90 italic pt-1">
              {pos.gentleGuidance}
            </p>
          </div>
        ))}
      </div>

      {/* Mindful Breathing Pocket */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Gentle Belly Breathing
            </h3>
          </div>
          <button
            onClick={() => setBreathingActive(!breathingActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              breathingActive
                ? 'bg-primary text-primary-fg shadow-soft'
                : 'bg-muted/70 text-foreground hover:bg-muted border border-border'
            }`}
          >
            {breathingActive ? 'Stop' : 'Start 4-4-4 Rhythm'}
          </button>
        </div>

        <p className="text-xs text-muted-fg leading-relaxed">
          Slow, diaphragmatic breathing gently massages the abdominal organs and helps down-regulate pain sensitivity.
        </p>

        {breathingActive && (
          <div className="py-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto text-xs font-bold animate-pulse">
              Breathe
            </div>
            <p className="text-xs text-muted-fg">Inhale for 4s • Hold for 4s • Exhale for 4s</p>
          </div>
        )}
      </div>

      {/* Non-medical Guidance Notice */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-[11px] text-muted-fg leading-relaxed">
        <p>
          These comfort positions are gentle relaxation suggestions based on ergonomic body support. They are not medical treatments. If a position causes any sharp or sudden discomfort, immediately return to your natural posture.
        </p>
      </div>
    </div>
  );
}
