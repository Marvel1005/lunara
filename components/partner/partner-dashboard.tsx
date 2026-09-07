'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { SharedPartnerStatus } from '@/lib/partner/types';

const SUPPORTIVE_TIPS = [
  'Check in gently — a simple message can mean a lot.',
  'Offer a glass of water or a warm drink.',
  'Give them quiet time if they seem overwhelmed.',
  'Ask whether they\'d like company or some space.',
  'Offer to help with something small.',
  'Be patient and understanding today.',
];

interface PartnerDashboardProps {
  status: SharedPartnerStatus;
}

export function PartnerDashboard({ status }: PartnerDashboardProps) {
  const userName = status.user_name ?? 'Your Partner';
  const isNothingShared =
    !!status.shared_summary ||
    (!status.general_status_message &&
      !status.custom_comfort_request &&
      !status.has_pain_today &&
      !status.mood &&
      status.sleep_hours === undefined &&
      status.water_ml === undefined &&
      !status.energy &&
      status.is_period_active === undefined &&
      !status.cycle_phase);

  return (
    <div className="space-y-5 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center space-y-1 pt-2">
        <p className="text-xs font-semibold text-muted-fg uppercase tracking-widest">Supporting</p>
        <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
        <p className="text-xs text-muted-fg">
          {status.connection_status === 'paused'
            ? 'Sharing is currently paused.'
            : 'Shared information updates automatically.'}
        </p>
      </div>

      {isNothingShared ? (
        /* Nothing shared state */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl border border-border bg-card text-center space-y-2 shadow-soft"
        >
          <div className="text-3xl">🤍</div>
          <p className="text-sm font-semibold text-foreground">Nothing shared right now</p>
          <p className="text-xs text-muted-fg leading-relaxed">
            {userName} hasn&apos;t shared any information at this time. That&apos;s perfectly okay.
          </p>
        </motion.div>
      ) : (
        /* Shared status cards */
        <div className="space-y-3">
          {/* General status / I'm hurting */}
          {status.general_status_message && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-3xl bg-gradient-to-br from-rose-500/10 to-primary/10 border border-primary/30 shadow-soft"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Status Notice</p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>❤️</span> {status.general_status_message}
              </p>
            </motion.div>
          )}

          {/* Comfort request */}
          {status.custom_comfort_request && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-4 rounded-3xl bg-card border border-border shadow-soft"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Comfort Request</p>
              <p className="text-sm text-foreground italic">
                &ldquo;{status.custom_comfort_request}&rdquo;
              </p>
            </motion.div>
          )}

          {/* Pain status */}
          {status.has_pain_today !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-3xl border shadow-soft ${
                status.has_pain_today
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              {status.has_pain_today ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-700">😣 Pain Reported</p>
                    {status.pain_severity !== undefined && (
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500 text-white">
                        {status.pain_severity}/10
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {status.pain_status_message ?? `${userName} is experiencing discomfort today.`}
                  </p>

                  {(status.pain_location || status.pain_type) && (
                    <div className="pt-2 border-t border-rose-500/20 text-xs space-y-1 text-muted-fg">
                      {status.pain_location && (
                        <p>
                          <span className="font-bold text-foreground">📍 Location:</span>{' '}
                          <span className="capitalize">{status.pain_location.replace('_', ' ')}</span>
                        </p>
                      )}
                      {status.pain_type && (
                        <p>
                          <span className="font-bold text-foreground">⚡ Type:</span>{' '}
                          <span className="capitalize">{status.pain_type}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <span>🌿</span> No pain reported today.
                </p>
              )}
            </motion.div>
          )}

          {/* Mood status */}
          {status.mood && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 rounded-3xl bg-card border border-border shadow-soft flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-0.5">😊 Mood</p>
                <p className="text-sm font-bold text-foreground capitalize">{status.mood}</p>
              </div>
              {status.mood_intensity && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-soft text-primary">
                  Level {status.mood_intensity}/5
                </span>
              )}
            </motion.div>
          )}

          {/* Wellness logs: Sleep, Water, Energy */}
          {(status.sleep_hours !== undefined || status.water_ml !== undefined || status.energy) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-3xl bg-card border border-border shadow-soft space-y-2.5"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg">🌱 Wellness Overview</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {status.sleep_hours !== undefined && (
                  <div className="p-2.5 rounded-2xl bg-muted/30 border border-border">
                    <span className="text-muted-fg block">😴 Sleep</span>
                    <span className="font-bold text-foreground">{status.sleep_hours}h</span>
                  </div>
                )}
                {status.water_ml !== undefined && (
                  <div className="p-2.5 rounded-2xl bg-muted/30 border border-border">
                    <span className="text-muted-fg block">💧 Water</span>
                    <span className="font-bold text-foreground">{(status.water_ml / 1000).toFixed(1)}L</span>
                  </div>
                )}
                {status.energy && (
                  <div className="p-2.5 rounded-2xl bg-muted/30 border border-border">
                    <span className="text-muted-fg block">⚡ Energy</span>
                    <span className="font-bold text-foreground capitalize">{status.energy}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Period status */}
          {status.is_period_active !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded-3xl bg-card border border-border shadow-soft"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-1">Period Status</p>
              <p className="text-sm text-foreground font-medium flex items-center gap-2">
                {status.is_period_active ? '🌸 Period is currently active' : '✨ No active period'}
              </p>
            </motion.div>
          )}

          {/* Cycle phase */}
          {status.cycle_phase && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-3xl bg-card border border-border shadow-soft"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-1">
                Cycle Phase {status.cycle_phase_is_estimated && <span className="normal-case font-normal">(estimated)</span>}
              </p>
              <p className="text-sm text-foreground font-medium">🌙 {status.cycle_phase}</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Supportive suggestions */}
      <div className="p-4 rounded-3xl bg-muted/40 border border-border/60 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-fg">Ways to support</p>
        <ul className="space-y-2">
          {SUPPORTIVE_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-fg">
              <span className="mt-0.5 text-primary flex-shrink-0">•</span>
              {tip}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-fg/60 italic">
          These are supportive suggestions only, not medical advice.
        </p>
      </div>
    </div>
  );
}
