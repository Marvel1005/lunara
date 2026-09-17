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
          className={`w-full px-4 py-3 pr-11 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground h-[52px] ${
            error ? 'border-rose-400 focus:ring-rose-400/40' : ''
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-fg hover:text-foreground transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-rose-600">{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD VALIDATION
// Matches typical Supabase Auth password requirements:
//   - at least 8 characters
//   - at least one lowercase letter
//   - at least one uppercase letter
//   - at least one digit
// ─────────────────────────────────────────────────────────────────────────────

const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(value: string): string | null {
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
  return null;
}
