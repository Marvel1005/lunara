import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const VerifySchema = z.object({
  email: z.string().trim().min(3).max(254).email('Invalid email address.'),
  token: z.string().regex(/^\d{8}$/, 'Code must be exactly 8 digits.'),
});

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as unknown;

  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid email or code.' },
      { status: 400 }
    );
  }

  const { email, token } = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}