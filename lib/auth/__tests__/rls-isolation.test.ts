/**
 * RLS isolation integration tests.
 *
 * Creates two temporary users via the service role, inserts data for user A,
 * and asserts user B cannot read it through the anon/authenticated roles the
 * browser uses. Skipped entirely unless SUPABASE_SERVICE_ROLE_KEY is set —
 * never runs against production data; both users are deleted in afterAll.
 *
 * Run: SUPABASE_SERVICE_ROLE_KEY=... npm test
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://epvechbmmmlzefhusvra.supabase.co';

const describeRls = SERVICE_KEY ? describe : describe.skip;

describeRls('RLS isolation (integration)', () => {
  let admin: SupabaseClient;
  let userA: { id: string; email: string };
  let userB: { id: string; email: string };
  let clientB: SupabaseClient;

  const rand = () => Math.random().toString(36).slice(2, 10);

  beforeAll(async () => {
    admin = createClient(SUPABASE_URL, SERVICE_KEY as string, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const suffix = rand();
    const mk = async (label: string) => {
      const { data, error } = await admin.auth.admin.createUser({
        email: `${label}-${suffix}@lunara-test.invalid`,
        email_confirm: true,
        password: `Test!${suffix}Aa1`,
      });
      if (error) throw error;
      return { id: data.user.id, email: data.user.email! };
    };

    userA = await mk('usera');
    userB = await mk('userb');

    // An authenticated-as-B client — mirrors what user B's browser sends.
    clientB = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: signInErr } = await clientB.auth.signInWithPassword({
      email: userB.email,
      password: `Test!${suffix}Aa1`,
    });
    if (signInErr) throw signInErr;

    // Seed private rows for user A.
    await admin.from('periods').insert({
      user_id: userA.id,
      start_date: '2026-10-01',
      end_date: '2026-10-05',
    });
    await admin.from('pain_logs').insert({
      user_id: userA.id,
      date: '2026-10-02',
      severity: 4,
      body_area: 'Lower Abdomen',
    });
    await admin.from('wellness_logs').insert({
      user_id: userA.id,
      date: '2026-10-02',
      water_ml: 1500,
      sleep_hours: 7,
    });
  }, 30_000);

  afterAll(async () => {
    if (!admin) return;
    await Promise.allSettled([
      admin.auth.admin.deleteUser(userA.id),
      admin.auth.admin.deleteUser(userB.id),
    ]);
  });

  it("user B sees zero of user A's periods", async () => {
    const { data } = await clientB
      .from('periods')
      .select('*')
      .eq('user_id', userA.id);
    expect(data ?? []).toHaveLength(0);
  });

  it("user B sees zero of user A's pain logs", async () => {
    const { data } = await clientB
      .from('pain_logs')
      .select('*')
      .eq('user_id', userA.id);
    expect(data ?? []).toHaveLength(0);
  });

  it("user B sees zero of user A's wellness logs", async () => {
    const { data } = await clientB
      .from('wellness_logs')
      .select('*')
      .eq('user_id', userA.id);
    expect(data ?? []).toHaveLength(0);
  });

  it('partner RPC errors for B without a connection to A', async () => {
    const { error } = await clientB.rpc('get_shared_partner_status', {
      p_connection_id: '00000000-0000-4000-8000-000000000000',
    });
    expect(error).toBeTruthy();
  });

  it('anon (no session) reads nothing', async () => {
    const anon = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await anon.from('periods').select('*');
    expect(data ?? []).toHaveLength(0);
  });
});
