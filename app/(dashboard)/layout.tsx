import React from 'react';
import { ThemeProvider } from '@/providers/theme-provider';
import { AppShell } from '@/components/layout/app-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}

