'use client';

import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import type { SharedPartnerStatus } from '@/lib/partner/types';
import { usePartnerSuggestions } from '@/lib/hooks/use-partner';
import { useAuth } from '@/providers/auth-provider';

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
  connectionId: string;
}

export function PartnerDashboard({ status, connectionId }: PartnerDashboardProps) {
  const { user } = useAuth();
  const { suggestions, sendSuggestion, isSending, deleteSuggestion } =
    usePartnerSuggestions(connectionId);
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending) return;
    setSendError(null);
    try {
      await sendSuggestion(text);
      setDraft('');
    } catch {
      setSendError('Could not send your suggestion. Please try again.');
    }
  };
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
        <div className="p-6 rounded-2xl border border-border bg-card text-center space-y-2 shadow-soft">
          <div className="text-3xl">🤍</div>
          <p className="text-sm font-semibold text-foreground">Nothing shared right now</p>
          <p className="text-xs text-muted-fg leading-relaxed">
            {userName} hasn&apos;t shared any information at this time. That&apos;s perfectly okay.
          </p>
        </div>
      ) : (
        /* Shared status cards */
        <div className="space-y-3">
          {/* General status / I'm hurting */}
          {status.general_status_message && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-primary/10 border border-primary/30 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Status Notice</p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>❤️</span> {status.general_status_message}
              </p>
            </div>
          )}

          {/* Comfort request */}
          {status.custom_comfort_request && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Comfort Request</p>
              <p className="text-sm text-foreground italic">
                &ldquo;{status.custom_comfort_request}&rdquo;
              </p>
            </div>
          )}

          {/* Pain status */}
          {status.has_pain_today !== undefined && (
            <div
              className={`p-4 rounded-2xl border shadow-soft ${
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
            </div>
          )}

          {/* Mood status */}
          {status.mood && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-soft flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-0.5">😊 Mood</p>
                <p className="text-sm font-bold text-foreground capitalize">{status.mood}</p>
              </div>
              {status.mood_intensity && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-soft text-primary">
                  Level {status.mood_intensity}/5
                </span>
              )}
            </div>
          )}

          {/* Wellness logs: Sleep, Water, Energy */}
          {(status.sleep_hours !== undefined || status.water_ml !== undefined || status.energy) && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-soft space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg">🌱 Wellness Overview</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {status.sleep_hours !== undefined && (
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-fg block">😴 Sleep</span>
                    <span className="font-bold text-foreground">{status.sleep_hours}h</span>
                  </div>
                )}
                {status.water_ml !== undefined && (
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-fg block">💧 Water</span>
                    <span className="font-bold text-foreground">{(status.water_ml / 1000).toFixed(1)}L</span>
                  </div>
                )}
                {status.energy && (
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-fg block">⚡ Energy</span>
                    <span className="font-bold text-foreground capitalize">{status.energy}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Period status */}
          {status.is_period_active !== undefined && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-1">Period Status</p>
              <p className="text-sm text-foreground font-medium flex items-center gap-2">
                {status.is_period_active ? '🌸 Period is currently active' : '✨ No active period'}
              </p>
            </div>
          )}

          {/* Cycle phase */}
          {status.cycle_phase && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-fg mb-1">
                Cycle Phase {status.cycle_phase_is_estimated && <span className="normal-case font-normal">(estimated)</span>}
              </p>
              <p className="text-sm text-foreground font-medium">🌙 {status.cycle_phase}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggest a remedy */}
      <div className="p-4 rounded-3xl bg-card border border-border shadow-soft space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-fg">Suggest a remedy</p>
          <p className="text-[11px] text-muted-fg mt-0.5">
            {userName} will see your note. Kind words only.
          </p>
        </div>

        {suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs flex items-start justify-between gap-2"
              >
                <span className="text-foreground leading-relaxed">&ldquo;{s.body}&rdquo;</span>
                {user && s.author_user_id === user.id && (
                  <button
                    type="button"
                    onClick={() => deleteSuggestion(s.id)}
                    className="text-muted-fg hover:text-rose-600 shrink-0 p-1"
                    aria-label="Delete suggestion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {sendError && <p className="text-[11px] text-rose-600">{sendError}</p>}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="e.g. Warm tea and a hot water bag?"
            maxLength={500}
            className="min-w-0 flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !draft.trim()}
            className="p-2.5 rounded-xl bg-primary text-primary-fg hover:opacity-90 transition-all disabled:opacity-50 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Send suggestion"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

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
