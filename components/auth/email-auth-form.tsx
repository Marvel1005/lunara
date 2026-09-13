'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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

function friendlyVerifyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('expired'))
    return 'That code has expired. Please request a new one.';
  if (lower.includes('invalid') || lower.includes('incorrect') || lower.includes('not found'))
    return 'That code is incorrect. Please check and try again.';
  if (lower.includes('rate limit') || lower.includes('too many'))
    return 'Too many attempts. Please wait a few minutes before trying again.';
  return 'Something went wrong. Please request a new code.';
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

  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const EMAIL_CODE_MIN_INTERVAL_SECONDS = 60;

  // Supabase rate-limits magic-link requests to one per 60s — mirror that in
  // the UI so repeated clicks can never hit the /otp endpoint early.
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

  const sendCode = async () => {
    if (cooldown > 0) {
      setError('Please wait a moment before requesting another code.');
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
      const supabase = createClient();
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: normalizeEmail(email),
        options: {
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
      setCode('');
      startCooldown(EMAIL_CODE_MIN_INTERVAL_SECONDS);
    } catch (err: unknown) {
      setError(friendlyEmailError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifying) return;
    if (code.length < 6 || code.length > 12) {
      setError('Please enter the full code from the email.');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const res = await fetch('/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, token: code }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(friendlyVerifyError(data.error ?? 'Verification failed.'));
        return;
      }
      router.push(validTarget);
      router.refresh();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (sentEmail) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-3xl">📬</div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{successTitle}</h2>
          <p className="text-xs text-muted-fg leading-relaxed">{successBody(sentEmail)}</p>
          <p className="text-[11px] text-muted-fg/80 leading-relaxed">
            Your code is single-use and expires in 1 hour.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            id="signin-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            pattern="\d{6,12}"
            maxLength={12}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Enter the code from your email"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm text-center tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? <span className="animate-pulse">Verifying…</span> : 'Sign in with code'}
          </button>
        </form>

        <div className="space-y-1 text-xs">
          {cooldown > 0 ? (
            <span className="text-xs text-muted-fg tabular-nums inline-block">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={sendCode}
              className="font-semibold text-primary hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setSentEmail(null); setError(null); setCooldown(0); setCode(''); }}
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
          disabled={loading || !email.trim() || (showName && !name.trim()) || cooldown > 0}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="animate-pulse">Sending code…</span>
            : cooldown > 0
              ? `Wait ${cooldown}s to send another code`
              : buttonLabel}
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
      subheading="Enter your email and we’ll send you a secure sign-in code. No password needed."
      buttonLabel="Send sign-in code"
      successTitle="Check your email"
      successBody={(email) => (
        <>
          We’ve sent a code to{' '}
          <span className="font-semibold text-foreground">{email}</span>.
          Enter it below to finish signing in.
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
      buttonLabel="Send sign-in code"
      successTitle="Check your email"
      successBody={(email) => (
        <>
          We’ve sent a code to{' '}
          <span className="font-semibold text-foreground">{email}</span>.
          Enter it below to create your Lunara account and sign in.
        </>
      )}
    />
  );
}