'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { env } from '@/lib/env';
import { AlertCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const CALLBACK_PATH = '/auth/callback';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Please enter your email address.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'Please enter a valid email address.';
  return null;
}

/** Canonical production redirect target used until https://prathamesh.xyz is live. */
const PROD_REDIRECT_URL = 'https://lunara-coral.vercel.app';

/**
 * Absolute magic-link redirect URL pointing at the auth callback.
 * Development: the live browser origin (localhost). Production: the canonical
 * site URL, which currently defaults to lunara-coral.vercel.app and can never
 * resolve to localhost even if a stale NEXT_PUBLIC_APP_URL leaks into the build.
 */
function buildRedirectTo(validTarget: string): string {
  let base = env.siteUrl;
  if (process.env.NODE_ENV === 'production') {
    try {
      if (new URL(base).hostname === 'localhost') base = PROD_REDIRECT_URL;
    } catch {
      base = PROD_REDIRECT_URL;
    }
  } else if (typeof window !== 'undefined') {
    base = window.location.origin;
  }
  return `${base}${CALLBACK_PATH}?next=${encodeURIComponent(validTarget)}`;
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

/** Map callback error codes to friendly messages shown on the auth pages. */
export function magicLinkErrorMessage(code: string | null): string | null {
  if (code === 'magic_link_invalid')
    return 'That sign-in link is invalid or has expired. Please request a new one to continue.';
  if (code)
    return 'We couldn’t complete that sign-in. Please try again.';
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAGIC LINK SENDER
// ─────────────────────────────────────────────────────────────────────────────

interface MagicLinkFormProps {
  switchLink: React.ReactNode;
  redirectTo?: string | null;
  heading: string;
  subheading: string;
  showName?: boolean;
  buttonLabel: string;
  successTitle: string;
  successBody: (email: string) => React.ReactNode;
}

export function EmailMagicLinkForm({
  switchLink,
  redirectTo,
  heading,
  subheading,
  showName = false,
  buttonLabel,
  successTitle,
  successBody,
}: MagicLinkFormProps) {
  const validTarget =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const sendMagicLink = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: normalizeEmail(email),
        options: {
          emailRedirectTo: buildRedirectTo(validTarget),
          ...(showName && name.trim() ? { data: { name: name.trim() } } : {}),
        },
      });

      if (sendError) {
        setError(friendlyEmailError(sendError.message));
        return;
      }

      setSentEmail(normalizeEmail(email));
    } catch (err: unknown) {
      setError(friendlyEmailError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMagicLink();
  };

  if (sentEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-3xl">📬</div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{successTitle}</h2>
          <p className="text-xs text-muted-fg leading-relaxed">{successBody(sentEmail)}</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={sendMagicLink}
          className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
        >
          Did you get it? Resend link
        </button>
        <button
          type="button"
          onClick={() => { setSentEmail(null); setError(null); }}
          className="block mx-auto text-xs text-muted-fg font-semibold hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {heading && (
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">{heading}</h2>
          {subheading && <p className="text-xs text-muted-fg">{subheading}</p>}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {showName && (
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
        )}

        <div>
          <label htmlFor="magic-link-email" className="block text-xs font-semibold text-foreground mb-1.5">
            Email
          </label>
          <input
            id="magic-link-email"
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
          disabled={loading || !email.trim() || (showName && !name.trim())}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span className="animate-pulse">Sending link…</span> : buttonLabel}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-border/50">
        {switchLink}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────

interface EmailLoginFormProps {
  switchLink: React.ReactNode;
  redirectTo?: string | null;
}

export function EmailLoginForm({ switchLink, redirectTo }: EmailLoginFormProps) {
  return (
    <EmailMagicLinkForm
      switchLink={switchLink}
      redirectTo={redirectTo}
      heading="Welcome back"
      subheading="Enter your email and we’ll send you a secure sign-in link. No password needed."
      buttonLabel="Send magic link"
      successTitle="Check your email"
      successBody={(email) => (
        <>
          We’ve sent you a secure sign-in link to{' '}
          <span className="font-semibold text-foreground">{email}</span>.
          Open it to finish signing in.
        </>
      )}
    />
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
  return (
    <EmailMagicLinkForm
      showName
      switchLink={switchLink}
      redirectTo={redirectTo}
      heading="Begin your journey"
      subheading="Create your Lunara account — no password needed."
      buttonLabel="Send magic link"
      successTitle="Check your email"
      successBody={(email) => (
        <>
          We’ve sent you a secure sign-in link to{' '}
          <span className="font-semibold text-foreground">{email}</span>.
          Open it to create your Lunara account and sign in.
        </>
      )}
    />
  );
}