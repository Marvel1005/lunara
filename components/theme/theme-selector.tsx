'use client';

import React from 'react';
import { useTheme } from '@/providers/theme-provider';
import { getThemeConfig } from '@/lib/theme/theme-config';
import { ThemeStyle } from '@/lib/cycle/types';
import { Check, Heart } from 'lucide-react';

const activeThemeKeys: ThemeStyle[] = [
  'warm-minimal',
  'soft-floral',
  'cute-cozy',
  'lavender-dream',
  'peach-calm',
  'midnight-comfort',
];

export function ThemeSelector() {
  const {
    themeStyle,
    setThemeStyle,
    autoComfortMode,
    setAutoComfortMode,
  } = useTheme();

  return (
    <div className="space-y-4">
      {/* Auto Comfort Mode Control Switch */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Automatic Comfort Mode</h3>
            <p className="text-[11px] text-muted-fg mt-0.5">
              Softens colors into a warmer sanctuary during your period.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAutoComfortMode(!autoComfortMode)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            autoComfortMode ? 'bg-primary' : 'bg-muted-fg/30'
          }`}
          role="switch"
          aria-checked={autoComfortMode}
          aria-label="Automatic Comfort Mode toggle"
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              autoComfortMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Theme Cards Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground block">
          Visual Atmosphere
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {activeThemeKeys.map((key) => {
            const config = getThemeConfig(key);
            const isSelected = themeStyle === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setThemeStyle(key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary/50'
                    : 'border-border bg-card hover:bg-muted/40 hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">{config.emoji}</span>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {config.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-fg flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Color Swatch Dots */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: config.palette.primary }}
                    title="Primary"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: config.palette.accent }}
                    title="Accent"
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: config.palette.bg }}
                    title="Background"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
