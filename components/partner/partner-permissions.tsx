'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMyPartnerConnections } from '@/lib/hooks/use-partner';
import type { PartnerPermissions } from '@/lib/partner/types';

interface PartnerPermissionsEditorProps {
  connectionId: string;
  current: PartnerPermissions;
}

const PERMISSION_DEFS: {
  key: keyof PartnerPermissions;
  label: string;
  description: string;
  dependsOn?: keyof PartnerPermissions;
}[] = [
  {
    key: 'share_general_status',
    label: 'General support status',
    description: 'Let your partner know when you may appreciate extra care.',
  },
  {
    key: 'share_comfort_requests',
    label: 'Comfort requests',
    description: 'Share a short message about what you need right now.',
  },
  {
    key: 'share_pain_status',
    label: 'Pain status',
    description: 'Let your partner know when you\'re having a painful day.',
  },
  {
    key: 'share_pain_severity',
    label: 'Pain severity',
    description: 'Share your pain level (0–10) when pain status is enabled.',
    dependsOn: 'share_pain_status',
  },
  {
    key: 'share_pain_location',
    label: 'Pain location / body area',
    description: 'Share specific discomfort locations (e.g., lower abdomen, back).',
    dependsOn: 'share_pain_status',
  },
  {
    key: 'share_pain_type',
    label: 'Pain type',
    description: 'Share pain description (e.g., cramping, dull ache, sharp).',
    dependsOn: 'share_pain_status',
  },
  {
    key: 'share_mood',
    label: 'Mood state',
    description: 'Share today\'s mood check-in and intensity level.',
  },
  {
    key: 'share_sleep',
    label: 'Sleep & rest',
    description: 'Share last night\'s sleep hours and quality rating.',
  },
  {
    key: 'share_water',
    label: 'Hydration',
    description: 'Share today\'s logged water intake.',
  },
  {
    key: 'share_energy',
    label: 'Energy level',
    description: 'Share today\'s logged energy status (e.g., Low, Okay, High).',
  },
  {
    key: 'share_cycle_status',
    label: 'Cycle phase',
    description: 'Share general cycle information such as your current phase.',
  },
  {
    key: 'share_period_status',
    label: 'Period status',
    description: 'Let your partner know when your period is currently active.',
  },
];

export function PartnerPermissionsEditor({ connectionId, current }: PartnerPermissionsEditorProps) {
  const [perms, setPerms] = useState<PartnerPermissions>(current);
  const [customMessage, setCustomMessage] = useState(current.custom_status_message ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updatePermissions, isUpdatingPermissions } = useMyPartnerConnections();

  const toggle = (key: keyof PartnerPermissions) => {
    setPerms((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Automatically disable severity when pain status is turned off
      if (key === 'share_pain_status' && !next.share_pain_status) {
        next.share_pain_severity = false;
      }
      return next;
    });
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updatePermissions({
        connection_id: connectionId,
        permissions: {
          ...perms,
          custom_status_message: perms.share_comfort_requests ? customMessage || null : null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Something went wrong. Your sharing settings were not changed.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {PERMISSION_DEFS.map((def) => {
          const isDisabled = def.dependsOn ? !perms[def.dependsOn] : false;
          const isOn = perms[def.key] as boolean;

          return (
            <div
              key={def.key}
              className={`p-4 rounded-2xl border transition-all ${
                isDisabled
                  ? 'border-border/40 bg-muted/30 opacity-50'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{def.label}</p>
                  <p className="text-xs text-muted-fg mt-0.5 leading-relaxed">{def.description}</p>
                </div>

                {/* Toggle */}
                <button
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`Toggle ${def.label}`}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && toggle(def.key)}
                  className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                    isOn ? 'bg-primary' : 'bg-muted'
                  } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <motion.span
                    layout
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ left: isOn ? '1.375rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                </button>
              </div>

              {/* Comfort message input */}
              {def.key === 'share_comfort_requests' && isOn && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <input
                    type="text"
                    id="comfort-message"
                    placeholder="e.g. I need some quiet time today"
                    maxLength={100}
                    value={customMessage}
                    onChange={(e) => {
                      setCustomMessage(e.target.value);
                      setSaved(false);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-[11px] text-muted-fg mt-1">
                    {customMessage.length}/100 characters
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isUpdatingPermissions}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isUpdatingPermissions ? (
          <span className="animate-pulse">Saving…</span>
        ) : saved ? (
          '✓ Saved'
        ) : (
          'Save sharing settings'
        )}
      </button>
    </div>
  );
}
