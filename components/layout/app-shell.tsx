'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { MobileNav } from './mobile-nav';
import { PartnerExperienceGate } from '@/components/auth/partner-experience-gate';
import { ThemeBackground } from '@/components/theme/theme-background';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-500 relative">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <PartnerExperienceGate />
      {/* Theme Ambient Background Layer */}
      <ThemeBackground />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 max-w-5xl w-full mx-auto focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
