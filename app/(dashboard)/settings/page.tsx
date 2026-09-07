'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeSelector } from '@/components/theme/theme-selector';
import { createClient } from '@/lib/supabase/client';
import { env } from '@/lib/env';
import { ThemeMode } from '@/lib/cycle/types';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { useAuth } from '@/providers/auth-provider';
import {
  User,
  Palette,
  ShieldCheck,
  LogOut,
  Sparkles,
  Database,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, isUpdating } = useCycleSettings();

  const [cycleLength, setCycleLength] = useState<number>(settings.average_cycle_length || 28);
  const [periodLength, setPeriodLength] = useState<number>(settings.average_period_length || 5);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setCycleLength(settings.average_cycle_length || 28);
      setPeriodLength(settings.average_period_length || 5);
    }
  }, [settings]);

  const { user, profile, userName } = useAuth();

  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Session';

  const userInfo = {
    name: userName,
    email: user?.email || 'Active Lunara Member',
    createdAt: `Member since ${createdDate}`,
  };

  const handleSaveCycleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (cycleLength < 21 || cycleLength > 45) {
      setSaveError('Cycle length must be between 21 and 45 days.');
      return;
    }
    if (periodLength < 2 || periodLength > 10) {
      setSaveError('Period length must be between 2 and 10 days.');
      return;
    }
    if (periodLength >= cycleLength) {
      setSaveError('Period length must be less than total cycle length.');
      return;
    }

    try {
      await updateSettings({
        average_cycle_length: cycleLength,
        average_period_length: periodLength,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setSaveError(err.message);
      else setSaveError('Failed to save settings to Supabase.');
    }
  };

  const themeOptions: { mode: ThemeMode; label: string; desc: string; color: string }[] = [
    { mode: 'normal', label: 'Default Sanctuary', desc: 'Warm cream & muted rose', color: 'bg-[#FDFBF7] text-[#2D2628] border-border' },
    { mode: 'comfort', label: 'Comfort Mode (Period)', desc: 'Soft dusty rose & deep plum', color: 'bg-[#FCF5F3] text-[#342227] border-rose-300' },
    { mode: 'pre-period', label: 'Pre-period (Luteal)', desc: 'Grounding muted lavender', color: 'bg-[#FAF6F8] text-[#2E252E] border-purple-200' },
    { mode: 'post-period', label: 'Post-period (Follicular)', desc: 'Fresh mint & soft green', color: 'bg-[#F7FAF8] text-[#222E27] border-emerald-200' },
    { mode: 'ovulation', label: 'Ovulation (Fertile)', desc: 'Bright radiant gold & peach', color: 'bg-[#FDF9F3] text-[#312A20] border-amber-200' },
  ];

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
    <div className="space-y-8 max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Sanctuary Preferences</h1>
        <p className="text-sm text-muted-fg mt-1">Manage your profile, theme experience, and account privacy.</p>
      </div>

      {/* 1. PROFILE SECTION */}
      <div className="glass-panel p-6 sm:p-7 rounded-4xl shadow-soft border border-border space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Profile Overview</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach flex items-center justify-center text-xl font-bold text-lunara-plum shadow-comfort border-2 border-white">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{userInfo.name}</h3>
            <p className="text-xs text-muted-fg">{userInfo.email}</p>
            <span className="inline-block text-[10px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft mt-1">
              {userInfo.createdAt}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CYCLE PARAMETERS SECTION */}
      <div className="glass-panel p-6 sm:p-7 rounded-4xl shadow-soft border border-border space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <Sliders className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Cycle Parameters</h2>
            <p className="text-xs text-muted-fg">Customize cycle calculation averages stored in Supabase.</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Cycle parameters saved successfully to Supabase.</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSaveCycleSettings} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-foreground">Average Cycle Length</label>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
                {cycleLength} days
              </span>
            </div>
            <input
              type="range"
              min={21}
              max={45}
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-fg mt-1">
              <span>21 days</span>
              <span>28 days</span>
              <span>45 days</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-foreground">Average Period Duration</label>
              <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
                {periodLength} days
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-fg mt-1">
              <span>2 days</span>
              <span>5 days</span>
              <span>10 days</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Cycle Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. THEME ENGINE SECTION */}
      <div className="space-y-4">
        <ThemeSelector />
      </div>

      {/* 3. ENVIRONMENT & DATABASE STATUS */}
      <div className="glass-panel p-6 sm:p-7 rounded-4xl shadow-soft border border-border space-y-4">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Database & Security Infrastructure</h2>
            <p className="text-xs text-muted-fg">Supabase Row Level Security (RLS) & single source of truth verification.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground">Supabase Connection</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${env.isConfigured ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}`}>
                {env.isConfigured ? 'Connected' : 'Environment Pending'}
              </span>
            </div>
            <p className="text-muted-fg">
              {env.isConfigured
                ? 'Valid Supabase project URL & anon key initialized.'
                : 'Populate NEXT_PUBLIC_SUPABASE_URL in .env.local to link live PostgreSQL database.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground">Row Level Security</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700">
                Active Policy
              </span>
            </div>
            <p className="text-muted-fg">
              All 10 core PostgreSQL tables enforce strict `auth.uid() = user_id` access controls.
            </p>
          </div>
        </div>
      </div>

      {/* 4. ACCOUNT ACTIONS & SIGN OUT */}
      <div className="glass-panel p-6 sm:p-7 rounded-4xl shadow-soft border border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-foreground">Private & Protected Account</h3>
            <p className="text-xs text-muted-fg">Your cycle and body data is encrypted and accessible only to you.</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500/10 text-rose-700 text-xs font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
