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
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Pain Check', href: '/pain', icon: HeartPulse, isHighlight: true },
  { name: 'Partner', href: '/partner-support', icon: Heart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-header border-t border-border px-3 py-2">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isHighlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center relative -top-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-primary text-white flex items-center justify-center shadow-comfort border-2 border-white transform active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-primary mt-0.5">Pain Check</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-primary font-semibold' : 'text-muted-fg hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
