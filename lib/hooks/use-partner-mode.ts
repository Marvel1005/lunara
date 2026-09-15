'use client';

import { useCycleSummary } from '@/lib/hooks/use-cycle';
import { useMyPartnerConnections, usePartnerViewConnections } from '@/lib/hooks/use-partner';

/**
 * Partner-only experience detection (data-driven, NOT role-based).
 *
 * A user gets the focused Partner Support experience only when ALL hold:
 *  - they actively support someone (partner-view connection exists), AND
 *  - they have no Lunara data of their own (no cycle history), AND
 *  - they are not sharing with anyone themselves (no outgoing connection
 *    or pending invite).
 *
 * Dual-role users (own data OR outgoing sharing) always keep the full app,
 * per the dual-role access model. Enforcement is UX routing; row-level
 * data protection stays in RLS + SECURITY DEFINER RPCs.
 */
export function usePartnerMode() {
  const { cycleSummary, isLoading: isLoadingCycle } = useCycleSummary();
  const { data: partnerViewConns, isLoading: isLoadingView } = usePartnerViewConnections();
  const {
    liveConnection,
    pendingInvitations,
    isLoading: isLoadingMine,
  } = useMyPartnerConnections();

  const isLoading = isLoadingCycle || isLoadingView || isLoadingMine;

  const supportsSomeone = (partnerViewConns?.length ?? 0) > 0;
  const hasOwnData = cycleSummary.hasCycleData;
  const sharesWithSomeone = Boolean(liveConnection) || (pendingInvitations?.length ?? 0) > 0;

  const partnerMode = !isLoading && supportsSomeone && !hasOwnData && !sharesWithSomeone;

  return { partnerMode, isLoading };
}
