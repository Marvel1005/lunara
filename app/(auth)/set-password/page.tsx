'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasswordInput, validatePassword, passwordStrength } from '@/components/password-input';

const STRENGTH_COLORS = ['bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Users who already have a password (or no session) don't belong here.
  useEffect(() => {
    async function guard() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setEmail(user.email ?? null);
      const metaName =
        typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('password_set, name')
        .eq('id', user.id)
        .maybeSingle();
      if ((profile as { password_set?: boolean } | null)?.password_set === true) {
        router.replace('/dashboard');
        return;
      }
      setName(metaName ?? (profile as { name?: string } | null)?.name ?? null);
      setChecking(false);
    }
    guard();
  }, [router]);

  const strength = passwordStrength(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ruleError = validatePassword(password, { email, name });
    if (ruleError) {
      setError(ruleError);
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
        await supabase
          .from('profiles')
          .upsert({ id: user.id, password_set: true }, { onConflict: 'id' });
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="space-y-4 animate-pulse" aria-label="Loading">
        <div className="h-6 rounded-xl bg-muted/50" />
        <div className="h-[52px] rounded-2xl bg-muted/40" />
        <div className="h-[52px] rounded-2xl bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span>Secure your account</span>
        </h2>
        <p className="text-xs text-muted-fg leading-relaxed">
          One last step before you continue: choose a strong password for your Lunara account.
          You can still sign in with an email code if you ever need to.
        </p>
      </div>

      {error && (
        <div
          className="p-3 rounded-2xl bg-danger/10 border border-danger/20 text-danger-fg text-xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <PasswordInput
            id="set-password"
            label="Choose password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Upper, lower, number, symbol — 8+ chars"
          />
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < strength.score ? STRENGTH_COLORS[strength.score - 1] : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-fg">
                Strength: <span className="font-semibold text-foreground">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        <PasswordInput
          id="set-password-confirm"
          label="Confirm password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat the password"
          error={mismatch ? 'Passwords do not match.' : undefined}
        />

        <button
          type="submit"
          disabled={saving || !password || !confirm || mismatch}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="animate-pulse">Securing…</span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Set password & continue
            </span>
          )}
        </button>
      </form>

      <p className="text-[11px] text-muted-fg leading-relaxed text-center">
        Use at least 8 characters with upper and lowercase letters, a number, and a symbol.
      </p>
    </div>
  );
}
