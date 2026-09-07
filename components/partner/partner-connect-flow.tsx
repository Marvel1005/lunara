'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mail, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface PartnerConnectFlowProps {
  onClose: () => void;
}

type Step = 'form' | 'review' | 'sending' | 'sent' | 'error';

export function PartnerConnectFlow({ onClose }: PartnerConnectFlowProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('form');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setStep('sending');

    try {
      // Get the current user's JWT to authenticate the Edge Function call
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('You must be signed in to send an invitation.');
        setStep('error');
        return;
      }

      // Call the Supabase Edge Function (server-side SMTP, no third-party email API)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-partner-invitation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            invitee_email: partnerEmail.trim(),
            partner_name: partnerName.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "We couldn't send the invitation right now. Please try again.");
        setStep('error');
        return;
      }

      // Invalidate partner connections cache so inviter UI reflects pending invite
      queryClient.invalidateQueries({ queryKey: ['partner_connections'] });
      setStep('sent');
    } catch {
      setError('Network error reaching email service. Please try again.');
      setStep('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Connect a partner"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step === 'sending' ? undefined : onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative z-10 w-full sm:max-w-md bg-card-bg-elevated rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {step === 'sent' ? 'Invitation Sent!' : step === 'error' ? 'Invitation Issue' : 'Connect a Partner'}
              </h2>
              <p className="text-sm text-muted-fg mt-0.5">
                {step === 'sent'
                  ? `An invitation email has been sent to ${partnerEmail}.`
                  : step === 'error'
                  ? 'Something went wrong during delivery.'
                  : 'You choose what they can see. Change or revoke access anytime.'}
              </p>
            </div>
            {step !== 'sending' && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-fg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP: FORM */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="partner-name" className="text-sm font-medium text-foreground">
                    Their name <span className="text-muted-fg">(optional)</span>
                  </label>
                  <input
                    id="partner-name"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. Alex"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-fg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="partner-email" className="text-sm font-medium text-foreground">
                    Their email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="partner-email"
                    type="email"
                    autoComplete="off"
                    placeholder="partner@email.com"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-fg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <p className="text-xs text-muted-fg">
                    They must sign in to Lunara with this exact email to accept.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setError(null);
                    if (!partnerEmail.trim() || !partnerEmail.includes('@')) {
                      setError('Please enter a valid email address.');
                      return;
                    }
                    setStep('review');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Review invitation <ChevronRight className="w-4 h-4" />
                </button>

                {error && (
                  <p role="alert" className="text-sm text-red-600 text-center">{error}</p>
                )}
              </motion.div>
            )}

            {/* STEP: REVIEW */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-primary-soft/50 border border-border space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    You&apos;re inviting{' '}
                    <span className="text-primary">{partnerName || 'your partner'}</span> to support
                    you on Lunara.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-fg">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      Invitation email will be sent to:{' '}
                      <span className="font-semibold text-foreground">{partnerEmail}</span>
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-muted-fg">
                  {[
                    "They won't automatically see your cycle history.",
                    "They won't automatically see your pain level.",
                    'They only see information you explicitly allow.',
                    'You can change or revoke access at any time.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center flex-shrink-0">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-muted-fg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-1 py-3 rounded-2xl bg-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Send invitation
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: SENDING */}
            {step === 'sending' && (
              <motion.div
                key="sending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Sending invitation…</p>
                  <p className="text-xs text-muted-fg mt-1">Creating secure invitation and sending email.</p>
                </div>
              </motion.div>
            )}

            {/* STEP: SENT */}
            {step === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-emerald-800">Invitation sent!</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    An invitation email has been sent to{' '}
                    <strong>{partnerEmail}</strong>. They&apos;ll receive a link to accept and connect with you.
                  </p>
                </div>

                <div className="text-xs text-muted-fg space-y-1 text-center">
                  <p>The invitation expires in 7 days and is single-use only.</p>
                  <p>They must sign in with <strong>{partnerEmail}</strong> to accept.</p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-fg text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* STEP: ERROR */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('form'); setError(null); }}
                    className="flex-1 py-3 rounded-2xl border border-border text-sm font-medium text-muted-fg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    Try again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl bg-muted/60 text-foreground text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
