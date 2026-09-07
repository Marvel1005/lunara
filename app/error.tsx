'use client';

import { useEffect } from 'react';
import { RefreshCw, HeartHandshake } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lunara App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-lunara-blush/60 flex items-center justify-center mb-4 text-lunara-plum shadow-soft">
        <HeartHandshake className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
        Something took a little bump
      </h2>
      <p className="text-sm text-muted-fg mb-6 leading-relaxed">
        Don&apos;t worry, your data is safe. We experienced a temporary issue while rendering this page.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-fg text-sm font-medium shadow-comfort hover:opacity-95 transition-all cursor-pointer"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}
