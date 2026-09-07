'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (authError) {
        if (authError.message.includes('rate limit') || authError.status === 429) {
          setError('Supabase email rate limit reached. Please wait a few minutes before trying again or contact administrator.');
        } else {
          setError(authError.message);
        }
      } else if (data.session) {
        // Autoconfirm is enabled on Supabase project, user has active session
        router.push('/dashboard');
        router.refresh();
      } else if (data.user) {
        // User created, but email confirmation is required by Supabase
        setInfoMessage(
          `Account created for ${email}! Supabase requires email verification. Please check your email inbox to confirm your account, then sign in.`
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected registration error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Begin your journey</h2>
        <p className="text-xs text-muted-fg mt-1">Create a warm space tailored to your body and comfort</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Account Created on Supabase</span>
          </div>
          <p>{infoMessage}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Go to Sign In</span>
            </Link>
          </div>
        </div>
      )}

      {!infoMessage && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Your name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena"
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Create password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-foreground"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-primary text-primary-fg text-sm font-semibold shadow-comfort hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center pt-4 border-t border-border/50">
        <p className="text-xs text-muted-fg">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
