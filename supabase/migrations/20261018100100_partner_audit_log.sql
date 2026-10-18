-- =============================================================
-- Partner sharing audit log
-- =============================================================
-- Records every permission change and connection status change so
-- sharing history is reviewable and non-repudiable. Rows are written
-- only by SECURITY DEFINER functions / triggers (table owner), never
-- by clients. Participants may SELECT their own connection's entries.

create table if not exists public.partner_audit_log (
  id uuid primary key default gen_random_uuid(),
  -- No FK to partner_connections on purpose: the audit trail must
  -- survive connection deletion.
  connection_id uuid,
  actor_user_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_partner_audit_log_connection
  on public.partner_audit_log (connection_id, created_at desc);
create index if not exists idx_partner_audit_log_actor
  on public.partner_audit_log (actor_user_id, created_at desc);

alter table public.partner_audit_log enable row level security;
-- NOT forced: SECURITY DEFINER triggers run as the owner and must be
-- able to insert. RLS still fully applies to anon/authenticated clients.

drop policy if exists "Participants can view partner audit log" on public.partner_audit_log;
create policy "Participants can view partner audit log"
  on public.partner_audit_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.partner_connections pc
      where pc.id = connection_id
        and ((select auth.uid()) = pc.user_id or (select auth.uid()) = pc.partner_user_id)
    )
  );

revoke all on table public.partner_audit_log from public, anon;
revoke insert, update, delete on table public.partner_audit_log from authenticated;
grant select on table public.partner_audit_log to authenticated;

-- ── Permission change trigger ────────────────────────────────────────────────

create or replace function public.audit_partner_permissions()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_changes jsonb := '{}'::jsonb;
  v_col text;
  v_flag_cols text[] := array[
    'share_general_status', 'share_pain_status', 'share_pain_severity',
    'share_pain_location', 'share_pain_type', 'share_mood', 'share_sleep',
    'share_water', 'share_energy', 'share_cycle_status', 'share_period_status',
    'share_comfort_requests'
  ];
begin
  foreach v_col in array v_flag_cols loop
    if (to_jsonb(old) ->> v_col)::boolean is distinct from (to_jsonb(new) ->> v_col)::boolean then
      v_changes := v_changes || jsonb_build_object(v_col, jsonb_build_object(
        'from', (to_jsonb(old) ->> v_col)::boolean,
        'to',   (to_jsonb(new) ->> v_col)::boolean
      ));
    end if;
  end loop;

  if (to_jsonb(old) ->> 'custom_status_message') is distinct from (to_jsonb(new) ->> 'custom_status_message') then
    v_changes := v_changes || jsonb_build_object('custom_status_message', jsonb_build_object(
      'from', to_jsonb(old) ->> 'custom_status_message',
      'to',   to_jsonb(new) ->> 'custom_status_message'
    ));
  end if;

  if v_changes = '{}'::jsonb then
    return new; -- updated_at-only change: nothing meaningful to audit
  end if;

  insert into public.partner_audit_log (connection_id, actor_user_id, action, details)
  values (new.connection_id, (select auth.uid()), 'permissions_updated', v_changes);
  return new;
end;
$$;

drop trigger if exists trg_audit_partner_permissions on public.partner_permissions;
create trigger trg_audit_partner_permissions
  after update on public.partner_permissions
  for each row
  execute function public.audit_partner_permissions();

-- ── Connection status-change trigger ─────────────────────────────────────────

create or replace function public.audit_partner_connection_status()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.partner_audit_log (connection_id, actor_user_id, action, details)
    values (
      new.id,
      (select auth.uid()),
      'connection_' || new.status,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  elsif tg_op = 'DELETE' then
    insert into public.partner_audit_log (connection_id, actor_user_id, action, details)
    values (
      old.id,
      (select auth.uid()),
      'connection_deleted',
      jsonb_build_object('user_id', old.user_id, 'partner_user_id', old.partner_user_id, 'status', old.status)
    );
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_partner_connection on public.partner_connections;
create trigger trg_audit_partner_connection
  after update or delete on public.partner_connections
  for each row
  execute function public.audit_partner_connection_status();
