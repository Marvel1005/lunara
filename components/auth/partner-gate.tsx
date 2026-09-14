'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

// Routes a partner-only account is allowed to visit.
// Everything else bounces back to /partner-support.
const PARTNER_ALLOWED_PATHS = ['/partner-support', '/settings'];

export function PartnerGate() {
  const { isPartner, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isPartner && pathname && !PARTNER_ALLOWED_PATHS.includes(pathname)) {
      router.replace('/partner-support');
    }
  }, [isLoading, isPartner, pathname, router]);

  return null;
}
