'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PhoneOTPForm } from '@/components/auth/phone-otp-form';
import { EmailSignupForm } from '@/components/auth/email-auth-form';
import { Smartphone, Mail } from 'lucide-react';

type Method = 'phone' | 'email';

function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') ?? null;
  const [method, setMethod] = useState<Method>('phone');

  const switchLink = (
    <p className="text-xs text-muted-fg">
      Already have an account?{' '}
      <Link
        href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
        className="font-semibold text-primary hover:underline"
      >
        Sign in
      </Link>
    </p>
  );

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Begin your journey</h2>
        <p className="text-xs text-muted-fg">Create your Lunara account.</p>
      </div>

      {/* Method Tabs */}
      <div className="flex rounded-2xl bg-muted/60 border border-border p-1 gap-1">
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            method === 'phone'
              ? 'bg-card text-foreground shadow-soft border border-border/60'
              : 'text-muted-fg hover:text-foreground'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Phone
        </button>
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            method === 'email'
              ? 'bg-card text-foreground shadow-soft border border-border/60'
              : 'text-muted-fg hover:text-foreground'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
      </div>

      {/* Active Form */}
      {method === 'phone' ? (
        <PhoneOTPForm
          mode="signup"
          heading=""
          subheading=""
          switchLink={switchLink}
        />
      ) : (
        <EmailSignupForm
          redirectTo={redirectTo}
          switchLink={switchLink}
        />
      )}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-muted-fg">Loading…</div>}>
      <SignUpForm />
    </Suspense>
  );
}
