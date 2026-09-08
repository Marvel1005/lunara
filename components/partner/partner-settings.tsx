'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Settings2,
  Pause,
  Play,
  Link2Off,
  AlertTriangle,
  Heart,
  Clock,
  Trash2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useMyPartnerConnections } from '@/lib/hooks/use-partner';
import { PartnerConnectFlow } from '@/components/partner/partner-connect-flow';
import { PartnerPermissionsEditor } from '@/components/partner/partner-permissions';
import type { PartnerConnectionItem } from '@/lib/partner/types';

export function PartnerSettings() {
  const {
    liveConnection,
    pendingInvitations,
    isLoading,
    pauseConnection,
    isPausing,
    resumeConnection,
    isResuming,
    revokeConnection,
    isRevoking,
    cancelInvitation,
    isCancellingInvitation,
  } = useMyPartnerConnections();

  const [showConnectFlow, setShowConnectFlow] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handlePause = async (c: PartnerConnectionItem) => {
    setActionError(null);
    try {
      await pauseConnection(c.connection_id);
    } catch {
      setActionError('Something went wrong. Your sharing settings were not changed.');
    }
  };

  const handleResume = async (c: PartnerConnectionItem) => {
    setActionError(null);
    try {
      await resumeConnection(c.connection_id);
    } catch {
      setActionError('Something went wrong. Your sharing settings were not changed.');
    }
  };

  const handleRevoke = async (c: PartnerConnectionItem) => {
    setActionError(null);
    try {
      await revokeConnection(c.connection_id);
      setShowRevokeConfirm(false);
    } catch {
      setActionError('Something went wrong. Your partner has not been disconnected.');
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    setActionError(null);
    try {
      await cancelInvitation(invitationId);
    } catch {
      setActionError('Unable to cancel invitation. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-border shadow-soft space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-muted/60 rounded-lg" />
        <div className="h-20 bg-muted/40 rounded-xl" />
        <div className="h-11 w-40 bg-muted/60 rounded-xl" />
      </div>
    );
  }

  const hasPending = (pendingInvitations?.length ?? 0) > 0;

  return (
    <>
      {/* Connect flow modal */}
      {showConnectFlow && <PartnerConnectFlow onClose={() => setShowConnectFlow(false)} />}

      <div className="space-y-4">
        {actionError && (
          <div
            role="alert"
            className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{actionError}</span>
          </div>
        )}

        {/* ─── SCENARIO 1: NO ACTIVE CONNECTION ─── */}
        {!liveConnection && (
          <div className="space-y-4">
            {/* PENDING INVITATIONS (IF ANY) */}
            {hasPending && (
              <div className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-primary-soft/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">Pending Invitation</h3>
                </div>
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {inv.partner_name ? `${inv.partner_name} (${inv.invitee_email})` : inv.invitee_email}
                      </p>
                      <p className="text-[11px] text-muted-fg mt-0.5">
                        Awaiting acceptance • Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelInvite(inv.id)}
                        disabled={isCancellingInvitation}
                        className="px-3 py-1.5 rounded-xl border border-red-200/80 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        title="Cancel this invitation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MAIN INVITE CARD */}
            <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-border shadow-soft text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lunara-rose/30 to-lunara-lavender/40 text-primary flex items-center justify-center mx-auto shadow-soft">
                <Heart className="w-6 h-6 text-primary fill-primary/20" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  {hasPending ? 'Invite Another Partner' : 'Connect a Partner for Comfort'}
                </h3>
                <p className="text-xs sm:text-sm text-muted-fg leading-relaxed">
                  Share gentle cycle updates, pain check-ins, and comfort requests with someone you trust so they know how to care for you.
                </p>
              </div>

              {/* Trust feature pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left max-w-lg mx-auto">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-fg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Private by Default</span>
                    <span className="text-[11px] leading-tight">Nothing shared until you choose.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-fg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">You Control All</span>
                    <span className="text-[11px] leading-tight">Select exact metrics to share.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-fg flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">Instant Revoke</span>
                    <span className="text-[11px] leading-tight">Pause or stop anytime.</span>
                  </div>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              <div className="pt-2">
                <button
                  id="connect-partner-btn"
                  onClick={() => setShowConnectFlow(true)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary text-primary-fg font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-comfort cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite a Partner</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCENARIO 2: ACTIVE / PAUSED CONNECTION ─── */}
        {liveConnection && (
          <div className="space-y-4">
            {/* Connection Status Banner */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft ${
                liveConnection.status === 'active'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {liveConnection.status === 'active' ? '🟢' : '⏸️'}
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {liveConnection.status === 'active'
                      ? 'Partner Sharing is Active'
                      : 'Partner Sharing is Paused'}
                  </p>
                </div>
                <p className="text-xs text-muted-fg">
                  {liveConnection.status === 'active'
                    ? 'Your partner can only see the items you have turned on below.'
                    : 'Your partner cannot see any of your shared updates right now.'}
                </p>
              </div>

              {/* Quick pause/resume toggle */}
              <div className="shrink-0 pt-1 sm:pt-0">
                {liveConnection.status === 'active' ? (
                  <button
                    id="pause-sharing-btn"
                    onClick={() => handlePause(liveConnection)}
                    disabled={isPausing}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-100/70 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{isPausing ? 'Pausing…' : 'Pause Sharing'}</span>
                  </button>
                ) : (
                  <button
                    id="resume-sharing-btn"
                    onClick={() => handleResume(liveConnection)}
                    disabled={isResuming}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isResuming ? 'Resuming…' : 'Resume Sharing'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Permissions Panel */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-border shadow-soft space-y-3">
              <button
                id="manage-permissions-btn"
                onClick={() => setShowPermissions((s) => !s)}
                className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Sharing Preferences</h3>
                    <p className="text-xs text-muted-fg">Customize exactly what your partner can view</p>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-xl bg-muted/50 flex items-center justify-center text-muted-fg transition-transform duration-200 ${
                    showPermissions ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {showPermissions && (
                <div className="pt-3 border-t border-border/60">
                  <PartnerPermissionsEditor
                    connectionId={liveConnection.connection_id}
                    current={liveConnection.permissions}
                  />
                </div>
              )}
            </div>

            {/* Disconnect Control */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-border shadow-soft">
              {!showRevokeConfirm ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-foreground">Disconnect Partner</p>
                    <p className="text-[11px] text-muted-fg">
                      Completely remove partner access. Your personal data remains untouched.
                    </p>
                  </div>
                  <button
                    id="disconnect-partner-btn"
                    onClick={() => setShowRevokeConfirm(true)}
                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Link2Off className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
                      Are you sure you want to disconnect? Your partner will immediately lose all access to shared status updates.
                    </p>
                  </div>
                  <div className="flex gap-2.5 justify-end">
                    <button
                      onClick={() => setShowRevokeConfirm(false)}
                      className="px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-muted-fg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      Keep Connected
                    </button>
                    <button
                      id="confirm-disconnect-btn"
                      onClick={() => handleRevoke(liveConnection)}
                      disabled={isRevoking}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isRevoking ? 'Disconnecting…' : 'Yes, Disconnect'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
