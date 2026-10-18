import React from 'react';
import { LegalFooter } from '@/components/layout/legal-footer';
import { Logo } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-5">
          <div className="inline-flex mb-2">
            <Logo size={44} showWordmark={false} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Lunara</h1>
          <p className="text-xs text-muted-fg mt-0.5">Your cycle. Your comfort.</p>
        </div>

        {/* Form Container Card */}
        <div className="glass-panel p-5 sm:p-7 rounded-2xl shadow-soft border border-border">
          {children}
        </div>
      </div>
      <LegalFooter className="mt-6" />
    </div>
  );
}
