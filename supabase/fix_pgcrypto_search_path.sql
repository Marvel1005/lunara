-- ============================================================================
-- LUNARA: PGCRYPTO FIX MIGRATION
-- Purpose: Ensure pgcrypto is available and all partner RPC functions can
--          resolve gen_random_bytes() and digest() via extended search_path.
--
-- Root cause: Supabase pre-installs pgcrypto in the 'extensions' schema.
-- The previous RPC functions had SET search_path = public, pg_temp
-- which does NOT include the 'extensions' schema, so gen_random_bytes()
-- could not be resolved at runtime.
--
-- This migration:
--   1. Ensures pgcrypto is installed in both schemas (idempotent)
--   2. Verifies gen_random_bytes(24) works
--   3. Re-creates create_partner_invitation with the correct search_path
--   4. Re-creates accept_partner_invitation with the correct search_path
--   5. Re-creates cancel_partner_invitation with the correct search_path
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/mnnasvfgjnrkffvgkzza/sql/new
-- ============================================================================

-- STEP 1: Ensure pgcrypto is installed
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- STEP 2: Verify gen_random_bytes works (should return a 48-char hex string)
SELECT encode(gen_random_bytes(24), 'hex') as pgcrypto_test;

-- STEP 3: Re-create create_partner_invitation with fixed search_path
CREATE OR REPLACE FUNCTION public.create_partner_invitation(
  p_invitee_email TEXT,
  p_partner_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_raw_token TEXT;
  v_token_hash TEXT;
  v_invite_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_invitee_email IS NULL OR trim(p_invitee_email) = '' THEN RAISE EXCEPTION 'Invitee email is required'; END IF;

  v_email := LOWER(TRIM(p_invitee_email));

  IF EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND LOWER(email) = v_email) THEN
    RAISE EXCEPTION 'You cannot invite yourself';
  END IF;

  -- Uses pgcrypto: gen_random_bytes from extensions schema, digest from extensions schema
  v_raw_token := encode(gen_random_bytes(24), 'hex');
  v_token_hash := encode(digest(v_raw_token, 'sha256'), 'hex');
  v_expires_at := NOW() + INTERVAL '7 days';

  INSERT INTO public.partner_invitations (
    inviter_user_id, invitee_email, partner_name, token_hash, status, expires_at
  ) VALUES (
    auth.uid(), v_email, p_partner_name, v_token_hash, 'pending', v_expires_at
  ) RETURNING id INTO v_invite_id;

  RETURN jsonb_build_object(
    'invitation_id', v_invite_id,
    'invitee_email', v_email,
    'raw_token', v_raw_token,
    'expires_at', v_expires_at
  );
END;
$$;

-- STEP 4: Re-create cancel_partner_invitation with fixed search_path
CREATE OR REPLACE FUNCTION public.cancel_partner_invitation(
  p_invitation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT status INTO v_status FROM public.partner_invitations
  WHERE id = p_invitation_id AND inviter_user_id = auth.uid();

  IF NOT FOUND THEN RAISE EXCEPTION 'Invitation not found or unauthorized'; END IF;
  IF v_status <> 'pending' THEN RAISE EXCEPTION 'Only pending invitations can be cancelled'; END IF;

  UPDATE public.partner_invitations SET status = 'cancelled'
  WHERE id = p_invitation_id AND inviter_user_id = auth.uid() AND status = 'pending';

  RETURN jsonb_build_object('success', true, 'status', 'cancelled');
END;
$$;

-- STEP 5: Re-create accept_partner_invitation with fixed search_path
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
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_raw_token IS NULL OR LENGTH(p_raw_token) <> 48 THEN RAISE EXCEPTION 'Invalid invitation token'; END IF;

  SELECT LOWER(email) INTO v_caller_email FROM auth.users WHERE id = v_caller_id;
  IF v_caller_email IS NULL THEN RAISE EXCEPTION 'Authenticated user email not found'; END IF;

  -- Uses pgcrypto: digest from extensions schema
  v_token_hash := encode(digest(p_raw_token, 'sha256'), 'hex');

  SELECT * INTO v_invite FROM public.partner_invitations
  WHERE token_hash = v_token_hash FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or expired invitation token'; END IF;
  IF v_invite.status <> 'pending' THEN RAISE EXCEPTION 'Invitation is no longer valid'; END IF;

  IF v_invite.expires_at <= NOW() THEN
    UPDATE public.partner_invitations SET status = 'expired' WHERE id = v_invite.id;
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  IF v_invite.inviter_user_id = v_caller_id THEN RAISE EXCEPTION 'You cannot accept your own invitation'; END IF;
  IF LOWER(v_invite.invitee_email) <> v_caller_email THEN RAISE EXCEPTION 'This invitation was sent to a different email address'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.partner_connections
    WHERE (
      (user_id = v_invite.inviter_user_id AND partner_user_id = v_caller_id)
      OR
      (user_id = v_caller_id AND partner_user_id = v_invite.inviter_user_id)
    )
    AND status IN ('active', 'paused')
  ) INTO v_active_exists;

  IF v_active_exists THEN RAISE EXCEPTION 'An active connection already exists with this partner'; END IF;

  INSERT INTO public.partner_connections (
    user_id, partner_user_id, status, accepted_at
  ) VALUES (
    v_invite.inviter_user_id, v_caller_id, 'active', NOW()
  ) RETURNING id INTO v_connection_id;

  INSERT INTO public.partner_permissions (
    connection_id, share_general_status, share_pain_status, share_pain_severity,
    share_cycle_status, share_period_status, share_comfort_requests, custom_status_message
  ) VALUES (
    v_connection_id, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, NULL
  );

  UPDATE public.partner_invitations SET status = 'accepted', accepted_at = NOW() WHERE id = v_invite.id;

  RETURN jsonb_build_object('success', true, 'connection_id', v_connection_id, 'status', 'active');
END;
$$;

-- STEP 6: Re-affirm grants (idempotent)
REVOKE ALL ON FUNCTION public.create_partner_invitation(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_partner_invitation(TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.cancel_partner_invitation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_partner_invitation(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.accept_partner_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_partner_invitation(TEXT) TO authenticated;

-- STEP 7: Verify the function definitions have the correct search_path
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  p.proconfig as config_params
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('create_partner_invitation', 'cancel_partner_invitation', 'accept_partner_invitation')
ORDER BY p.proname;
