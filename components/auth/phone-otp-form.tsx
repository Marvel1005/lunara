'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, ChevronDown, Search, ArrowLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY DATA
// ─────────────────────────────────────────────────────────────────────────────

interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dialCode: string; // e.g. "+91"
  flag: string;
}

const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'UAE', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880', flag: '🇧🇩' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62', flag: '🇮🇩' },
  { name: 'Philippines', code: 'PH', dialCode: '+63', flag: '🇵🇭' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Thailand', code: 'TH', dialCode: '+66', flag: '🇹🇭' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'South Korea', code: 'KR', dialCode: '+82', flag: '🇰🇷' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31', flag: '🇳🇱' },
  { name: 'Sweden', code: 'SE', dialCode: '+46', flag: '🇸🇪' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strip all non-digit characters and normalize to E.164.
 * e.g. dialCode="+91", local="98765 43210" → "+919876543210"
 */
function toE164(dialCode: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '');
  return `${dialCode}${digits}`;
}

/** Mask phone for display: "+91 •••• •••• 3210" */
function maskPhone(e164: string): string {
  // e164 is like "+919876543210"
  // Extract dial code (1–4 digits after +)
  const match = e164.match(/^(\+\d{1,4})(\d+)$/);
  if (!match) return e164;
  const [, dial, local] = match;
  if (local.length <= 4) return `${dial} ${local}`;
  const visible = local.slice(-4);
  const hidden = '•'.repeat(Math.max(0, local.length - 4));
  // Group hidden with spaces every 4
  const hiddenGrouped = hidden.replace(/.{4}/g, '$& ').trim();
  return `${dial} ${hiddenGrouped} ${visible}`;
}

/**
 * Map Supabase/SMS error messages to human-friendly text.
 * Never expose internal details.
 */
function friendlyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid phone') || lower.includes('not a valid phone'))
    return 'Please enter a valid phone number for the selected country.';
  if (lower.includes('otp') && lower.includes('expired'))
    return 'That code has expired. Please request a new one.';
  if (lower.includes('token has expired'))
    return 'That code has expired. Please request a new one.';
  if (lower.includes('invalid otp') || lower.includes('token is invalid') || lower.includes('wrong'))
    return 'That code is incorrect. Please check and try again.';
  if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('429'))
    return 'Too many attempts. Please wait a few minutes before trying again.';
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('fetch'))
    return 'Network error. Please check your connection and try again.';
  if (lower.includes('sms') || lower.includes('provider') || lower.includes('send'))
    return 'Unable to send SMS right now. Please try again in a moment.';
  if (lower.includes('phone number format'))
    return 'Please enter a valid phone number in international format.';
  // Generic fallback — do not expose raw message
  return 'Something went wrong. Please try again.';
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

interface CountrySelectorProps {
  selected: Country;
  onSelect: (c: Country) => void;
}

function CountrySelector({ selected, onSelect }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Select country code"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-3 rounded-l-2xl border border-r-0 border-border bg-muted/60 text-sm font-medium text-foreground min-w-[80px] h-[52px] hover:bg-muted/80 transition-colors cursor-pointer"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-xs font-semibold">{selected.dialCode}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-fg transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-72 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-border/60 relative">
            <Search className="absolute left-5.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-fg pointer-events-none" />
            <input
              autoFocus
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-muted/60 rounded-xl text-xs text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {/* List */}
          <ul className="overflow-y-auto max-h-56 py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-xs text-muted-fg text-center">No results</li>
            )}
            {filtered.map((c) => (
              <li key={`${c.code}-${c.dialCode}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left ${
                    selected.code === c.code && selected.dialCode === c.dialCode
                      ? 'bg-primary/8 text-primary font-semibold'
                      : 'text-foreground'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-sm">{c.name}</span>
                  <span className="text-xs text-muted-fg">{c.dialCode}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP INPUT (6 boxes)
// ─────────────────────────────────────────────────────────────────────────────

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').slice(0, 6);
  while (digits.length < 6) digits.push('');

  const handleChange = (idx: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    onChange(next.join(''));
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        const next = [...digits];
        next[idx - 1] = '';
        onChange(next.join(''));
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="One-time password">
      {digits.map((d, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${idx + 1}`}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 rounded-2xl border text-center text-xl font-bold tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50
            ${d
              ? 'border-primary bg-primary/8 text-primary'
              : 'border-border bg-muted/60 text-foreground'
            }`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAME SETUP STEP (new users only)
// ─────────────────────────────────────────────────────────────────────────────

interface NameSetupStepProps {
  onComplete: (name: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function NameSetupStep({ onComplete, loading, error }: NameSetupStepProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    onComplete(trimmed);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">What should we call you?</h2>
        <p className="text-xs text-muted-fg">
          This is how your name appears in Lunara. You can change it anytime.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="display-name" className="block text-xs font-semibold text-foreground mb-1.5">
            Your name
          </label>
          <input
            id="display-name"
            type="text"
            autoComplete="given-name"
            autoFocus
            required
            minLength={2}
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya"
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || name.trim().length < 2}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span className="animate-pulse">Setting up…</span> : 'Continue to Lunara'}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type Step = 'phone' | 'otp' | 'name';

export interface PhoneOTPFormProps {
  mode: 'login' | 'signup';
  heading: string;
  subheading: string;
  /** Link below the form to the other auth page */
  switchLink: React.ReactNode;
}

const INDIA = COUNTRIES[0]; // India first

export function PhoneOTPForm({ mode, heading, subheading, switchLink }: PhoneOTPFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') ?? null;
  const validTarget =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
      ? redirectTo
      : '/dashboard';

  const [step, setStep] = useState<Step>('phone');
  const [country, setCountry] = useState<Country>(INDIA);
  const [localPhone, setLocalPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // The full E.164 phone sent to Supabase
  const [sentPhone, setSentPhone] = useState('');

  const startCooldown = useCallback(() => {
    setCooldown(45);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  // ── STEP 1: Send OTP ──────────────────────────────────────────────────────

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const digits = localPhone.replace(/\D/g, '');
    if (digits.length < 4) {
      setError('Please enter a valid phone number.');
      return;
    }

    const normalized = toE164(country.dialCode, digits);

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: normalized });

      if (otpError) {
        setError(friendlyError(otpError.message));
        return;
      }

      setSentPhone(normalized);
      startCooldown();
      setOtpCode('');
      setStep('otp');
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ───────────────────────────────────────────────────

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (otpCode.replace(/\D/g, '').length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: sentPhone,
        token: otpCode.replace(/\D/g, ''),
        type: 'sms',
      });

      if (verifyError) {
        setError(friendlyError(verifyError.message));
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError('Authentication failed. Please try again.');
        return;
      }

      // Check if this user already has a profile with a name set
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', userId)
        .single();

      const hasName = profile?.name && profile.name.trim().length > 0;

      if (!hasName) {
        // New user (or profile created without name by trigger)
        setStep('name');
      } else {
        // Existing user with profile
        router.push(validTarget);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Save name (new users) ────────────────────────────────────────

  const handleSaveName = async (name: string) => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Session lost. Please sign in again.');
        setStep('phone');
        return;
      }

      // Upsert profile with name
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name: name.trim() }, { onConflict: 'id' });

      if (profileError) {
        setError('Could not save your name. Please try again.');
        return;
      }

      router.push(validTarget);
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── Name setup step ──────────────────────────────────────────────────────
  if (step === 'name') {
    return <NameSetupStep onComplete={handleSaveName} loading={loading} error={error} />;
  }

  // ── OTP step ─────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Verify your number</h2>
          <p className="text-xs text-muted-fg leading-relaxed">
            We sent a 6-digit code to{' '}
            <span className="font-semibold text-foreground">{maskPhone(sentPhone)}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <OTPInput value={otpCode} onChange={setOtpCode} disabled={loading} />

          <button
            type="submit"
            disabled={loading || otpCode.replace(/\D/g, '').length !== 6}
            className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <span className="animate-pulse">Verifying…</span> : 'Verify'}
          </button>
        </form>

        {/* Resend + Change number */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtpCode('');
              setError(null);
            }}
            className="flex items-center gap-1 text-xs text-muted-fg hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change number
          </button>

          {cooldown > 0 ? (
            <span className="text-xs text-muted-fg tabular-nums">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSendOTP()}
              className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Phone step ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {(heading || subheading) && (
        <div className="space-y-1">
          {heading && <h2 className="text-xl font-bold tracking-tight text-foreground">{heading}</h2>}
          {subheading && <p className="text-xs text-muted-fg">{subheading}</p>}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSendOTP} className="space-y-4">
        <div>
          <label htmlFor="phone-input" className="block text-xs font-semibold text-foreground mb-1.5">
            Mobile number
          </label>
          <div className="flex rounded-2xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 transition-all bg-muted/60">
            <CountrySelector selected={country} onSelect={setCountry} />
            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              value={localPhone}
              onChange={(e) => setLocalPhone(e.target.value.replace(/[^\d\s\-().+]/g, ''))}
              placeholder="98765 43210"
              className="flex-1 px-4 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-fg focus:outline-none h-[52px]"
              aria-label="Phone number"
            />
          </div>
          <p className="text-[11px] text-muted-fg mt-1.5">
            We&apos;ll send a one-time verification code to this number.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || localPhone.replace(/\D/g, '').length < 4}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <span className="animate-pulse">Sending code…</span> : 'Continue'}
        </button>
      </form>

      <div className="text-center pt-3 border-t border-border/50">
        {switchLink}
      </div>
    </div>
  );
}
