'use client';

import React, { useEffect, useRef } from 'react';

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ length, value, onChange }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const digits = value.split('');
    digits[index] = digit;
    const next = digits.join('').slice(0, length);
    onChange(next);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (digits) {
      onChange(digits);
      inputsRef.current[Math.min(digits.length, length) - 1]?.focus();
    }
  };

  return (
    <div className="flex w-full items-center justify-center gap-1.5 sm:gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={2}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-muted/60 text-center text-base font-semibold text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 sm:h-[52px] sm:rounded-2xl sm:text-lg"
        />
      ))}
    </div>
  );
}