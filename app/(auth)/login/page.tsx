'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PhoneOTPForm } from '@/components/auth/phone-otp-form';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') ?? null;

  return (
    <PhoneOTPForm
      mode="login"
      heading="Welcome back"
      subheading="Enter your phone number to continue."
      switchLink={
        <p className="text-xs text-muted-fg">
          New to Lunara?{' '}
          <Link
            href={`/signup${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-xs text-muted-fg">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
