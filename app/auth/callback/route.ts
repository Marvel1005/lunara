import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeDestination(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const tokenHashType = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next');

  const destination = new URL(safeDestination(next), origin);

  // PKCE magic link flow (default for the browser client).
  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(destination);
    }
  }

  // Implicit token_hash flow (fallback for older/other flows).
  if (tokenHash && tokenHashType) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tokenHashType,
    });
    if (!error) {
      return NextResponse.redirect(destination);
    }
  }

  // Invalid/expired link — never show a blank page.
  const errorUrl = new URL('/login', origin);
  errorUrl.searchParams.set('error', 'magic_link_invalid');
  return NextResponse.redirect(errorUrl);
}