import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Low-emphasis loading placeholder. Pair with a parent role="status". */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-muted/50 ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Page-level loading block with a screen-reader announcement.
 * Usage: render instead of page content while isLoading is true.
 */
export function SkeletonPage({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="space-y-4 pb-10" role="status" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
