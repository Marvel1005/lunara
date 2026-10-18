import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { safeRedirectPath } from '@/lib/auth/redirect';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  return Promise.race([promise, timeout]);
}

// Session lifetime policy: sign the user out after 7 days of inactivity
// (idle timeout) or 30 days total, whichever comes first. Tracked via
// two first-party cookies; expiry revokes the Supabase session too.
const IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000;
const ACTIVITY_REFRESH_MS = 60 * 60 * 1000; // rewrite last-seen hourly max

const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!env.isConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const result = await withTimeout(supabase.auth.getUser(), 5000);
  const user = result?.data?.user ?? null;

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/pain') ||
    pathname.startsWith('/relief') ||
    pathname.startsWith('/comfort') ||
    pathname.startsWith('/insights') ||
    pathname.startsWith('/journal') ||
    pathname.startsWith('/movies') ||
    pathname.startsWith('/partner-support') ||
    pathname.startsWith('/settings');

  // 2a. Session lifetime enforcement (protected pages only, so API/fetch
  //     routes never receive an unexpected redirect).
  if (user && isProtectedPage) {
    const now = Date.now();
    const started = Number(Date.parse(request.cookies.get('lunara_session_started')?.value ?? ''));
    const lastSeen = Number(Date.parse(request.cookies.get('lunara_last_seen')?.value ?? ''));

    const idleExpired = Number.isFinite(lastSeen) && now - lastSeen > IDLE_TIMEOUT_MS;
    const absoluteExpired = Number.isFinite(started) && now - started > ABSOLUTE_TIMEOUT_MS;

    if (idleExpired || absoluteExpired) {
      // Revoke the refresh token server-side, then clear cookies and bounce.
      await withTimeout(supabase.auth.signOut(), 5000);
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('error', 'session_expired');
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, { maxAge: 0 });
      });
      redirectResponse.cookies.set('lunara_session_started', '', { ...SESSION_COOKIE_OPTS, maxAge: 0 });
      redirectResponse.cookies.set('lunara_last_seen', '', { ...SESSION_COOKIE_OPTS, maxAge: 0 });
      return redirectResponse;
    }

    // Keep the clocks fresh (last-seen at most once an hour to avoid
    // rewriting cookies on every request).
    if (!Number.isFinite(started)) {
      supabaseResponse.cookies.set(
        'lunara_session_started',
        new Date(now).toISOString(),
        { ...SESSION_COOKIE_OPTS, maxAge: ABSOLUTE_TIMEOUT_MS / 1000 }
      );
    }
    if (!Number.isFinite(lastSeen) || now - lastSeen > ACTIVITY_REFRESH_MS) {
      supabaseResponse.cookies.set(
        'lunara_last_seen',
        new Date(now).toISOString(),
        { ...SESSION_COOKIE_OPTS, maxAge: IDLE_TIMEOUT_MS / 1000 }
      );
    }
  }

  // 1. Root route: redirect based on auth status
  if (pathname === '/') {
    const target = user ? '/dashboard' : '/login';
    const redirectResponse = NextResponse.redirect(new URL(target, request.url));
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 2. Unauthenticated users attempting to access protected routes -> Redirect to login preserving destination
  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname + request.nextUrl.search);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 2. Authenticated users attempting to access login/signup -> Redirect to redirectTo or dashboard
  if (user && isAuthPage) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    const url = new URL(safeRedirectPath(redirectTo), request.url);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  // 3. Mandatory password setup: authenticated users without a password
  // cannot reach any app page until they visit /set-password. The setup
  // route itself (and auth API routes) are always allowed through.
  //
  // Perf: once confirmed, the fact is cached in a short-lived cookie
  // scoped to the user id (so account switching stays safe) — subsequent
  // requests skip the profiles query entirely.
  const isSetPasswordPage = pathname === '/set-password';
  const isAuthApiRoute = pathname.startsWith('/auth/');
  if (user && !isSetPasswordPage && !isAuthApiRoute) {
    const cached = request.cookies.get('lunara_pw_set')?.value;
    if (cached === user.id) {
      return supabaseResponse;
    }
    // PostgrestBuilder is thenable but not a native Promise in this
    // supabase-js version — adopt it so withTimeout can race it.
    const profilePromise = Promise.resolve(
      supabase.from('profiles').select('password_set').eq('id', user.id).maybeSingle()
    );
    const profileResult = (await withTimeout(profilePromise, 5000)) as {
      data: { password_set?: boolean } | null;
    } | null;
    const hasPassword = profileResult?.data?.password_set === true;
    if (!hasPassword) {
      const redirectResponse = NextResponse.redirect(new URL('/set-password', request.url));
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value);
      });
      return redirectResponse;
    }
    supabaseResponse.cookies.set('lunara_pw_set', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return supabaseResponse;
}
