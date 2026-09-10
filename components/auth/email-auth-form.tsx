'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function friendlyEmailError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials'))
    return 'Incorrect email or password. Please try again.';
  if (lower.includes('email not confirmed'))
    return 'Please confirm your email address before signing in. Check your inbox.';
  if (lower.includes('user already registered') || lower.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (lower.includes('password') && lower.includes('short'))
    return 'Password must be at least 6 characters.';
  if (lower.includes('failed to fetch') || lower.includes('network'))
    return 'Network error. Please check your connection and try again.';
  if (lower.includes('rate limit') || lower.includes('too many'))
    return 'Too many attempts. Please wait a few minutes before trying again.';
  return 'Something went wrong. Please try again.';
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────

interface EmailLoginFormProps {
  switchLink: React.ReactNode;
  redirectTo?: string | null;
}

export function EmailLoginForm({ switchLink, redirectTo }: EmailLoginFormProps) {
  const router = useRouter();
  const validTarget =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(friendlyEmailError(signInError.message));
        return;
      }

      if (!data.session) {
        // email confirmation required
        setCheckEmail(true);
        return;
      }

      router.push(validTarget);
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyEmailError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-3xl">📬</div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Check your email</h2>
          <p className="text-xs text-muted-fg leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Open it to complete sign-in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCheckEmail(false); setPassword(''); }}
          className="text-xs text-primary font-semibold hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email-login" className="block text-xs font-semibold text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email-login"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <div>
          <label htmlFor="password-login" className="block text-xs font-semibold text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password-login"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span className="animate-pulse">Signing in…</span> : 'Sign In'}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-border/50">
        {switchLink}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SIGNUP FORM
// ─────────────────────────────────────────────────────────────────────────────

interface EmailSignupFormProps {
  switchLink: React.ReactNode;
  redirectTo?: string | null;
}

export function EmailSignupForm({ switchLink, redirectTo }: EmailSignupFormProps) {
  const router = useRouter();
  const validTarget =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (signUpError) {
        setError(friendlyEmailError(signUpError.message));
        return;
      }

      if (data.session) {
        // Email confirmation disabled — user is logged in immediately
        router.push(validTarget);
        router.refresh();
      } else {
        // Email confirmation required
        setCheckEmail(true);
      }
    } catch (err: unknown) {
      setError(friendlyEmailError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-3xl">📬</div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Confirm your email</h2>
          <p className="text-xs text-muted-fg leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-foreground">{email}</span>.
            Open it to activate your account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setCheckEmail(false); setPassword(''); }}
          className="text-xs text-primary font-semibold hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email-signup-name" className="block text-xs font-semibold text-foreground mb-1.5">
            Your name
          </label>
          <input
            id="email-signup-name"
            type="text"
            autoComplete="given-name"
            required
            minLength={2}
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <div>
          <label htmlFor="email-signup-email" className="block text-xs font-semibold text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email-signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <div>
          <label htmlFor="email-signup-password" className="block text-xs font-semibold text-foreground mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="email-signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 pr-11 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim() || !email || !password}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span className="animate-pulse">Creating account…</span> : 'Create Account'}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-border/50">
        {switchLink}
      </div>
    </div>
  );
}
