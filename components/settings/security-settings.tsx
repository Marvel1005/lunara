'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/auth-provider';

const MIN_PASSWORD_LENGTH = 8;

/**
 * One-time password setup. Passwords are owned entirely by Supabase Auth
 * (updateUser) — never stored in app tables, state, or storage. A boolean
 * flag on the profile records only THAT a password exists, so the UI can
 * show "Set" once and "Change" afterwards. Magic-link login keeps working.
 */
export function SecuritySettings() {
  const { profile, refreshProfile } = useAuth();
  const hasPassword = profile?.password_set === true;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ password_set: true }).eq('id', user.id);
      }
      await refreshProfile();
      setPassword('');
      setConfirm('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl shadow-soft border border-border space-y-4">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <div>
          <h2 className="text-sm font-bold text-foreground">Security</h2>
          <p className="text-[11px] text-muted-fg">
            {hasPassword
              ? 'A password is set on your account. You can change it below.'
              : 'You sign in with magic links. Optionally set a password as well.'}
          </p>
        </div>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{hasPassword ? 'Password changed successfully.' : 'Password set successfully.'}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="new-password" className="block text-xs font-semibold text-foreground mb-1.5">
            {hasPassword ? 'New password' : 'Set password'}
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-semibold text-foreground mb-1.5">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat the password"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving || !password || !confirm}
            className="px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold shadow-soft hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <span className="animate-pulse">Saving…</span> : hasPassword ? 'Change Password' : 'Set Password'}
          </button>
        </div>
      </form>

      <p className="text-[11px] text-muted-fg leading-relaxed">
        Magic-link sign-in keeps working whether or not you set a password.
      </p>
    </div>
  );
}
