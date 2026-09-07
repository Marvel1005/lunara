'use client';

import React from 'react';
import { useTheme } from '@/providers/theme-provider';

interface ThemeDecorationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ThemeCornerDecor: Elegant, low-opacity, non-intrusive theme-specific corner accent graphics.
 * - Soft Floral: Delicate botanical flower & leaf vines
 * - Cute & Cozy: Soft rounded hearts, clouds, and cozy sparkles
 * - Lavender Dream: Crescent moon, sparkling stars, and constellation dots
 * - Peach Calm: Gentle warm sunburst & organic leaf curves
 * - Warm Minimal: Ultra-clean, subtle organic arc line
 * - Midnight Comfort: Nocturnal crescent moon & starlight dust
 */
export const ThemeCornerDecor = React.memo(function ThemeCornerDecor({ className = '', size = 'md' }: ThemeDecorationProps) {
  const { themeStyle } = useTheme();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }[size];

  if (themeStyle === 'soft-floral') {
    return (
      <svg
        className={`pointer-events-none opacity-45 text-primary ${sizeClasses} ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Botanical Vine & Eucalyptus Leaves */}
        <path d="M10 90 Q35 70 70 85 Q90 92 95 75" strokeWidth="1.3" />
        <path d="M25 80 Q12 68 18 55 Q30 65 25 80 Z" fill="currentColor" fillOpacity="0.12" />
        <path d="M45 76 Q52 60 65 65 Q58 80 45 76 Z" fill="currentColor" fillOpacity="0.14" />
        <path d="M68 83 Q82 72 85 82 Q74 90 68 83 Z" fill="currentColor" fillOpacity="0.10" />

        {/* Detailed 5-Petal Flower Blossom */}
        <g transform="translate(50, 32)">
          <path d="M0 -18 C5 -26, 18 -18, 10 -8 C18 -2, 12 12, 0 8 C-12 12, -18 -2, -10 -8 C-18 -18, -5 -26, 0 -18 Z" fill="currentColor" fillOpacity="0.10" />
          <circle cx="0" cy="-5" r="3.5" fill="currentColor" fillOpacity="0.35" />
          {/* Petal Veins */}
          <path d="M0 -5 L0 -15 M0 -5 L8 -10 M0 -5 L6 4 M0 -5 L-6 4 M0 -5 L-8 -10" strokeWidth="0.8" opacity="0.5" />
        </g>

        {/* Small Flower Buds & Petal Dust */}
        <circle cx="82" cy="22" r="2.5" fill="currentColor" fillOpacity="0.4" />
        <circle cx="90" cy="32" r="1.8" fill="currentColor" fillOpacity="0.3" />
        <path d="M82 22 L86 28" strokeWidth="1" opacity="0.4" />
        <circle cx="22" cy="35" r="1.5" fill="currentColor" fillOpacity="0.3" />
      </svg>
    );
  }

  if (themeStyle === 'cute-cozy') {
    return (
      <svg
        className={`pointer-events-none opacity-50 text-primary ${sizeClasses} ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Puffy Cozy Cloud */}
        <path
          d="M12 78 C8 78, 5 72, 8 66 C6 60, 12 54, 18 55 C22 45, 36 44, 42 52 C48 46, 62 48, 64 58 C72 58, 76 66, 72 74 C74 78, 68 82, 60 80 H15 C12 80, 10 79, 12 78 Z"
          fill="currentColor"
          fillOpacity="0.10"
        />

        {/* Cute Floating Hearts */}
        <g transform="translate(62, 28) scale(0.85)">
          <path
            d="M15 10 C10 2, 0 5, 4 15 L15 25 L26 15 C30 5, 20 2, 15 10 Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
        </g>
        <g transform="translate(20, 22) scale(0.6)">
          <path
            d="M15 10 C10 2, 0 5, 4 15 L15 25 L26 15 C30 5, 20 2, 15 10 Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
        </g>

        {/* Ribbon Bow Accent */}
        <path d="M42 32 C35 25, 28 32, 38 38 Z" fill="currentColor" fillOpacity="0.18" />
        <path d="M42 32 C49 25, 56 32, 46 38 Z" fill="currentColor" fillOpacity="0.18" />
        <circle cx="42" cy="34" r="2" fill="currentColor" fillOpacity="0.4" />

        {/* Sparkle Twinkles */}
        <path d="M82 16 L84 10 L86 16 L92 18 L86 20 L84 26 L82 20 L76 18 Z" fill="currentColor" fillOpacity="0.4" />
      </svg>
    );
  }

  if (themeStyle === 'lavender-dream') {
    return (
      <svg
        className={`pointer-events-none opacity-45 text-primary ${sizeClasses} ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Crescent Moon */}
        <path
          d="M55 20 A 25 25 0 1 0 75 60 A 20 20 0 1 1 55 20 Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        {/* Constellation Dots & Lines */}
        <circle cx="25" cy="30" r="2" fill="currentColor" fillOpacity="0.5" />
        <circle cx="40" cy="20" r="1.5" fill="currentColor" fillOpacity="0.5" />
        <circle cx="20" cy="55" r="2" fill="currentColor" fillOpacity="0.5" />
        <path d="M25 30 L40 20 M25 30 L20 55" strokeDasharray="2 2" strokeWidth="1" />
        {/* Star Sparkle */}
        <path d="M75 25 L77 20 L79 25 L84 27 L79 29 L77 34 L75 29 L70 27 Z" fill="currentColor" fillOpacity="0.4" />
      </svg>
    );
  }

  if (themeStyle === 'peach-calm') {
    return (
      <svg
        className={`pointer-events-none opacity-40 text-primary ${sizeClasses} ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Sunburst Rays */}
        <circle cx="35" cy="35" r="14" fill="currentColor" fillOpacity="0.12" />
        <path d="M35 12 V17 M35 53 V58 M12 35 H17 M53 35 H58 M19 19 L23 23 M47 47 L51 51 M19 51 L23 47 M47 23 L51 19" strokeWidth="1.4" opacity="0.6" />
        {/* Soft Organic Leaf Curve */}
        <path d="M40 75 Q60 50 85 60 Q70 85 40 75 Z" fill="currentColor" fillOpacity="0.12" />
      </svg>
    );
  }

  if (themeStyle === 'warm-minimal') {
    return (
      <svg
        className={`pointer-events-none opacity-30 text-primary ${sizeClasses} ${className}`}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Clean Arc & Minimal Dots */}
        <path d="M20 80 Q50 20 80 50" strokeWidth="1.2" />
        <circle cx="80" cy="50" r="3" fill="currentColor" fillOpacity="0.3" />
        <circle cx="35" cy="35" r="1.5" fill="currentColor" fillOpacity="0.2" />
      </svg>
    );
  }

  // Midnight Comfort
  return (
    <svg
      className={`pointer-events-none opacity-50 text-primary ${sizeClasses} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Night Sky Crescent & Glow */}
      <path
        d="M50 22 A 24 24 0 1 0 72 62 A 19 19 0 1 1 50 22 Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle cx="28" cy="35" r="1.5" fill="currentColor" fillOpacity="0.7" />
      <circle cx="82" cy="30" r="2" fill="currentColor" fillOpacity="0.7" />
      <circle cx="35" cy="70" r="1.5" fill="currentColor" fillOpacity="0.6" />
      {/* Cross Starlight */}
      <path d="M70 70 L72 65 L74 70 L79 72 L74 74 L72 79 L70 74 L65 72 Z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
});


/**
 * ThemeCardDecor: Accent doodle strip for primary cards and hero panels.
 */
export function ThemeCardDecor({ className = '' }: { className?: string }) {
  const { themeStyle } = useTheme();

  return (
    <div className={`absolute top-0 right-0 p-3 pointer-events-none overflow-hidden ${className}`}>
      <ThemeCornerDecor size="md" />
    </div>
  );
}

/**
 * ThemeEmptyStateDecor: Rich theme-tailored empty state visual illustration component.
 */
export function ThemeEmptyStateDecor({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  const { themeStyle } = useTheme();

  const getEmoji = () => {
    switch (themeStyle) {
      case 'soft-floral':
        return '🌸';
      case 'cute-cozy':
        return '🧸';
      case 'lavender-dream':
        return '🌙';
      case 'peach-calm':
        return '🌅';
      case 'midnight-comfort':
        return '✨';
      default:
        return '🌿';
    }
  };

  return (
    <div className="card-depth-secondary p-8 sm:p-12 text-center rounded-4xl relative overflow-hidden flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-6 border border-border">
      <ThemeCornerDecor size="lg" className="absolute -top-4 -right-4" />

      <div className="w-16 h-16 rounded-3xl bg-primary-soft/80 text-primary flex items-center justify-center text-3xl shadow-soft border border-primary/20 animate-gentle-pulse">
        {getEmoji()}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-fg leading-relaxed">{description}</p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/**
 * ThemeBadge: Reusable theme-colored badge component.
 */
export function ThemeBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20 shadow-xs ${className}`}>
      {children}
    </span>
  );
}
