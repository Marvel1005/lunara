'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, id, className = '', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  const inputId = id || props.name;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          data-1p-ignore
          autoComplete={props.autoComplete || 'off'}
          className={`w-full px-4 py-3 pr-11 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px] [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden ${
            error ? 'border-danger focus:ring-danger/40' : ''
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-danger">{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD VALIDATION — single source of truth for all password rules.
// Base rules match Supabase Auth; setup flow adds special-char, blocklist,
// and personal-info checks.
// ─────────────────────────────────────────────────────────────────────────────

const MIN_PASSWORD_LENGTH = 8;

// Small bundled blocklist of the most abused passwords. Matched exactly
// (after stripping trivial affixes) — never as a substring — so a strong
// password like `MyDragonFly99!` passes while `dragon123` still fails.
const COMMON_PASSWORDS = [
  'password', 'passw0rd', 'p@ssword', 'p@ssw0rd', '123456', '12345678',
  '123456789', 'qwerty', 'qwerty123', 'abc123', 'letmein', 'welcome',
  'admin', 'login', 'monkey', 'dragon', 'master', 'sunshine', 'princess',
  'football', 'charlie', 'aa123456', 'password1', 'password123', 'changeme',
  'test123', 'toshiba', 'liverpool', 'q1w2e3r4',
];

/** Strip leading/trailing digits and punctuation, then lowercase. */
function blocklistKey(value: string): string {
  return value.toLowerCase().replace(/^[\d\W]+|[\d\W]+$/g, '');
}

function isBlockedPassword(value: string): boolean {
  const key = blocklistKey(value);
  if (!key) return false;
  if (COMMON_PASSWORDS.includes(key)) return true;
  // Leet-speak close variants: normalize common substitutions, then match.
  const deLeeted = key
    .replaceAll('@', 'a')
    .replaceAll('0', 'o')
    .replaceAll('1', 'l')
    .replaceAll('3', 'e')
    .replaceAll('$', 's')
    .replaceAll('!', 'i');
  return COMMON_PASSWORDS.includes(deLeeted);
}

export interface ValidatePasswordOptions {
  email?: string | null;
  name?: string | null;
}

export function validatePassword(value: string, opts: ValidatePasswordOptions = {}): string | null {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number.';
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Password must contain at least one special character (e.g. !@#$%).';
  }
  if (isBlockedPassword(value)) {
    return 'That password is too common. Choose something more unique.';
  }
  const lower = value.toLowerCase();
  // Reject passwords built from the user's own email/name.
  const personal: string[] = [];
  if (opts.email) {
    const local = opts.email.split('@')[0] ?? '';
    if (local.length >= 4) personal.push(local.toLowerCase());
    personal.push(opts.email.toLowerCase());
  }
  if (opts.name) {
    for (const part of opts.name.toLowerCase().split(/[^a-z0-9]+/)) {
      if (part.length >= 4) personal.push(part);
    }
  }
  if (personal.some((p) => p && lower.includes(p))) {
    return 'Password must not contain your name or email.';
  }
  return null;
}

export type StrengthLabel = 'Weak' | 'Okay' | 'Strong' | 'Very Strong';

export function passwordStrength(value: string): { score: number; label: StrengthLabel } {
  const labels: StrengthLabel[] = ['Weak', 'Weak', 'Okay', 'Strong', 'Very Strong'];
  if (!value || value.length < 8) return { score: 0, label: 'Weak' };
  let score = 1; // length gate passed
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  score = Math.min(score, 4);
  if (isBlockedPassword(value)) score = Math.min(score, 1);
  return { score, label: labels[score] };
}
