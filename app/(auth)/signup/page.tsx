import Link from 'next/link';
import { EmailMagicLinkForm } from '@/components/auth/email-auth-form';
import { magicLinkErrorMessage } from '@/lib/auth';
import { AlertCircle } from 'lucide-react';

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo = typeof searchParams?.redirectTo === 'string' ? searchParams.redirectTo : null;
  const authError = magicLinkErrorMessage(
    typeof searchParams?.error === 'string' ? searchParams.error : null
  );

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
      {authError && (
        <div
          className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <EmailMagicLinkForm
        mode="signup"
        switchLink={switchLink}
        redirectTo={redirectTo}
      />
    </div>
  );
}