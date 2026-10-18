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
    console.error('Lunara Global Error:', error.message, error.digest ?? '');
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] text-[#2D2628] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-sm">
          <div className="mb-4 flex justify-center">
            {/* Inline SVG (not the Logo component): global-error renders outside
                the root layout, so Tailwind tokens are unavailable here. */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <defs>
                <mask id="lunara-global-crescent">
                  <rect width="40" height="40" fill="black" />
                  <circle cx="19" cy="21" r="13" fill="white" />
                  <circle cx="27" cy="15" r="11" fill="black" />
                </mask>
              </defs>
              <circle cx="19" cy="21" r="13" fill="#4A1942" mask="url(#lunara-global-crescent)" />
              <circle cx="31" cy="9" r="1.6" fill="#4A1942" opacity="0.75" />
            </svg>
          </div>
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
