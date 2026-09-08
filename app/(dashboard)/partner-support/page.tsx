'use client';

import React from 'react';
import { PartnerSettings } from '@/components/partner/partner-settings';
import { useMyPartnerConnections } from '@/lib/hooks/use-partner';
import { usePartnerViewConnections, useSharedPartnerStatus } from '@/lib/hooks/use-partner';
import { PartnerDashboard } from '@/components/partner/partner-dashboard';
import { Heart, ShieldCheck } from 'lucide-react';

function PartnerView() {
  const partnerConnections = usePartnerViewConnections();
  const activePartnerConn =
    partnerConnections.data?.find((c) => c.status === 'active') ?? null;

  const { data: sharedStatus, isLoading } = useSharedPartnerStatus(
    activePartnerConn?.connection_id ?? null
  );

  if (partnerConnections.isLoading || isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-muted/50" />
        <div className="h-40 rounded-3xl bg-muted/30" />
      </div>
    );
  }

  if (!activePartnerConn || !sharedStatus) return null;

  return <PartnerDashboard status={sharedStatus} />;
}

export default function PartnerSupportPage() {
  const { liveConnection, isLoading } = useMyPartnerConnections();
  const { data: partnerViewConns } = usePartnerViewConnections();

  const hasPartnerViewConnection = (partnerViewConns?.length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-8">
        {/* Page header */}
        <div className="space-y-1 pt-2 pb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary/20" />
            <h1 className="text-2xl font-bold text-foreground">Partner Comfort Sharing</h1>
          </div>
          <p className="text-sm text-muted-fg leading-relaxed">
            Share gentle cycle status updates with a trusted partner so they know how to support you best.
          </p>
        </div>

        {/* Primary user: My partner settings */}
        <section aria-labelledby="my-partner-heading" className="space-y-3">
          <h2
            id="my-partner-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-fg"
          >
            {liveConnection ? 'My Partner Connection' : 'Connect a Partner'}
          </h2>
          {isLoading ? (
            <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
          ) : (
            <PartnerSettings />
          )}
        </section>

        {/* Partner view: supporting someone else */}
        {hasPartnerViewConnection && (
          <section aria-labelledby="supporting-heading" className="space-y-3">
            <h2
              id="supporting-heading"
              className="text-xs font-bold uppercase tracking-wider text-muted-fg"
            >
              Supporting Someone
            </h2>
            <PartnerView />
          </section>
        )}

        {/* Privacy footer */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-1">
          <p className="text-xs text-muted-fg leading-relaxed flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your health data remains completely private. Only explicit fields are shared.</span>
          </p>
        </div>
      </div>
    </main>
  );
}
