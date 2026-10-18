'use client';

import { Logo } from '@/components/brand/logo';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center" role="status">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-lunara-rose/40 via-lunara-lavender/40 to-lunara-peach/40 animate-pulse-glow flex items-center justify-center shadow-comfort">
          <span className="animate-pulse">
            <Logo size={28} showWordmark={false} />
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-fg animate-pulse">
        Preparing your daily comfort space...
      </p>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
