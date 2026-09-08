import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach shadow-soft mb-2 text-xl">
            🌙
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Lunara</h1>
          <p className="text-xs text-muted-fg mt-0.5">Your cycle. Your comfort.</p>
        </div>

        {/* Form Container Card */}
        <div className="glass-panel p-5 sm:p-7 rounded-2xl shadow-soft border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
