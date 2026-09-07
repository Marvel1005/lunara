'use client';

import React from 'react';
import { useTheme } from '@/providers/theme-provider';

/**
 * ThemeBackground: Renders theme-aware ambient background elements (soft gradients, floating atmosphere particles, subtle glows)
 * matching the selected visual personality and active Comfort Mode state.
 */
export const ThemeBackground = React.memo(function ThemeBackground() {
  const { themeStyle, isComfortMode } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none" aria-hidden="true">
      {/* Soft Floral Atmosphere */}
      {themeStyle === 'soft-floral' && (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-bl from-rose-200/30 via-emerald-100/20 to-transparent blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-100/30 to-transparent blur-3xl" />
          {isComfortMode && (
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-rose-300/15 blur-3xl" />
          )}
        </>
      )}

      {/* Cute & Cozy Atmosphere */}
      {themeStyle === 'cute-cozy' && (
        <>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-pink-200/35 via-orange-100/25 to-transparent blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-peach-200/30 to-transparent blur-3xl" />
          {isComfortMode && (
            <div className="absolute inset-0 bg-rose-500/5 backdrop-blur-[1px]" />
          )}
        </>
      )}

      {/* Lavender Dream Atmosphere */}
      {themeStyle === 'lavender-dream' && (
        <>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-bl from-purple-200/35 via-indigo-100/20 to-transparent blur-3xl" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-violet-100/30 to-transparent blur-3xl" />
          {isComfortMode && (
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-300/15 blur-3xl" />
          )}
        </>
      )}

      {/* Peach Calm Atmosphere */}
      {themeStyle === 'peach-calm' && (
        <>
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-orange-200/30 via-amber-100/25 to-transparent blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-100/25 to-transparent blur-3xl" />
          {isComfortMode && (
            <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-orange-300/15 blur-3xl" />
          )}
        </>
      )}

      {/* Warm Minimal Atmosphere */}
      {themeStyle === 'warm-minimal' && (
        <>
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-stone-100/40 to-transparent blur-3xl" />
          {isComfortMode && (
            <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-rose-100/30 blur-3xl" />
          )}
        </>
      )}

      {/* Midnight Comfort Atmosphere */}
      {themeStyle === 'midnight-comfort' && (
        <>
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-purple-900/30 via-violet-950/20 to-transparent blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-950/40 to-transparent blur-3xl" />
          {isComfortMode && (
            <div className="absolute inset-0 bg-rose-950/10 backdrop-blur-[1px]" />
          )}
        </>
      )}
    </div>
  );
});

