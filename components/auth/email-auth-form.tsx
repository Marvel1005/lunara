'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AUTH_NEXT_COOKIE } from '@/lib/auth';
import { AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Please enter your email address.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'Please enter a valid email address.';
  return null;
}

function friendlyEmailError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('429'))
    return 'Too many attempts. Please wait a few minutes before trying again.';
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch'))
    return 'Network error. Please check your connection and try again.';
  if (lower.includes('email not allowed') || lower.includes('signups not allowed') || lower.includes('disabled'))
    return 'Sign-in with this email is not available right now. Please try again later.';
  if (lower.includes('invalid'))
    return 'Please enter a valid email address.';
  return 'Something went wrong. Please try again.';
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL MAGIC-LINK FORM
// ─────────────────────────────────────────────────────────────────────────────

interface EmailMagicLinkFormProps {
  mode: 'login' | 'signup';
  switchLink: React.ReactNode;
  redirectTo?: string | null;
}

export function EmailMagicLinkForm({
  mode,
  switchLink,
  redirectTo,
}: EmailMagicLinkFormProps) {
  const validTarget =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const showName = mode === 'signup';
  const heading = mode === 'login' ? 'Welcome back' : 'Begin your journey';
  const subheading =
    mode === 'login'
      ? "Enter your email and we'll send you a secure sign-in link. No password needed."
      : 'Create your Lunara account with just your email — no password needed.';
  const buttonLabel = mode === 'login' ? 'Send sign-in link' : 'Create account';
  const successTitle = 'Check your email';

  // ── Cooldown ────────────────────────────────────────────────────────────────

  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((seconds = 60) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

  // ── Send magic link ─────────────────────────────────────────────────────────

  const sendLink = async () => {
    if (cooldown > 0) {
      setError('Please wait a moment before requesting another link.');
      return;
    }

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Carry the post-auth destination in a same-origin cookie so the
      // callback can redirect without any ?next= query parameter.
      document.cookie =
        `${AUTH_NEXT_COOKIE}=${encodeURIComponent(validTarget)}; path=/; max-age=600; samesite=lax`;

      const supabase = createClient();
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: normalizeEmail(email),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...(showName && name.trim() ? { data: { name: name.trim() } } : {}),
        },
      });

      if (sendError) {
        const friendly = friendlyEmailError(sendError.message);
        setError(friendly);
        const lower = sendError.message.toLowerCase();
        if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('429')) {
          startCooldown();
        }
        return;
      }

      setSentEmail(normalizeEmail(email));
      startCooldown();
    } catch (err: unknown) {
      setError(friendlyEmailError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendLink();
  };

  // ── Render: link-sent screen ────────────────────────────────────────────────

  if (sentEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-3xl">📬</div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{successTitle}</h2>
          <p className="text-xs text-muted-fg leading-relaxed">
            We&apos;ve sent a secure sign-in link to{' '}
            <span className="font-semibold text-foreground">{sentEmail}</span>.
            {mode === 'login'
              ? ' Open it on this device to finish signing in.'
              : ' Open it on this device to create your account and sign in.'}
          </p>
          <p className="text-[11px] text-muted-fg/80 leading-relaxed">
            The link is single-use and expires in 1 hour.
          </p>
        </div>

        {error && (
          <div
            className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1 text-xs">
          {cooldown > 0 ? (
            <span className="text-muted-fg tabular-nums inline-block">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={sendLink}
              className="font-semibold text-primary hover:underline disabled:opacity-50"
            >
              Resend link
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setSentEmail(null); setError(null); setCooldown(0); }}
          className="block mx-auto text-xs text-muted-fg font-semibold hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  // ── Render: email form ──────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{heading}</h2>
        {subheading && <p className="text-xs text-muted-fg">{subheading}</p>}
      </div>

      {error && (
        <div
          className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {showName && (
          <div>
            <label
              htmlFor="auth-name"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              Your name
            </label>
            <input
              id="auth-name"
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
        )}

        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-semibold text-foreground mb-1.5"
          >
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || (showName && !name.trim()) || cooldown > 0}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-pulse">Sending link…</span>
          ) : cooldown > 0 ? (
            `Wait ${cooldown}s to send another link`
          ) : (
            buttonLabel
          )}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-border/50">{switchLink}</div>
    </div>
  );
}
