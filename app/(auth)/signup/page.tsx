'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PhoneOTPForm } from '@/components/auth/phone-otp-form';

function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') ?? null;

  return (
    <PhoneOTPForm
      mode="signup"
      heading="Begin your journey"
      subheading="Create your Lunara account with your phone number."
      switchLink={
        <p className="text-xs text-muted-fg">
          Already have an account?{' '}
          <Link
            href={`/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    />
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-muted-fg">Loading…</div>}>
      <SignUpForm />
    </Suspense>
  );
}
