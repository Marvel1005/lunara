'use client';

import React from 'react';
import { useTheme } from '@/providers/theme-provider';
import { useCycleSummary } from '@/lib/hooks/use-cycle';
import { useAuth } from '@/providers/auth-provider';
import { Sparkles, Heart, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName: initialName }: HeaderProps) {
  const router = useRouter();
  const { isComfortMode, autoComfortMode, setAutoComfortMode } = useTheme();
  const { cycleSummary } = useCycleSummary();
  const { userName: authUserName } = useAuth();

  const userName = initialName || authUserName || 'there';

  const phaseLabel = cycleSummary.isPeriod
    ? `Period Day ${cycleSummary.periodDay || 1}`
    : cycleSummary.phaseName;

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-header px-4 lg:px-8 py-2.5 transition-colors duration-300">
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
        <div className="flex items-center gap-2 sm:gap-2.5">
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
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[11px] font-bold text-primary-fg shadow-soft border border-white"
            title={`Signed in as ${userName}`}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          {/* Simple Direct Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 transition-colors border border-rose-200/40 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
