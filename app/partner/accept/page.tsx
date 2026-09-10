'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, HeartHandshake } from 'lucide-react';
import { useAcceptInvitation } from '@/lib/hooks/use-partner';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type State = 'loading' | 'confirm' | 'accepting' | 'success' | 'error';

interface InvitationPreview {
  inviter_name: string;
  invitee_email?: string;
  expires_at?: string;
}

function PartnerAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawToken = searchParams?.get('token') ?? null;

  const [state, setState] = useState<State>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const acceptInvitation = useAcceptInvitation();

  useEffect(() => {
    if (!rawToken) {
      setState('error');
      setErrorMessage('This invitation link is invalid or incomplete.');
      return;
    }

    // Token length must be 48 chars (24 bytes hex)
    if (rawToken.length !== 48) {
      setState('error');
      setErrorMessage('This invitation link is invalid or incomplete.');
      return;
    }

    async function checkAuthAndPreview() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsAuthenticated(false);
        setState('error');
        setErrorMessage(
          'You must be signed in to accept an invitation. Please sign in to your account.'
        );
        return;
      }

      setIsAuthenticated(true);

      // Fetch invitation preview
      try {
        const { data, error } = await supabase.rpc('get_partner_invitation_preview', {
          p_raw_token: rawToken,
        });

        if (error) {
          // If RPC is not yet applied in DB or returns an error
          const msg = error.message;
          if (msg.includes('expired')) {
            setState('error');
            setErrorMessage('This invitation has expired. Please ask your partner to send a new invitation.');
            return;
          }
          if (msg.includes('no longer valid') || msg.includes('cancelled')) {
            setState('error');
            setErrorMessage('This invitation has been cancelled or already used.');
            return;
          }
          if (msg.includes('own invitation')) {
            setState('error');
            setErrorMessage('You cannot accept your own invitation.');
            return;
          }
          if (msg.includes('different email')) {
            setState('error');
            setErrorMessage('This invitation was sent to a different email address.');
            return;
          }
          // If RPC doesn't exist yet, fallback gracefully to general partner prompt
          setPreview({ inviter_name: 'Your partner' });
          setState('confirm');
          return;
        }

        setPreview({
          inviter_name: data?.inviter_name || 'Your partner',
          invitee_email: data?.invitee_email,
          expires_at: data?.expires_at,
        });
        setState('confirm');
      } catch {
        setPreview({ inviter_name: 'Your partner' });
        setState('confirm');
      }
    }

    checkAuthAndPreview();
  }, [rawToken]);

  const handleAccept = async () => {
    if (!rawToken) return;

    setState('accepting');
    try {
      await acceptInvitation.mutateAsync(rawToken);
      setState('success');
      setTimeout(() => router.push('/partner-support'), 2500);
    } catch (err: unknown) {
      setState('error');
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (
        msg.includes('Not authenticated') ||
        msg.toLowerCase().includes('authenticated') ||
        msg.toLowerCase().includes('jwt')
      ) {
        setIsAuthenticated(false);
        setErrorMessage(
          'You must be signed in to accept an invitation. Please sign in to your account.'
        );
      } else if (msg.includes('expired')) {
        setErrorMessage(
          'This invitation has expired. Please ask your partner to send a new invitation.'
        );
      } else if (msg.includes('different email')) {
        setErrorMessage(
          'This invitation was sent to a different email address. Please sign in with the correct account.'
        );
      } else if (msg.includes('no longer valid') || msg.includes('cancelled')) {
        setErrorMessage(
          'This invitation has been cancelled or already used. Please request a new invitation.'
        );
      } else if (msg.includes('active connection')) {
        setErrorMessage('You are already connected with this person.');
      } else if (msg.includes('own invitation')) {
        setErrorMessage('You cannot accept your own invitation.');
      } else {
        setErrorMessage(
          "We couldn't process this invitation right now. Please try again or request a new invitation."
        );
      }
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lunara-rose via-lunara-lavender to-lunara-peach flex items-center justify-center text-lg shadow-comfort">
            🌙
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Lunara</p>
            <p className="text-xs text-muted-fg">Your cycle. Your comfort.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border p-8 text-center space-y-5 shadow-soft"
        >
          {/* Loading */}
          {state === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">Checking invitation…</h1>
                <p className="text-sm text-muted-fg">This will only take a moment.</p>
              </div>
            </>
          )}

          {/* Accepting */}
          {state === 'accepting' && (
            <>
              <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">Connecting…</h1>
                <p className="text-sm text-muted-fg">Linking your accounts securely.</p>
              </div>
            </>
          )}

          {/* Confirm Step (Deliberate confirmation required) */}
          {state === 'confirm' && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-lg font-bold text-foreground">Partner Invitation</h1>
                <p className="text-sm text-muted-fg leading-relaxed">
                  You are accepting an invitation from{' '}
                  <span className="font-semibold text-foreground">
                    {preview?.inviter_name || 'your partner'}
                  </span>
                  .
                </p>
                <p className="text-xs text-muted-fg/80 leading-relaxed">
                  Lunara lets your partner share comfort and cycle updates with you so you can support them on harder days.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all cursor-pointer"
                >
                  Accept Invitation
                </button>
                <Link
                  href="/dashboard"
                  className="block w-full py-2.5 rounded-2xl bg-muted/50 hover:bg-muted text-muted-fg text-xs font-semibold transition-colors"
                >
                  Decline &amp; Go to Dashboard
                </Link>
              </div>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
              </motion.div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-foreground">You&apos;re connected!</h1>
                <p className="text-sm text-muted-fg">
                  You can now view the information your partner chooses to share with you.
                </p>
              </div>
              <p className="text-xs text-muted-fg">Redirecting to Partner Support…</p>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <XCircle className="w-14 h-14 text-red-400 mx-auto" />
              <div className="space-y-2">
                <h1 className="text-lg font-bold text-foreground">Invitation not accepted</h1>
                <p className="text-sm text-muted-fg leading-relaxed">{errorMessage}</p>
              </div>
              <div className="space-y-2 pt-2">
                {isAuthenticated === false || errorMessage?.includes('signed in') ? (
                  <div className="space-y-2">
                    <Link
                      href={`/login${rawToken ? `?redirectTo=${encodeURIComponent(`/partner/accept?token=${rawToken}`)}` : ''}`}
                      className="block w-full py-3 rounded-2xl bg-primary text-primary-fg text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Sign In to Accept
                    </Link>
                    <Link
                      href={`/signup${rawToken ? `?redirectTo=${encodeURIComponent(`/partner/accept?token=${rawToken}`)}` : ''}`}
                      className="block w-full py-2.5 rounded-2xl bg-muted/60 border border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors"
                    >
                      New to Lunara? Create Account
                    </Link>
                  </div>
                ) : null}
                <Link
                  href="/dashboard"
                  className={`block w-full py-3 rounded-2xl ${
                    isAuthenticated === false || errorMessage?.includes('signed in')
                      ? 'bg-muted/40 text-muted-fg hover:text-foreground'
                      : 'bg-primary text-primary-fg hover:opacity-90'
                  } text-xs font-semibold transition-opacity`}
                >
                  Go to Dashboard
                </Link>
                <p className="text-xs text-muted-fg">
                  If you believe this is an error, please contact your partner and ask them to send a new invitation.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default function PartnerAcceptPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }
    >
      <PartnerAcceptContent />
    </React.Suspense>
  );
}
