'use client';

import React from 'react';
import { useCycleSummary } from '@/lib/hooks/use-cycle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  HeartPulse,
  Sparkles,
  LineChart,
  BookHeart,
  Settings,
  Film,
  Heart,
} from 'lucide-react';

const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Relief Center', href: '/relief', icon: HeartPulse },
  { name: 'Comfort Positions', href: '/comfort', icon: Sparkles },
  { name: 'Cycle Insights', href: '/insights', icon: LineChart },
  { name: 'Private Journal', href: '/journal', icon: BookHeart },
  { name: 'Comfort Movies', href: '/movies', icon: Film },
  { name: 'Partner Support', href: '/partner-support', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { cycleSummary } = useCycleSummary();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-border glass-panel p-5 justify-between select-none">
      <div className="space-y-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach flex items-center justify-center shadow-comfort text-lg">
            🌙
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Lunara</h1>
            <p className="text-xs text-muted-fg font-medium">Your cycle. Your comfort.</p>
          </div>
        </div>

        {/* Hurt Emergency Action */}
        <Link
          href="/pain"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-primary text-white text-xs font-semibold shadow-soft hover:shadow-comfort hover:scale-[1.01] transition-all cursor-pointer border border-white/20"
        >
          <HeartPulse className="w-4 h-4 text-white" />
          <span>I&apos;m hurting right now</span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-fg shadow-comfort font-semibold'
                    : 'text-muted-fg hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-fg'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Cycle Status summary pill */}
      {cycleSummary.hasCycleData && (
        <div className="p-3.5 rounded-2xl bg-primary-soft/50 border border-border text-center">
          <p className="text-xs font-semibold text-primary">
            {cycleSummary.isPeriod
              ? `Period Phase • Day ${cycleSummary.periodDay || 1}`
              : `${cycleSummary.phaseName} • Day ${cycleSummary.currentCycleDay}`}
          </p>
          <p className="text-[11px] text-muted-fg mt-0.5">
            {cycleSummary.isPeriod
              ? 'Gentle pace recommended today'
              : cycleSummary.daysUntilNextPeriod > 0
              ? `~${cycleSummary.daysUntilNextPeriod} days until next period`
              : 'Period expected soon'}
          </p>
        </div>
      )}
    </aside>
  );
}
