'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeSelector } from '@/components/theme/theme-selector';
import { createClient } from '@/lib/supabase/client';
import { useCycleSettings } from '@/lib/hooks/use-cycle';
import { useAuth } from '@/providers/auth-provider';
import {
  User,
  ShieldCheck,
  LogOut,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Palette,
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

  const { user, userName } = useAuth();

  const createdDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active Member';

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
      else setSaveError('Failed to save settings.');
    }
  };

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
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-fg mt-0.5">Manage your account, cycle preferences, and atmosphere.</p>
      </div>

      {/* 1. ACCOUNT & PROFILE WITH SIMPLE SIGN OUT */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Account</h2>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer border border-rose-200/40"
            title="Sign out of your Lunara account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach flex items-center justify-center text-base font-bold text-lunara-plum shadow-soft border border-white shrink-0">
            {userInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground truncate">{userInfo.name}</h3>
            <p className="text-xs text-muted-fg truncate">{userInfo.email}</p>
            <span className="inline-block text-[10px] font-medium text-primary px-2 py-0.5 rounded-full bg-primary-soft mt-1">
              {userInfo.createdAt}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CYCLE PARAMETERS */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border border-border space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sliders className="w-4 h-4 text-primary" />
          <div>
            <h2 className="text-sm font-bold text-foreground">Cycle Parameters</h2>
            <p className="text-[11px] text-muted-fg">Personalize your calculation averages.</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Cycle settings saved successfully.</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSaveCycleSettings} className="space-y-4">
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
              className="w-full accent-primary cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-muted-fg mt-0.5">
              <span>21 days</span>
              <span>28 days (typical)</span>
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
              className="w-full accent-primary cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-muted-fg mt-0.5">
              <span>2 days</span>
              <span>5 days (typical)</span>
              <span>10 days</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isUpdating ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Parameters</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. THEME & ATMOSPHERE */}
      <div className="glass-panel p-5 rounded-2xl shadow-soft border border-border space-y-3">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Palette className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Sanctuary Atmosphere</h2>
        </div>
        <ThemeSelector />
      </div>

      {/* 4. PRIVACY FOOTER NOTE */}
      <div className="flex items-center justify-center gap-2 p-3 text-xs text-muted-fg text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Your cycle and body data is privately encrypted and accessible only to you.</span>
      </div>
    </div>
  );
}
