'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Settings2, Pause, Play, Link2Off, AlertTriangle } from 'lucide-react';
import { useMyPartnerConnections } from '@/lib/hooks/use-partner';
import { PartnerConnectFlow } from '@/components/partner/partner-connect-flow';
import { PartnerPermissionsEditor } from '@/components/partner/partner-permissions';
import type { PartnerConnectionItem } from '@/lib/partner/types';

export function PartnerSettings() {
  const {
    liveConnection,
    isLoading,
    pauseConnection,
    isPausing,
    resumeConnection,
    isResuming,
    revokeConnection,
    isRevoking,
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

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-3xl bg-muted/50" />
        <div className="h-16 rounded-3xl bg-muted/30" />
      </div>
    );
  }

  return (
    <>
      {/* Connect flow modal */}
      <AnimatePresence>
        {showConnectFlow && <PartnerConnectFlow onClose={() => setShowConnectFlow(false)} />}
      </AnimatePresence>

      <div className="space-y-4">
        {actionError && (
          <div
            role="alert"
            className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {/* No active/paused connection */}
        {!liveConnection && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Explanation card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-lunara-rose/10 to-lunara-lavender/10 border border-border text-center space-y-3">
              <div className="text-3xl">🤝</div>
              <h3 className="text-base font-bold text-foreground">Partner Support</h3>
              <p className="text-sm text-muted-fg leading-relaxed max-w-xs mx-auto">
                Sometimes a little extra understanding can make difficult days easier.
              </p>
              <div className="space-y-1.5 text-xs text-muted-fg text-left pt-1">
                {[
                  'Connecting a partner is completely optional.',
                  'You choose exactly what they can see.',
                  'You can change or revoke access anytime.',
                  'Nothing is shared until you enable it.',
                ].map((item, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-primary flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <button
              id="connect-partner-btn"
              onClick={() => setShowConnectFlow(true)}
              className="w-full py-4 rounded-3xl bg-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-comfort"
            >
              <UserPlus className="w-4 h-4" />
              Connect a partner
            </button>
          </motion.div>
        )}

        {/* Active / paused connection */}
        {liveConnection && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Status banner */}
            <div
              className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${
                liveConnection.status === 'active'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div>
                <p className="text-sm font-bold text-foreground">
                  {liveConnection.status === 'active' ? '🟢 Partner connected' : '⏸ Sharing paused'}
                </p>
                <p className="text-xs text-muted-fg mt-0.5">
                  {liveConnection.status === 'active'
                    ? 'Sharing is active based on your permissions below.'
                    : 'Your partner cannot see any shared information right now.'}
                </p>
              </div>
            </div>

            {/* Permissions section */}
            <div className="space-y-3">
              <button
                id="manage-permissions-btn"
                onClick={() => setShowPermissions((s) => !s)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings2 className="w-4 h-4 text-muted-fg" />
                  <span className="text-sm font-semibold text-foreground">What would you like to share?</span>
                </div>
                <motion.span
                  animate={{ rotate: showPermissions ? 180 : 0 }}
                  className="text-muted-fg text-xs"
                >
                  ▼
                </motion.span>
              </button>

              <AnimatePresence>
                {showPermissions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <PartnerPermissionsEditor
                      connectionId={liveConnection.connection_id}
                      current={liveConnection.permissions}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Connection controls */}
            <div className="space-y-3">
              {liveConnection.status === 'active' && (
                <button
                  id="pause-sharing-btn"
                  onClick={() => handlePause(liveConnection)}
                  disabled={isPausing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-800 font-semibold text-sm hover:bg-amber-100 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" />
                  {isPausing ? 'Pausing…' : 'Pause sharing'}
                </button>
              )}

              {liveConnection.status === 'paused' && (
                <button
                  id="resume-sharing-btn"
                  onClick={() => handleResume(liveConnection)}
                  disabled={isResuming}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-green-300 bg-green-50 text-green-800 font-semibold text-sm hover:bg-green-100 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {isResuming ? 'Resuming…' : 'Resume sharing'}
                </button>
              )}

              {/* Revoke */}
              {!showRevokeConfirm ? (
                <button
                  id="disconnect-partner-btn"
                  onClick={() => setShowRevokeConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-border text-muted-fg text-sm hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                >
                  <Link2Off className="w-4 h-4" />
                  Disconnect partner
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      Disconnecting will stop your partner from seeing any shared Lunara information.
                      Your personal data remains completely private and intact.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRevokeConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-fg hover:bg-muted/50 transition-colors"
                    >
                      Keep connected
                    </button>
                    <button
                      id="confirm-disconnect-btn"
                      onClick={() => handleRevoke(liveConnection)}
                      disabled={isRevoking}
                      className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isRevoking ? 'Disconnecting…' : 'Yes, disconnect'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
