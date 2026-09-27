'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MedicalDisclaimerProps {
  variant?: 'short' | 'full' | 'severe';
}

/**
 * Single source of truth for the medical disclaimer. Three registers:
 * - short: one line under tracking features (pain page, partner tips)
 * - full: the complete guidance block (relief page)
 * - severe: urgent wording shown only for high-severity pain
 */
export function MedicalDisclaimer({ variant = 'short' }: MedicalDisclaimerProps) {
  if (variant === 'severe') {
    return (
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Your pain is marked as severe. If pain is sudden, persistent, or worsening,
          please consult a medical professional.
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-300 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Care & Safety Guidance</span>
        </div>
        <p className="text-xs text-amber-900/90 leading-relaxed">
          Lunara provides general comfort strategies for everyday cycle wellbeing and does not
          provide medical diagnoses or prescriptions. If your pain is unusually severe, sudden,
          worsening, persistent, or accompanied by symptoms such as fever or dizziness, please
          seek evaluation from a qualified healthcare professional.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 space-y-1.5">
      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>Care & Safety Guidance</span>
      </div>
      <p className="text-[11px] text-amber-900/90 leading-relaxed">
        Lunara pain check-ins are for personal comfort tracking. If your pain is unusually
        severe, sudden, or persistent, please consult a healthcare professional.
      </p>
    </div>
  );
}
