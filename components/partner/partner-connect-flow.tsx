'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Mail,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface PartnerConnectFlowProps {
  onClose: () => void;
}

type Step = 'form' | 'review' | 'sending' | 'ready' | 'error';

export function PartnerConnectFlow({ onClose }: PartnerConnectFlowProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('form');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [invitationUrl, setInvitationUrl] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    setStep('sending');

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('You must be signed in to create an invitation.');
        setStep('error');
        return;
      }

      // Invoke Supabase Edge Function (send-partner-invitation)
      const { data, error: invokeError } = await supabase.functions.invoke(
        'send-partner-invitation',
        {
          body: {
            email: partnerEmail.trim().toLowerCase(),
            partnerName: partnerName.trim() || null,
          },
        }
      );

      // Even if email delivery failed (status 502), the invitation DB record was created
      // and invitationUrl is returned for direct link sharing.
      const generatedUrl = data?.invitationUrl || (data as Record<string, unknown>)?.invitation_url as string | undefined;

      if (invokeError && !generatedUrl) {
        console.error('send-partner-invitation error:', invokeError);
        setError(
          data?.error ||
          invokeError.message ||
          "Couldn't create the invitation right now. Please try again."
        );
        setStep('error');
        return;
      }

      if (generatedUrl) {
        setInvitationUrl(generatedUrl);
        setEmailSent(Boolean(data?.emailSent ?? (data as Record<string, unknown>)?.email_sent));

        // Refresh partner connections so inviter sees updated status
        queryClient.invalidateQueries({ queryKey: ['partner_connections'] });
        setStep('ready');
      } else {
        setError(data?.error ?? "Couldn't create the invitation right now. Please try again.");
        setStep('error');
      }
    } catch (err) {
      console.error('Network error during partner invitation:', err);
      setError('Network error contacting invitation service. Please try again.');
      setStep('error');
    }
  };

  const handleCopy = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API unavailable
      const el = document.createElement('textarea');
      el.value = invitationUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = `I'm using Lunara to track my cycle and comfort, and I'd like to share updates with you. Here is your private invitation link: ${invitationUrl}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lunara Partner Invitation',
          text: `Join me on Lunara to share cycle comfort updates.`,
          url: invitationUrl,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${partnerName ? `${partnerName}, you` : 'You'}'re invited to connect on Lunara`);
    const body = encodeURIComponent(
      `Hi ${partnerName || 'there'},\n\nI'm using Lunara to track my cycle and comfort, and I'd like to share gentle wellness updates with you so you know how to support me on harder days.\n\nAccept your private invitation here:\n${invitationUrl}\n\nThis link is single-use and expires in 7 days.\n`
    );
    window.open(`mailto:${partnerEmail}?subject=${subject}&body=${body}`, '_self');
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
        className="relative z-10 w-full sm:max-w-md bg-card-bg-elevated rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden max-h-[92vh] flex flex-col"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {step === 'ready'
                  ? 'Your invite link is ready'
                  : step === 'error'
                  ? 'Invitation Issue'
                  : 'Connect a Partner'}
              </h2>
              <p className="text-xs text-muted-fg mt-0.5">
                {step === 'ready'
                  ? emailSent
                    ? `Email sent to ${partnerEmail}. You can also share this link directly:`
                    : 'Share this private link through any messaging app you prefer:'
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
            {/* STEP 1: FORM */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="partner-name" className="text-xs font-semibold text-foreground">
                    Their name <span className="text-muted-fg font-normal">(optional)</span>
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
                  <label htmlFor="partner-email" className="text-xs font-semibold text-foreground">
                    Their email <span className="text-primary">*</span>
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
                  <p className="text-[11px] text-muted-fg">
                    They will sign in with this email to link with your account.
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
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-comfort"
                >
                  Review invitation <ChevronRight className="w-4 h-4" />
                </button>

                {error && (
                  <p role="alert" className="text-xs text-red-600 text-center">{error}</p>
                )}
              </motion.div>
            )}

            {/* STEP 2: REVIEW */}
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
                    Inviting{' '}
                    <span className="text-primary">{partnerName || 'your partner'}</span> to support you.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-fg">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      Account email:{' '}
                      <span className="font-semibold text-foreground">{partnerEmail}</span>
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-muted-fg">
                  {[
                    "They won't automatically see your pain level or symptoms.",
                    'They only see what you explicitly choose to share.',
                    'You can pause or disconnect sharing anytime.',
                    'No private health data is in the link.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center shrink-0">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 rounded-2xl border border-border text-xs font-semibold text-muted-fg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex-1 py-3 rounded-2xl bg-primary text-primary-fg font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-comfort"
                  >
                    <Send className="w-4 h-4" />
                    Create Invite Link
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SENDING */}
            {step === 'sending' && (
              <motion.div
                key="sending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Creating secure invitation…</p>
                  <p className="text-xs text-muted-fg mt-1">Generating single-use link for {partnerName || partnerEmail}.</p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: READY / SHARING SHEET */}
            {step === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {emailSent && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Invitation email sent to {partnerEmail}</span>
                  </div>
                )}

                {/* Link Box */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-fg font-medium">
                    <span>Private Invitation Link</span>
                    <span className="text-[10px] text-primary font-semibold">Expires in 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={invitationUrl}
                      className="w-full bg-background px-3 py-2 rounded-xl text-xs text-muted-fg border border-border/80 select-all font-mono truncate"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        copied
                          ? 'bg-emerald-600 text-white shadow-soft'
                          : 'bg-primary text-primary-fg hover:opacity-95'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Share Buttons */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-muted-fg">Quick share options:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleWhatsApp}
                      className="py-2.5 px-3 rounded-2xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={handleNativeShare}
                      className="py-2.5 px-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Messages</span>
                    </button>

                    <button
                      onClick={handleEmailShare}
                      className="py-2.5 px-3 rounded-2xl bg-muted/70 text-foreground hover:bg-muted border border-border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email App</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-muted-fg leading-relaxed text-center pt-2">
                  When your partner opens this link, they will sign in to connect with you. Nothing is shared until you enable it in your permissions.
                </p>

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-fg text-sm font-semibold hover:opacity-90 transition-all cursor-pointer shadow-comfort"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* STEP 5: ERROR */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep('form');
                      setError(null);
                    }}
                    className="flex-1 py-3 rounded-2xl border border-border text-xs font-semibold text-muted-fg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    Try again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl bg-muted/60 text-foreground text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
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
