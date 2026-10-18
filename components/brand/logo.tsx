import React from 'react';

interface LogoProps {
  /** Pixel size of the crescent mark. */
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

/**
 * Lunara brand: a crescent mark (inline SVG, inherits currentColor) plus
 * a Fraunces wordmark. Replaces the legacy emoji logo everywhere.
 */
export function Logo({
  size = 36,
  showWordmark = true,
  className = '',
  wordmarkClassName = '',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-primary"
      >
        <defs>
          <mask id="lunara-crescent-mask">
            <rect width="40" height="40" fill="black" />
            <circle cx="19" cy="21" r="13" fill="white" />
            <circle cx="27" cy="15" r="11" fill="black" />
          </mask>
        </defs>
        <circle cx="19" cy="21" r="13" fill="currentColor" mask="url(#lunara-crescent-mask)" />
        <circle cx="31" cy="9" r="1.6" fill="currentColor" opacity="0.75" />
      </svg>
      {showWordmark && (
        <span
          className={`font-display text-xl font-semibold tracking-tight text-foreground ${wordmarkClassName}`}
        >
          Lunara
        </span>
      )}
    </span>
  );
}
