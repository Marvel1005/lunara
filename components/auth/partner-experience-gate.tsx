'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePartnerMode } from '@/lib/hooks/use-partner-mode';

// Routes a partner-mode user may visit. Everything else bounces to
// /partner-support. This is UX routing only — data protection is enforced
// by RLS + SECURITY DEFINER RPCs (all private queries are auth.uid()-scoped,
// shared data flows only through the shared-status RPC).
const PARTNER_ALLOWED_PATHS = ['/partner-support', '/settings'];

export function PartnerExperienceGate() {
  const { partnerMode, isLoading } = usePartnerMode();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && partnerMode && pathname && !PARTNER_ALLOWED_PATHS.includes(pathname)) {
      router.replace('/partner-support');
    }
  }, [isLoading, partnerMode, pathname, router]);

  return null;
}
