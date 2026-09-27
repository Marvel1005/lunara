'use client';

import React from 'react';

interface DataErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Shared fetch-failure UI: a failed load must never look identical to
 * "no data yet". Pair with a hook's `isError` + `refetch`.
 */
export function DataErrorBanner({
  message = "Couldn't load your data. Check your connection and try again.",
  onRetry,
}: DataErrorBannerProps) {
  return (
    <div
      className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-2.5"
      role="alert"
    >
      <p className="text-xs text-muted-fg leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-primary text-primary-fg text-xs font-semibold hover:opacity-90 transition-all cursor-pointer min-h-[44px]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
