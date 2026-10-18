-- =============================================================
-- OTP request / verify rate limiting with failed-attempt lockout
-- =============================================================
-- Event-log model:
--   * otp_request scope: max 3 requests per email per 10 min,
--     max 10 requests per IP per 10 min.
--   * otp_verify scope: 5 failed verifications per email or IP
--     within 15 minutes locks that identity out until the window clears.
--   * A successful verification clears that identity's recent failures.
-- Table is fully private: no RLS policies, only SECURITY DEFINER access.

create table if not exists public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('otp_request', 'otp_verify')),
  email text not null,
  ip text not null,
  outcome text not null check (outcome in ('request', 'fail', 'success')),
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_attempts_scope_email_created
  on public.auth_attempts (scope, email, created_at desc);
create index if not exists idx_auth_attempts_scope_ip_created
  on public.auth_attempts (scope, ip, created_at desc);
create index if not exists idx_auth_attempts_fail_identity
  on public.auth_attempts (email, created_at desc)
  where outcome = 'fail';
create index if not exists idx_auth_attempts_fail_ip
  on public.auth_attempts (ip, created_at desc)
  where outcome = 'fail';

alter table public.auth_attempts enable row level security;
-- No policies on purpose — deny-all for direct access.
revoke all on table public.auth_attempts from public, anon, authenticated;

-- ── Check: is this identity allowed to make a request / attempt? ─────────────

create or replace function public.auth_rate_check(
  p_scope text,
  p_email text,
  p_ip text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_now timestamptz := now();
  v_email text := lower(coalesce(trim(p_email), ''));
  v_ip text := coalesce(nullif(trim(coalesce(p_ip, '')), ''), 'unknown');
  v_fail_anchor timestamptz;
  v_email_count int;
  v_ip_count int;
  v_window_anchor timestamptz;
begin
  if p_scope not in ('otp_request', 'otp_verify') then
    return jsonb_build_object('allowed', false, 'retry_after_seconds', 60, 'reason', 'invalid_scope');
  end if;

  -- Opportunistic cleanup so the table stays small without a cron job.
  delete from public.auth_attempts where created_at < v_now - interval '7 days';

  -- Failed-attempt lockout: 5th-most-recent failure (email OR ip) in 15 min.
  select a.created_at into v_fail_anchor
  from public.auth_attempts a
  where a.outcome = 'fail'
    and (a.email = v_email or a.ip = v_ip)
    and a.created_at > v_now - interval '15 minutes'
  order by a.created_at desc
  offset 4
  limit 1;

  if v_fail_anchor is not null then
    return jsonb_build_object(
      'allowed', false,
      'retry_after_seconds',
        greatest(1, ceil(extract(epoch from (v_fail_anchor + interval '15 minutes' - v_now)))::int),
      'reason', 'locked'
    );
  end if;

  if p_scope = 'otp_request' then
    select count(*) into v_email_count
    from public.auth_attempts
    where scope = 'otp_request' and outcome = 'request'
      and email = v_email and created_at > v_now - interval '10 minutes';
    if v_email_count >= 3 then
      select min(created_at) into v_window_anchor
      from public.auth_attempts
      where scope = 'otp_request' and outcome = 'request'
        and email = v_email and created_at > v_now - interval '10 minutes';
      return jsonb_build_object(
        'allowed', false,
        'retry_after_seconds',
          greatest(1, ceil(extract(epoch from (v_window_anchor + interval '10 minutes' - v_now)))::int),
        'reason', 'email_window'
      );
    end if;

    select count(*) into v_ip_count
    from public.auth_attempts
    where scope = 'otp_request' and outcome = 'request'
      and ip = v_ip and created_at > v_now - interval '10 minutes';
    if v_ip_count >= 10 then
      select min(created_at) into v_window_anchor
      from public.auth_attempts
      where scope = 'otp_request' and outcome = 'request'
        and ip = v_ip and created_at > v_now - interval '10 minutes';
      return jsonb_build_object(
        'allowed', false,
        'retry_after_seconds',
          greatest(1, ceil(extract(epoch from (v_window_anchor + interval '10 minutes' - v_now)))::int),
        'reason', 'ip_window'
      );
    end if;
  end if;

  return jsonb_build_object('allowed', true, 'retry_after_seconds', 0, 'reason', 'ok');
end;
$$;

-- ── Record: log an attempt event; success clears recent failures ─────────────

create or replace function public.auth_rate_record(
  p_scope text,
  p_email text,
  p_ip text,
  p_outcome text
) returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_email text := lower(coalesce(trim(p_email), ''));
  v_ip text := coalesce(nullif(trim(coalesce(p_ip, '')), ''), 'unknown');
begin
  if p_scope not in ('otp_request', 'otp_verify') then
    return;
  end if;
  if p_outcome not in ('request', 'fail', 'success') then
    return;
  end if;

  insert into public.auth_attempts (scope, email, ip, outcome)
  values (p_scope, v_email, v_ip, p_outcome);

  if p_outcome = 'success' then
    delete from public.auth_attempts
    where outcome = 'fail'
      and (email = v_email or ip = v_ip)
      and created_at > now() - interval '15 minutes';
  end if;
end;
$$;

-- ── Grants: callable pre-auth (anon) for rate checks; nothing else ───────────

revoke all on function public.auth_rate_check(text, text, text) from public;
revoke all on function public.auth_rate_record(text, text, text, text) from public;
grant execute on function public.auth_rate_check(text, text, text) to anon, authenticated;
grant execute on function public.auth_rate_record(text, text, text, text) to anon, authenticated;
