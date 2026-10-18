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

export { validatePassword, passwordStrength } from '@/lib/auth/password';
export type { ValidatePasswordOptions, StrengthLabel } from '@/lib/auth/password';
