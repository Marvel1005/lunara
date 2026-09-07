import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';

export function createClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    console.warn(
      'Lunara: Supabase credentials are missing or unconfigured. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return createBrowserClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseAnonKey || 'placeholder-key'
  );
}
