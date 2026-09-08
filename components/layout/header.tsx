'use client';

import React from 'react';
import { useTheme } from '@/providers/theme-provider';
import { useCycleSummary } from '@/lib/hooks/use-cycle';
import { useAuth } from '@/providers/auth-provider';
import { Sparkles, Heart } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName: initialName }: HeaderProps) {
  const { isComfortMode, autoComfortMode, setAutoComfortMode } = useTheme();
  const { cycleSummary } = useCycleSummary();
  const { userName: authUserName } = useAuth();

  const userName = initialName || authUserName || 'there';

  const phaseLabel = cycleSummary.isPeriod
    ? `Period Day ${cycleSummary.periodDay || 1}`
    : cycleSummary.phaseName;

  return (
    <header className="sticky top-0 z-30 w-full glass-header px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Mobile Brand Title / Quick Phase indicator */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-primary">Lunara</span>
            <span className="text-xs">🌙</span>
          </div>
          {cycleSummary.hasCycleData && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium border border-border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{phaseLabel}</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Comfort Mode Badge / Auto-Comfort status */}
          <button
            onClick={() => setAutoComfortMode(!autoComfortMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
              isComfortMode
                ? 'bg-primary text-primary-fg shadow-comfort scale-105'
                : 'bg-muted text-muted-fg hover:text-foreground border border-border'
            }`}
            title="Toggle Automatic Comfort Mode"
          >
            <Heart className={`w-3.5 h-3.5 ${isComfortMode ? 'fill-current text-white' : ''}`} />
            <span className="hidden sm:inline">
              {isComfortMode ? 'Comfort Sanctuary Active' : 'Comfort Mode ON'}
            </span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-fg shadow-soft border border-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
