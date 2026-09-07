'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Lunara Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] text-[#2D2628] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🌙</div>
          <h1 className="text-xl font-semibold mb-2">Lunara standard safety check</h1>
          <p className="text-sm text-[#7A6F73] mb-6">
            An unhandled system exception occurred. We can refresh the environment for you safely.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-[#9C727D] text-white text-sm font-medium hover:opacity-90"
          >
            Reload Lunara
          </button>
        </div>
      </body>
    </html>
  );
}
