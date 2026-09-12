'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EmailLoginForm, magicLinkErrorMessage } from '@/components/auth/email-auth-form';
import { AlertCircle } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') ?? null;
  const authError = magicLinkErrorMessage(searchParams?.get('error'));

  const switchLink = (
    <p className="text-xs text-muted-fg">
      New to Lunara?{' '}
      <Link
        href={`/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
        className="font-semibold text-primary hover:underline"
      >
        Create an account
      </Link>
    </p>
  );

  return (
    <div className="space-y-5">
      {authError && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <EmailLoginForm
        redirectTo={redirectTo}
        switchLink={switchLink}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-muted-fg">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}