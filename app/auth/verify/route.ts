import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OtpVerifySchema } from '@/lib/auth/schemas';
import { clientIp } from '@/lib/server/http';

export const runtime = 'nodejs';

const GENERIC_VERIFY_ERROR =
  'That code is incorrect or has expired. Please request a new one.';
const LOCKOUT_ERROR =
  'Too many attempts. Please wait a few minutes before trying again.';

/**
 * Verifies an 8-digit OTP. Rate-limited per email and IP with a
 * 5-failed-attempt lockout. Returns identical responses for every
 * verification failure so responses can't be used to probe accounts.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as unknown;

  const parsed = OtpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid email or code.' },
      { status: 400 }
    );
  }

  const { email, token } = parsed.data;
  const ip = clientIp(request);

  const supabase = createClient();

  // Lockout check — 5 failed verifications per email/IP within 15 minutes.
  const { data: check } = await supabase.rpc('auth_rate_check', {
    p_scope: 'otp_verify',
    p_email: email,
    p_ip: ip,
  });
  if ((check as { allowed?: boolean } | null)?.allowed === false) {
    return NextResponse.json({ error: LOCKOUT_ERROR }, { status: 429 });
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    await supabase.rpc('auth_rate_record', {
      p_scope: 'otp_verify',
      p_email: email,
      p_ip: ip,
      p_outcome: 'fail',
    });
    // One generic message for every failure mode (expired, invalid,
    // consumed) — no raw Supabase errors reach the client.
    return NextResponse.json({ error: GENERIC_VERIFY_ERROR }, { status: 400 });
  }

  await supabase.rpc('auth_rate_record', {
    p_scope: 'otp_verify',
    p_email: email,
    p_ip: ip,
    p_outcome: 'success',
  });

  return NextResponse.json({ ok: true });
}
