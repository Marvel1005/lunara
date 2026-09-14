export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
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

  // Single application-URL source used for auth redirects and metadata.
  // Reuses the existing NEXT_PUBLIC_APP_URL pattern.
  // Local: http://localhost:3000   Production: https://prathamesh.xyz
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://prathamesh.xyz'
      : 'http://localhost:3000');

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
    siteUrl,
    isConfigured,
  };
}

export const env = validateEnv();
