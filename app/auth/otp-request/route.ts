import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { OtpRequestSchema } from '@/lib/auth/schemas';
import { clientIp } from '@/lib/server/http';

export const runtime = 'nodejs';

/**
 * Rate-limited OTP request endpoint. All code requests go through here
 * (never directly through the browser Supabase client) so per-email and
 * per-IP limits are enforced server-side.
 *
 * Responses are identical for registered and unregistered emails —
 * Supabase's signInWithOtp sends a code either way when signups are
 * enabled, and we never surface differences here.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as unknown;
  const parsed = OtpRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const { email, name } = parsed.data;
  const ip = clientIp(request);

  const supabase = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: check, error: checkError } = await supabase.rpc('auth_rate_check', {
    p_scope: 'otp_request',
    p_email: email,
    p_ip: ip,
  });

  // Fail-open if the rate-limit infrastructure itself errors: a database
  // blip must never lock every user out of signing in.
  const allowed =
    !checkError && (check as { allowed?: boolean } | null)?.allowed !== false;

  if (!allowed) {
    const retrySeconds = (check as { retry_after_seconds?: number } | null)
      ?.retry_after_seconds ?? 60;
    const minutes = Math.max(1, Math.ceil(retrySeconds / 60));
    return NextResponse.json(
      {
        error: `Too many code requests. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.`,
      },
      { status: 429 }
    );
  }

  await supabase.rpc('auth_rate_record', {
    p_scope: 'otp_request',
    p_email: email,
    p_ip: ip,
    p_outcome: 'request',
  });

  const { error: sendError } = await supabase.auth.signInWithOtp({
    email,
    options: name ? { data: { name } } : {},
  });

  if (sendError) {
    // Server-side log: message only, never full error objects.
    console.error('[otp-request] signInWithOtp failed:', sendError.message);
    return NextResponse.json(
      { error: "We couldn't send a code right now. Please try again in a moment." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
