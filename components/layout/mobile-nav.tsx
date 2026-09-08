'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  HeartPulse,
  Heart,
  Settings,
} from 'lucide-react';

const mobileNavItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Hurting', href: '/pain', icon: HeartPulse, isHighlight: true },
  { name: 'Partner', href: '/partner-support', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-header border-t border-border px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center relative -top-3 min-w-[56px] min-h-[48px]"
                aria-label="I'm hurting check-in"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-primary text-white flex items-center justify-center shadow-soft border-2 border-background transform active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-primary mt-0.5">Hurting</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[50px] min-h-[44px] ${
                isActive ? 'text-primary font-bold' : 'text-muted-fg hover:text-foreground active:scale-95'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
