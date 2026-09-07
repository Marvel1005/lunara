'use client';

import React from 'react';
import { useTheme } from '@/providers/theme-provider';
import { THEME_CONFIGS, getThemeConfig } from '@/lib/theme/theme-config';
import { ThemeStyle } from '@/lib/cycle/types';
import { ThemeCornerDecor } from '@/components/theme/theme-decorations';
import { Sparkles, Check, Heart, Eye } from 'lucide-react';

export function ThemeSelector() {
  const {
    themeStyle,
    setThemeStyle,
    autoComfortMode,
    setAutoComfortMode,
    previewState,
    setPreviewState,
  } = useTheme();

  const activeThemeKeys: ThemeStyle[] = [
    'warm-minimal',
    'soft-floral',
    'cute-cozy',
    'lavender-dream',
    'peach-calm',
    'midnight-comfort',
  ];

  return (
    <div className="space-y-6">
      {/* Auto Comfort Mode Control Switch */}
      <div className="card-depth-primary p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-soft">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Automatic Comfort Mode</h3>
            <p className="text-xs text-muted-fg leading-relaxed mt-0.5">
              Automatically adapt Lunara into a warmer, softer sanctuary during your period days.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAutoComfortMode(!autoComfortMode)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            autoComfortMode ? 'bg-primary' : 'bg-muted-fg/30'
          }`}
          role="switch"
          aria-checked={autoComfortMode}
          aria-label="Automatic Comfort Mode toggle"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              autoComfortMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Selector Header & Live State Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Choose Your Lunara Visual Personality</h2>
          <p className="text-xs text-muted-fg">Select a theme personality that transforms colors, cards, and subtle decorations.</p>
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto bg-muted/40 p-1 rounded-2xl border border-border">
          <span className="text-muted-fg px-2 flex items-center gap-1 font-medium">
            <Eye className="w-3.5 h-3.5 text-primary" /> State:
          </span>
          <button
            onClick={() => setPreviewState(null)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              previewState === null ? 'bg-primary text-primary-fg shadow-soft' : 'text-muted-fg hover:text-foreground'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setPreviewState('comfort')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              previewState === 'comfort' ? 'bg-primary text-primary-fg shadow-soft' : 'text-muted-fg hover:text-foreground'
            }`}
          >
            Comfort Mode
          </button>
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeThemeKeys.map((key) => {
          const config = getThemeConfig(key);
          const isSelected = themeStyle === key;

          return (
            <div
              key={key}
              onClick={() => setThemeStyle(key)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 group ${
                isSelected
                  ? 'ring-2 ring-primary shadow-elevated scale-[1.02] bg-card-bg-elevated'
                  : 'card-depth-secondary hover:scale-[1.01]'
              }`}
            >
              {/* Corner Decorative Motif Accent */}
              <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ThemeCornerDecor size="md" />
              </div>

              {/* Theme Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.emoji}</span>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {config.name}
                      {isSelected && <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />}
                    </h3>
                  </div>
                  <p className="text-[11px] font-semibold text-primary">{config.subtitle}</p>
                  <p className="text-xs text-muted-fg leading-relaxed pt-1">
                    {config.description}
                  </p>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-fg flex items-center justify-center shrink-0 shadow-soft">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Interactive Mini Preview Card */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 relative z-10">
                <div className="flex items-center justify-between text-[11px] text-muted-fg font-medium">
                  <span>Palette & Accent</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: config.palette.primary }}
                      title="Primary Color"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: config.palette.accent }}
                      title="Accent Color"
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: config.palette.bg }}
                      title="Background Atmosphere"
                    />
                  </div>
                </div>

                <div
                  className="py-2 px-3 rounded-xl text-xs font-bold text-center shadow-xs transition-transform group-hover:scale-[1.02]"
                  style={{
                    backgroundColor: config.palette.primary,
                    color: '#ffffff',
                  }}
                >
                  {config.name} Button
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
