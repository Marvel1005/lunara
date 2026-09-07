'use client';

import React from 'react';
import { getSeverityDescriptor } from '@/lib/types/pain';

interface PainMeterProps {
  value: number; // 0 to 10
  onChange: (val: number) => void;
  disabled?: boolean;
}

export function PainMeter({ value, onChange, disabled = false }: PainMeterProps) {
  const descriptor = getSeverityDescriptor(value);

  const getEmpatheticFeedback = (val: number) => {
    if (val === 0) return "No pain right now. Glad you're feeling comfortable.";
    if (val <= 3) return "Mild discomfort. Taking it easy can help.";
    if (val <= 6) return "Okay, I hear you. Let's find something gentle to soothe this.";
    if (val <= 8) return "That's a lot. Let's rest in a supportive position.";
    return "Significant discomfort. We're here with you. Please rest and consider consulting a professional if needed.";
  };

  return (
    <div className="space-y-5 select-none">
      {/* Big Display Card */}
      <div className="flex flex-col items-center justify-center p-5 rounded-3xl card-depth-secondary text-center space-y-1.5">
        <span className="text-xs font-bold text-primary">
          How much does it hurt?
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
            {value}
          </span>
          <span className="text-sm font-semibold text-muted-fg">/ 10</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${descriptor.badgeBg}`}>
          {descriptor.label}
        </span>
        <p className="text-xs text-muted-fg max-w-sm leading-relaxed pt-1 font-medium">
          &quot;{getEmpatheticFeedback(value)}&quot;
        </p>
      </div>

      {/* 5-Bucket Range Guidance Indicator */}
      <div className="grid grid-cols-5 gap-1 text-[10px] font-semibold text-center text-muted-fg">
        <div className={`p-1 rounded-lg ${value === 0 ? 'bg-emerald-500/10 text-emerald-700 font-bold' : ''}`}>Nothing (0)</div>
        <div className={`p-1 rounded-lg ${value >= 1 && value <= 3 ? 'bg-blue-500/10 text-blue-700 font-bold' : ''}`}>Mild (1–3)</div>
        <div className={`p-1 rounded-lg ${value >= 4 && value <= 6 ? 'bg-amber-500/10 text-amber-700 font-bold' : ''}`}>Moderate (4–6)</div>
        <div className={`p-1 rounded-lg ${value >= 7 && value <= 8 ? 'bg-rose-500/10 text-rose-700 font-bold' : ''}`}>Strong (7–8)</div>
        <div className={`p-1 rounded-lg ${value >= 9 ? 'bg-purple-500/10 text-purple-700 font-bold' : ''}`}>Very strong (9–10)</div>
      </div>

      {/* Horizontal Slider (Thumb-Friendly Track) */}
      <div className="space-y-1.5 px-1">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          aria-label="How much does it hurt scale from 0 to 10"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={10}
          className="w-full h-4 rounded-lg accent-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 touch-none"
        />
      </div>

      {/* Quick-Tap Buttons for Phones */}
      <div>
        <span className="block text-[11px] font-semibold text-muted-fg mb-1.5 text-center">
          Tap a number directly:
        </span>
        <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
          {Array.from({ length: 11 }, (_, i) => i).map((num) => {
            const isSelected = value === num;
            return (
              <button
                type="button"
                key={num}
                onClick={() => onChange(num)}
                disabled={disabled}
                aria-label={`Select pain level ${num}`}
                className={`h-11 sm:h-12 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer min-w-0 tactile-button ${
                  isSelected
                    ? 'bg-primary text-primary-fg shadow-comfort scale-110 ring-2 ring-primary/40'
                    : 'bg-muted/50 hover:bg-muted text-foreground border border-border/60'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
