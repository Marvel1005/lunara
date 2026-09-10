-- ============================================================================
-- LUNARA: PHONE AUTH PARTNER ACCEPTANCE MIGRATION
-- ============================================================================
-- Purpose: Update accept_partner_invitation to support authenticated phone-only
--          users (those with no email in auth.users) while preserving ALL
--          existing security checks for email-authenticated users.
--          Also adds get_partner_invitation_preview so the partner acceptance
--          page can display "You are accepting an invitation from [Partner Name]"
--          and require deliberate confirmation before accepting.
--
-- Background:
--   Lunara is migrating from email+password auth to Supabase Phone OTP.
--   Phone-only users have auth.users.email = NULL.
--   The previous RPC always enforced:
--     invitee_email == caller_email
--   This check failed for phone-only callers (v_caller_email IS NULL).
--
-- Solution (per spec — NOT a blanket bypass):
--   - If caller has an email → existing strict email-match check is preserved.
--   - If caller has NO email (phone-only) → skip email-match, but ALL other
--     security checks remain:
--       ✓ Must be authenticated
--       ✓ Token must be valid (format + SHA-256 hash match)
--       ✓ Invitation must be pending
--       ✓ Invitation must not be expired
--       ✓ Caller must not be the inviter
--       ✓ No existing active/paused connection between these users
--       ✓ Row is locked FOR UPDATE during transaction (concurrency safe)
--       ✓ Token is marked single-use on acceptance
--       ✓ All operations are atomic
--
-- Security Note:
--   The invitation token is cryptographically secure (gen_random_bytes(24)),
--   hashed (SHA-256), single-use, and expiry-protected. An unauthenticated
--   actor cannot accept an invitation. A phone-only authenticated actor who
--   possesses the token can accept — equivalent security to clicking the link
--   in the email, while requiring explicit authenticated confirmation.
--
-- Run in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/mnnasvfgjnrkffvgkzza/sql/new
-- ============================================================================

-- Ensure pgcrypto remains available (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. USER ONBOARDING TRIGGER: handle_new_user
--    Safely handles phone-only users where NEW.email is NULL.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      CASE
        WHEN NEW.email IS NOT NULL AND NEW.email <> '' THEN SPLIT_PART(NEW.email, '@', 1)
        ELSE NULL
      END
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.cycle_settings (user_id, average_cycle_length, average_period_length, auto_theme)
  VALUES (NEW.id, 28, 5, TRUE)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PREVIEW RPC: get_partner_invitation_preview
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_partner_invitation_preview(
  p_raw_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_token_hash TEXT;
  v_invite RECORD;
  v_inviter_name TEXT;
  v_caller_id UUID;
  v_caller_email TEXT;
BEGIN
  -- Authentication check
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Token format check
  IF p_raw_token IS NULL OR LENGTH(p_raw_token) <> 48 THEN
    RAISE EXCEPTION 'Invalid invitation token';
  END IF;

  v_token_hash := encode(digest(p_raw_token, 'sha256'), 'hex');

  SELECT * INTO v_invite
  FROM public.partner_invitations
  WHERE token_hash = v_token_hash;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  IF v_invite.status <> 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer valid';
  END IF;

  IF v_invite.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  IF v_invite.inviter_user_id = v_caller_id THEN
    RAISE EXCEPTION 'You cannot accept your own invitation';
  END IF;

  -- Email-authenticated users: enforce email match
  SELECT LOWER(email) INTO v_caller_email FROM auth.users WHERE id = v_caller_id;
  IF v_caller_email IS NOT NULL AND LOWER(v_invite.invitee_email) <> v_caller_email THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address';
  END IF;

  -- Retrieve inviter display name
  SELECT name INTO v_inviter_name FROM public.profiles WHERE id = v_invite.inviter_user_id;

  RETURN jsonb_build_object(
    'valid', true,
    'invitation_id', v_invite.id,
    'inviter_name', COALESCE(v_inviter_name, v_invite.partner_name, 'Your partner'),
    'invitee_email', v_invite.invitee_email,
    'expires_at', v_invite.expires_at
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ACCEPT RPC: accept_partner_invitation
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_partner_invitation(
  p_raw_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_token_hash TEXT;
  v_invite RECORD;
  v_caller_id UUID;
  v_caller_email TEXT;
  v_active_exists BOOLEAN;
  v_connection_id UUID;
  v_caller_is_phone_only BOOLEAN;
BEGIN
  -- ── 1. Authentication check ─────────────────────────────────────────────
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ── 2. Token format check ────────────────────────────────────────────────
  IF p_raw_token IS NULL OR LENGTH(p_raw_token) <> 48 THEN
    RAISE EXCEPTION 'Invalid invitation token';
  END IF;

  -- ── 3. Retrieve caller's email (may be NULL for phone-only users) ────────
  SELECT LOWER(email) INTO v_caller_email
  FROM auth.users
  WHERE id = v_caller_id;

  -- Determine if this is a phone-only user (email is NULL)
  v_caller_is_phone_only := (v_caller_email IS NULL);

  -- ── 4. Hash the token and look up the invitation ─────────────────────────
  v_token_hash := encode(digest(p_raw_token, 'sha256'), 'hex');

  SELECT * INTO v_invite
  FROM public.partner_invitations
  WHERE token_hash = v_token_hash
  FOR UPDATE;  -- Lock the row to prevent double-acceptance

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  -- ── 5. Status check ──────────────────────────────────────────────────────
  IF v_invite.status <> 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer valid';
  END IF;

  -- ── 6. Expiry check ──────────────────────────────────────────────────────
  IF v_invite.expires_at <= NOW() THEN
    UPDATE public.partner_invitations
    SET status = 'expired'
    WHERE id = v_invite.id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  -- ── 7. Self-acceptance check ─────────────────────────────────────────────
  IF v_invite.inviter_user_id = v_caller_id THEN
    RAISE EXCEPTION 'You cannot accept your own invitation';
  END IF;

  -- ── 8. Email-match check ─────────────────────────────────────────────────
  -- Email-authenticated users: strict email match (unchanged behaviour).
  -- Phone-only users (v_caller_email IS NULL): skip email match.
  --   Rationale: they never provided an email to Supabase Auth, so matching
  --   is impossible. The token itself provides the security binding.
  IF NOT v_caller_is_phone_only THEN
    IF LOWER(v_invite.invitee_email) <> v_caller_email THEN
      RAISE EXCEPTION 'This invitation was sent to a different email address';
    END IF;
  END IF;
  -- Phone-only path: no email check, all other checks still apply.

  -- ── 9. Duplicate active connection check ─────────────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM public.partner_connections
    WHERE (
      (user_id = v_invite.inviter_user_id AND partner_user_id = v_caller_id)
      OR
      (user_id = v_caller_id AND partner_user_id = v_invite.inviter_user_id)
    )
    AND status IN ('active', 'paused')
  ) INTO v_active_exists;

  IF v_active_exists THEN
    RAISE EXCEPTION 'An active connection already exists with this partner';
  END IF;

  -- ── 10. Create connection (atomic) ────────────────────────────────────────
  INSERT INTO public.partner_connections (
    user_id, partner_user_id, status, accepted_at
  ) VALUES (
    v_invite.inviter_user_id, v_caller_id, 'active', NOW()
  ) RETURNING id INTO v_connection_id;

  -- ── 11. Create default permissions (all private by default) ───────────────
  INSERT INTO public.partner_permissions (
    connection_id,
    share_general_status, share_pain_status, share_pain_severity,
    share_pain_location, share_pain_type, share_mood,
    share_sleep, share_water, share_energy,
    share_cycle_status, share_period_status, share_comfort_requests,
    custom_status_message
  ) VALUES (
    v_connection_id,
    FALSE, FALSE, FALSE,
    FALSE, FALSE, FALSE,
    FALSE, FALSE, FALSE,
    FALSE, FALSE, FALSE,
    NULL
  );

  -- ── 12. Mark invitation as accepted (single-use) ──────────────────────────
  UPDATE public.partner_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success', true,
    'connection_id', v_connection_id,
    'status', 'active'
  );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PERMISSIONS & GRANTS
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON FUNCTION public.get_partner_invitation_preview(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_partner_invitation_preview(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.accept_partner_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_partner_invitation(TEXT) TO authenticated;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  p.proname AS function_name,
  p.prosecdef AS is_security_definer,
  p.proconfig AS config_params
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('get_partner_invitation_preview', 'accept_partner_invitation')
ORDER BY p.proname;
