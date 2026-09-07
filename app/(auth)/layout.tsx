import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach shadow-comfort mb-3">
            <span className="text-2xl">🌙</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Lunara</h1>
          <p className="text-sm text-muted-fg mt-1">Your cycle. Your comfort.</p>
        </div>

        {/* Form Container Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-4xl shadow-comfort border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
