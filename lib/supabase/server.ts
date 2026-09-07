import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component context - safe to ignore if set was attempted
          }
        },
      },
    }
  );
}
