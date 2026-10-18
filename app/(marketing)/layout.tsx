import React from 'react';
import { LegalFooter } from '@/components/layout/legal-footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>
      <LegalFooter />
    </div>
  );
}
