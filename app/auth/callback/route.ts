import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AUTH_NEXT_COOKIE } from '@/lib/auth';

function safeDestination(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
}

function clearAuthDestinationCookie(res: NextResponse): void {
  res.cookies.set(AUTH_NEXT_COOKIE, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const tokenHashType = searchParams.get('type') as EmailOtpType | null;

  // Destination carried via a same-origin cookie set before the link request.
  let next: string | null = null;
  const rawNext = request.cookies.get(AUTH_NEXT_COOKIE)?.value;
  if (rawNext) {
    try {
      next = decodeURIComponent(rawNext);
    } catch {
      next = null;
    }
  }
  const destination = new URL(safeDestination(next), origin);

  const clearDestinationAnd = (res: NextResponse) => {
    clearAuthDestinationCookie(res);
    return res;
  };

  // PKCE magic link flow (default for the browser client).
  let errorMessage = '';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return clearDestinationAnd(NextResponse.redirect(destination));
    }
    errorMessage = error.message;
  }

  // Implicit token_hash flow (fallback for older/other flows).
  if (tokenHash && tokenHashType) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: tokenHashType,
    });
    if (!error) {
      return clearDestinationAnd(NextResponse.redirect(destination));
    }
    errorMessage = error.message;
  }

  if (errorMessage) {
    // Debug aid: shows up in Vercel function logs.
    console.error('[auth/callback] exchange failed', {
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      message: errorMessage,
    });
  }

  // Invalid/expired link — never show a blank page.
  const errorUrl = new URL('/login', origin);
  errorUrl.searchParams.set('error', 'magic_link_invalid');
  if (errorMessage) {
    errorUrl.searchParams.set('details', errorMessage);
  }
  return clearDestinationAnd(NextResponse.redirect(errorUrl));
}