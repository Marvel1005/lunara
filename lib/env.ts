export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

export function validateEnv(): EnvConfig {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://mnnasvfgjnrkffvgkzza.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_bpiX8QR-6NJVuBkP9mhtnA_29cm636K';

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-supabase-url') &&
    !supabaseAnonKey.includes('your-supabase-anon-key') &&
    !supabaseUrl.includes('placeholder.supabase.co')
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured,
  };
}

export const env = validateEnv();
