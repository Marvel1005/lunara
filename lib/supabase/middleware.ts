import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const validRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//');
    const url = new URL(validRedirect ? redirectTo : '/dashboard', request.url);
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
