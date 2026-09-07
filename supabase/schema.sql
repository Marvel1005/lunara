-- ============================================================================
-- LUNARA DATABASE SCHEMA (IDEMPOTENT & EXECUTABLE)
-- ============================================================================

-- 0. EXTENSIONS
-- Supabase pre-installs pgcrypto in the 'extensions' schema.
-- This is idempotent: IF NOT EXISTS skips if already present.
-- All RPC functions use SET search_path = public, extensions, pg_temp
-- so gen_random_bytes() and digest() are always resolvable.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- Fallback: also ensure it exists in public if extensions schema unavailable
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CYCLE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.cycle_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  average_cycle_length INT NOT NULL DEFAULT 28,
  average_period_length INT NOT NULL DEFAULT 5,
  auto_theme BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PERIODS TABLE
CREATE TABLE IF NOT EXISTS public.periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow TEXT CHECK (flow IN ('spotting', 'light', 'medium', 'heavy')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SYMPTOMS TABLE
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptom TEXT NOT NULL,
  severity INT CHECK (severity BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PAIN LOGS TABLE
CREATE TABLE IF NOT EXISTS public.pain_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  body_area TEXT NOT NULL,
  severity INT CHECK (severity BETWEEN 0 AND 10),
  pain_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. MOOD LOGS TABLE
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  intensity INT CHECK (intensity BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. WELLNESS LOGS TABLE
CREATE TABLE IF NOT EXISTS public.wellness_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  water_ml INT DEFAULT 0,
  sleep_hours NUMERIC(3,1) DEFAULT 0,
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
  energy TEXT CHECK (energy IN ('very low', 'low', 'okay', 'good', 'high')),
  activity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CRAVINGS TABLE
CREATE TABLE IF NOT EXISTS public.cravings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  craving TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  movie_genres TEXT[],
  movie_languages TEXT[],
  music_preferences TEXT[],
  comfort_preferences TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PARTNER CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.partner_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'revoked')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_partner_connections_different_users CHECK (user_id <> partner_user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_connections_pair
ON public.partner_connections (
  LEAST(user_id, partner_user_id),
  GREATEST(user_id, partner_user_id)
)
WHERE status IN ('active', 'paused');

CREATE INDEX IF NOT EXISTS idx_partner_connections_user_id ON public.partner_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_connections_partner_user_id ON public.partner_connections(partner_user_id);

-- 12. PARTNER INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  partner_name TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_invitations_token_hash ON public.partner_invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_invitee_email ON public.partner_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_inviter_status ON public.partner_invitations(inviter_user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_partner_invitation
ON public.partner_invitations (inviter_user_id, LOWER(invitee_email))
WHERE status = 'pending';

-- 13. PARTNER PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.partner_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL UNIQUE REFERENCES public.partner_connections(id) ON DELETE CASCADE,
  share_general_status BOOLEAN NOT NULL DEFAULT FALSE,
  share_pain_status BOOLEAN NOT NULL DEFAULT FALSE,
  share_pain_severity BOOLEAN NOT NULL DEFAULT FALSE,
  share_pain_location BOOLEAN NOT NULL DEFAULT FALSE,
  share_pain_type BOOLEAN NOT NULL DEFAULT FALSE,
  share_mood BOOLEAN NOT NULL DEFAULT FALSE,
  share_sleep BOOLEAN NOT NULL DEFAULT FALSE,
  share_water BOOLEAN NOT NULL DEFAULT FALSE,
  share_energy BOOLEAN NOT NULL DEFAULT FALSE,
  share_cycle_status BOOLEAN NOT NULL DEFAULT FALSE,
  share_period_status BOOLEAN NOT NULL DEFAULT FALSE,
  share_comfort_requests BOOLEAN NOT NULL DEFAULT FALSE,
  custom_status_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_permissions_connection_id ON public.partner_permissions(connection_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_periods_user_id_start_date ON public.periods(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_id_date ON public.symptoms(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_pain_logs_user_id_date ON public.pain_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id_date ON public.mood_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_logs_user_id_date ON public.wellness_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cravings_user_id_date ON public.cravings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_date ON public.journal_entries(user_id, date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cravings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_permissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cycle settings policies
DROP POLICY IF EXISTS "Users can manage own cycle_settings" ON public.cycle_settings;
CREATE POLICY "Users can manage own cycle_settings" ON public.cycle_settings FOR ALL USING (auth.uid() = user_id);

-- Periods policies
DROP POLICY IF EXISTS "Users can manage own periods" ON public.periods;
CREATE POLICY "Users can manage own periods" ON public.periods FOR ALL USING (auth.uid() = user_id);

-- Symptoms policies
DROP POLICY IF EXISTS "Users can manage own symptoms" ON public.symptoms;
CREATE POLICY "Users can manage own symptoms" ON public.symptoms FOR ALL USING (auth.uid() = user_id);

-- Pain logs policies
DROP POLICY IF EXISTS "Users can manage own pain_logs" ON public.pain_logs;
CREATE POLICY "Users can manage own pain_logs" ON public.pain_logs FOR ALL USING (auth.uid() = user_id);

-- Mood logs policies
DROP POLICY IF EXISTS "Users can manage own mood_logs" ON public.mood_logs;
CREATE POLICY "Users can manage own mood_logs" ON public.mood_logs FOR ALL USING (auth.uid() = user_id);

-- Wellness logs policies
DROP POLICY IF EXISTS "Users can manage own wellness_logs" ON public.wellness_logs;
CREATE POLICY "Users can manage own wellness_logs" ON public.wellness_logs FOR ALL USING (auth.uid() = user_id);

-- Cravings policies
DROP POLICY IF EXISTS "Users can manage own cravings" ON public.cravings;
CREATE POLICY "Users can manage own cravings" ON public.cravings FOR ALL USING (auth.uid() = user_id);

-- Journal entries policies
DROP POLICY IF EXISTS "Users can manage own journal_entries" ON public.journal_entries;
CREATE POLICY "Users can manage own journal_entries" ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

-- Preferences policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.preferences;
CREATE POLICY "Users can manage own preferences" ON public.preferences FOR ALL USING (auth.uid() = user_id);

-- Partner connections policy (SELECT only)
DROP POLICY IF EXISTS "Participants can view connections" ON public.partner_connections;
CREATE POLICY "Participants can view connections"
ON public.partner_connections FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.uid() = partner_user_id);

-- Partner invitations policy (SELECT only)
DROP POLICY IF EXISTS "Inviter can view own invitations" ON public.partner_invitations;
CREATE POLICY "Inviter can view own invitations"
ON public.partner_invitations FOR SELECT TO authenticated
USING (auth.uid() = inviter_user_id);

-- Partner permissions policy (SELECT only)
DROP POLICY IF EXISTS "Primary user can select permissions" ON public.partner_permissions;
CREATE POLICY "Primary user can select permissions"
ON public.partner_permissions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.partner_connections pc
    WHERE pc.id = partner_permissions.connection_id AND pc.user_id = auth.uid()
  )
);

-- ============================================================================
-- CONNECTION IMMUTABILITY & TRANSITION CONTROL TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_partner_connection_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF OLD.user_id <> NEW.user_id OR OLD.partner_user_id <> NEW.partner_user_id THEN
    RAISE EXCEPTION 'Connection ownership cannot be modified';
  END IF;

  IF OLD.status = 'revoked' AND NEW.status IN ('active', 'paused') THEN
    RAISE EXCEPTION 'A revoked connection cannot be reactivated';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_partner_connection_immutability ON public.partner_connections;
CREATE TRIGGER trg_partner_connection_immutability
BEFORE UPDATE ON public.partner_connections
FOR EACH ROW EXECUTE FUNCTION public.enforce_partner_connection_immutability();

-- ============================================================================
-- AUTOMATIC PROFILE & SETTINGS CREATION TRIGGER
-- ============================================================================
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
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
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

-- ============================================================================
-- PARTNER SUPPORT RPC FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- 1. CREATE PARTNER INVITATION
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

-- 2. CANCEL PARTNER INVITATION
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

-- 3. ACCEPT PARTNER INVITATION
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

-- 4. UPDATE PARTNER PERMISSIONS
CREATE OR REPLACE FUNCTION public.update_partner_permissions(
  p_connection_id UUID,
  p_share_general_status BOOLEAN,
  p_share_pain_status BOOLEAN,
  p_share_pain_severity BOOLEAN,
  p_share_pain_location BOOLEAN DEFAULT FALSE,
  p_share_pain_type BOOLEAN DEFAULT FALSE,
  p_share_mood BOOLEAN DEFAULT FALSE,
  p_share_sleep BOOLEAN DEFAULT FALSE,
  p_share_water BOOLEAN DEFAULT FALSE,
  p_share_energy BOOLEAN DEFAULT FALSE,
  p_share_cycle_status BOOLEAN DEFAULT FALSE,
  p_share_period_status BOOLEAN DEFAULT FALSE,
  p_share_comfort_requests BOOLEAN DEFAULT FALSE,
  p_custom_status_message TEXT DEFAULT NULL
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

  SELECT status INTO v_status FROM public.partner_connections
  WHERE id = p_connection_id AND user_id = auth.uid();

  IF NOT FOUND THEN RAISE EXCEPTION 'Connection not found or unauthorized'; END IF;
  IF v_status = 'revoked' THEN RAISE EXCEPTION 'Permissions cannot be changed on a revoked connection'; END IF;

  UPDATE public.partner_permissions
  SET
    share_general_status = COALESCE(p_share_general_status, FALSE),
    share_pain_status = COALESCE(p_share_pain_status, FALSE),
    share_pain_severity = CASE WHEN COALESCE(p_share_pain_status, FALSE) = FALSE THEN FALSE ELSE COALESCE(p_share_pain_severity, FALSE) END,
    share_pain_location = CASE WHEN COALESCE(p_share_pain_status, FALSE) = FALSE THEN FALSE ELSE COALESCE(p_share_pain_location, FALSE) END,
    share_pain_type = CASE WHEN COALESCE(p_share_pain_status, FALSE) = FALSE THEN FALSE ELSE COALESCE(p_share_pain_type, FALSE) END,
    share_mood = COALESCE(p_share_mood, FALSE),
    share_sleep = COALESCE(p_share_sleep, FALSE),
    share_water = COALESCE(p_share_water, FALSE),
    share_energy = COALESCE(p_share_energy, FALSE),
    share_cycle_status = COALESCE(p_share_cycle_status, FALSE),
    share_period_status = COALESCE(p_share_period_status, FALSE),
    share_comfort_requests = COALESCE(p_share_comfort_requests, FALSE),
    custom_status_message = CASE WHEN COALESCE(p_share_comfort_requests, FALSE) THEN NULLIF(TRIM(p_custom_status_message), '') ELSE NULL END,
    updated_at = NOW()
  WHERE connection_id = p_connection_id;

  IF NOT FOUND THEN RAISE EXCEPTION 'Permission record not found'; END IF;

  RETURN jsonb_build_object(
    'success', true,
    'connection_id', p_connection_id,
    'share_general_status', p_share_general_status,
    'share_pain_status', p_share_pain_status,
    'share_pain_severity', CASE WHEN p_share_pain_status THEN p_share_pain_severity ELSE FALSE END,
    'share_pain_location', CASE WHEN p_share_pain_status THEN p_share_pain_location ELSE FALSE END,
    'share_pain_type', CASE WHEN p_share_pain_status THEN p_share_pain_type ELSE FALSE END,
    'share_mood', p_share_mood,
    'share_sleep', p_share_sleep,
    'share_water', p_share_water,
    'share_energy', p_share_energy,
    'share_cycle_status', p_share_cycle_status,
    'share_period_status', p_share_period_status,
    'share_comfort_requests', p_share_comfort_requests
  );
END;
$$;

-- 5. PAUSE CONNECTION
CREATE OR REPLACE FUNCTION public.pause_partner_connection(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT status INTO v_status FROM public.partner_connections
  WHERE id = p_connection_id AND user_id = auth.uid();

  IF NOT FOUND THEN RAISE EXCEPTION 'Connection not found or unauthorized'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Only active connections can be paused'; END IF;

  UPDATE public.partner_connections SET status = 'paused' WHERE id = p_connection_id AND user_id = auth.uid() AND status = 'active';

  RETURN jsonb_build_object('success', true, 'status', 'paused');
END;
$$;

-- 6. RESUME CONNECTION
CREATE OR REPLACE FUNCTION public.resume_partner_connection(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT status INTO v_status FROM public.partner_connections
  WHERE id = p_connection_id AND user_id = auth.uid();

  IF NOT FOUND THEN RAISE EXCEPTION 'Connection not found or unauthorized'; END IF;
  IF v_status <> 'paused' THEN RAISE EXCEPTION 'Only paused connections can be resumed'; END IF;

  UPDATE public.partner_connections SET status = 'active' WHERE id = p_connection_id AND user_id = auth.uid() AND status = 'paused';

  RETURN jsonb_build_object('success', true, 'status', 'active');
END;
$$;

-- 7. REVOKE CONNECTION
CREATE OR REPLACE FUNCTION public.revoke_partner_connection(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_status TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT status INTO v_status FROM public.partner_connections
  WHERE id = p_connection_id AND (user_id = auth.uid() OR partner_user_id = auth.uid());

  IF NOT FOUND THEN RAISE EXCEPTION 'Connection not found or unauthorized'; END IF;
  IF v_status = 'revoked' THEN RAISE EXCEPTION 'Connection is already revoked'; END IF;

  UPDATE public.partner_connections SET status = 'revoked'
  WHERE id = p_connection_id AND (user_id = auth.uid() OR partner_user_id = auth.uid()) AND status IN ('active', 'paused');

  RETURN jsonb_build_object('success', true, 'status', 'revoked');
END;
$$;

-- 8. GET MY CONNECTIONS
CREATE OR REPLACE FUNCTION public.get_my_partner_connections()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('error', 'Not authenticated'); END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'connection_id', pc.id,
        'partner_user_id', pc.partner_user_id,
        'status', pc.status,
        'created_at', pc.created_at,
        'accepted_at', pc.accepted_at,
        'permissions', jsonb_build_object(
          'share_general_status', COALESCE(pp.share_general_status, FALSE),
          'share_pain_status', COALESCE(pp.share_pain_status, FALSE),
          'share_pain_severity', COALESCE(pp.share_pain_severity, FALSE),
          'share_pain_location', COALESCE(pp.share_pain_location, FALSE),
          'share_pain_type', COALESCE(pp.share_pain_type, FALSE),
          'share_mood', COALESCE(pp.share_mood, FALSE),
          'share_sleep', COALESCE(pp.share_sleep, FALSE),
          'share_water', COALESCE(pp.share_water, FALSE),
          'share_energy', COALESCE(pp.share_energy, FALSE),
          'share_cycle_status', COALESCE(pp.share_cycle_status, FALSE),
          'share_period_status', COALESCE(pp.share_period_status, FALSE),
          'share_comfort_requests', COALESCE(pp.share_comfort_requests, FALSE)
        )
      )
      ORDER BY pc.created_at DESC
    ),
    '[]'::jsonb
  ) INTO v_result
  FROM public.partner_connections pc
  LEFT JOIN public.partner_permissions pp ON pp.connection_id = pc.id
  WHERE pc.user_id = auth.uid();

  RETURN jsonb_build_object('connections', v_result);
END;
$$;

-- 9. CONTROLLED SHARED PARTNER STATUS
CREATE OR REPLACE FUNCTION public.get_shared_partner_status(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
DECLARE
  v_connection RECORD;
  v_perms RECORD;
  v_latest_period RECORD;
  v_latest_pain RECORD;
  v_latest_mood RECORD;
  v_latest_wellness RECORD;
  v_cycle_settings RECORD;
  v_user_name TEXT;
  v_result JSONB := '{}'::jsonb;
  v_is_period_active BOOLEAN := FALSE;
  v_avg_period_len INT := 5;
  v_avg_cycle_len INT := 28;
  v_days_since_period_start INT;
  v_cycle_day INT;
  v_ovulation_day INT;
  v_calculated_phase TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('error', 'Not authenticated'); END IF;

  SELECT * INTO v_connection FROM public.partner_connections
  WHERE id = p_connection_id AND partner_user_id = auth.uid();

  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Unauthorized or connection not found'); END IF;
  IF v_connection.status <> 'active' THEN
    RETURN jsonb_build_object('connection_status', v_connection.status, 'shared_summary', 'Nothing shared right now');
  END IF;

  SELECT name INTO v_user_name FROM public.profiles WHERE id = v_connection.user_id;
  SELECT * INTO v_perms FROM public.partner_permissions WHERE connection_id = p_connection_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('connection_status', v_connection.status, 'user_name', COALESCE(v_user_name, 'Your Partner'), 'shared_summary', 'Nothing shared right now');
  END IF;

  v_result := jsonb_build_object('connection_status', v_connection.status, 'user_name', COALESCE(v_user_name, 'Your Partner'));

  IF v_perms.share_general_status THEN
    v_result := v_result || jsonb_build_object('general_status_message', 'I could use some extra care today.');
  END IF;

  IF v_perms.share_comfort_requests THEN
    v_result := v_result || jsonb_build_object('custom_comfort_request', v_perms.custom_status_message);
  END IF;

  IF v_perms.share_period_status OR v_perms.share_cycle_status THEN
    SELECT * INTO v_cycle_settings FROM public.cycle_settings WHERE user_id = v_connection.user_id LIMIT 1;

    IF v_cycle_settings IS NOT NULL THEN
      v_avg_period_len := GREATEST(1, COALESCE(v_cycle_settings.average_period_length, 5));
      v_avg_cycle_len := GREATEST(v_avg_period_len, COALESCE(v_cycle_settings.average_cycle_length, 28));
    END IF;

    SELECT * INTO v_latest_period FROM public.periods
    WHERE user_id = v_connection.user_id ORDER BY start_date DESC LIMIT 1;

    IF v_latest_period IS NOT NULL THEN
      v_days_since_period_start := CURRENT_DATE - v_latest_period.start_date::date;

      IF v_days_since_period_start >= 0 THEN
        IF v_latest_period.end_date IS NOT NULL THEN
          v_is_period_active := v_latest_period.end_date::date >= CURRENT_DATE;
        ELSE
          v_is_period_active := v_days_since_period_start < v_avg_period_len;
        END IF;

        IF v_perms.share_period_status THEN
          v_result := v_result || jsonb_build_object('is_period_active', v_is_period_active);
        END IF;

        IF v_perms.share_cycle_status THEN
          v_cycle_day := (v_days_since_period_start % v_avg_cycle_len) + 1;
          v_ovulation_day := GREATEST(1, v_avg_cycle_len - 14);

          IF v_cycle_day <= v_avg_period_len THEN
            v_calculated_phase := 'Menstrual Phase';
          ELSIF v_cycle_day < (v_ovulation_day - 1) THEN
            v_calculated_phase := 'Follicular Phase';
          ELSIF v_cycle_day <= (v_ovulation_day + 1) THEN
            v_calculated_phase := 'Estimated Ovulation';
          ELSE
            v_calculated_phase := 'Luteal Phase';
          END IF;

          v_result := v_result || jsonb_build_object('cycle_phase', v_calculated_phase, 'cycle_phase_is_estimated', TRUE);
        END IF;
      END IF;
    END IF;
  END IF;

  IF v_perms.share_pain_status THEN
    SELECT * INTO v_latest_pain FROM public.pain_logs
    WHERE user_id = v_connection.user_id AND date = CURRENT_DATE
    ORDER BY created_at DESC LIMIT 1;

    IF v_latest_pain IS NOT NULL AND v_latest_pain.severity > 0 THEN
      v_result := v_result || jsonb_build_object('has_pain_today', TRUE, 'pain_status_message', 'Experiencing a painful day');
      IF v_perms.share_pain_severity THEN
        v_result := v_result || jsonb_build_object('pain_severity', GREATEST(0, LEAST(10, v_latest_pain.severity)));
      END IF;
      IF v_perms.share_pain_location AND v_latest_pain.body_area IS NOT NULL THEN
        v_result := v_result || jsonb_build_object('pain_location', v_latest_pain.body_area);
      END IF;
      IF v_perms.share_pain_type AND v_latest_pain.pain_type IS NOT NULL THEN
        v_result := v_result || jsonb_build_object('pain_type', v_latest_pain.pain_type);
      END IF;
    ELSE
      v_result := v_result || jsonb_build_object('has_pain_today', FALSE);
    END IF;
  END IF;

  IF v_perms.share_mood THEN
    SELECT * INTO v_latest_mood FROM public.mood_logs
    WHERE user_id = v_connection.user_id AND date = CURRENT_DATE
    ORDER BY created_at DESC LIMIT 1;

    IF v_latest_mood IS NOT NULL THEN
      v_result := v_result || jsonb_build_object('mood', v_latest_mood.mood, 'mood_intensity', v_latest_mood.intensity);
    END IF;
  END IF;

  IF v_perms.share_sleep OR v_perms.share_water OR v_perms.share_energy THEN
    SELECT * INTO v_latest_wellness FROM public.wellness_logs
    WHERE user_id = v_connection.user_id AND date = CURRENT_DATE
    ORDER BY created_at DESC LIMIT 1;

    IF v_latest_wellness IS NOT NULL THEN
      IF v_perms.share_sleep THEN
        v_result := v_result || jsonb_build_object('sleep_hours', v_latest_wellness.sleep_hours, 'sleep_quality', v_latest_wellness.sleep_quality);
      END IF;
      IF v_perms.share_water THEN
        v_result := v_result || jsonb_build_object('water_ml', v_latest_wellness.water_ml);
      END IF;
      IF v_perms.share_energy THEN
        v_result := v_result || jsonb_build_object('energy', v_latest_wellness.energy);
      END IF;
    END IF;
  END IF;

  IF NOT (v_perms.share_general_status OR v_perms.share_pain_status OR v_perms.share_cycle_status OR v_perms.share_period_status OR v_perms.share_comfort_requests OR v_perms.share_mood OR v_perms.share_sleep OR v_perms.share_water OR v_perms.share_energy) THEN
    v_result := v_result || jsonb_build_object('shared_summary', 'Nothing shared right now');
  END IF;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- REMOVE ALL PUBLIC EXECUTION & FORCE RLS
-- ============================================================================
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.create_partner_invitation(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_partner_invitation(TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.cancel_partner_invitation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_partner_invitation(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.accept_partner_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_partner_invitation(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.update_partner_permissions(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_partner_permissions(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.pause_partner_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pause_partner_connection(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.resume_partner_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resume_partner_connection(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_partner_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_partner_connection(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_partner_connections() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_partner_connections() TO authenticated;

REVOKE ALL ON FUNCTION public.get_shared_partner_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_partner_status(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.pause_partner_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pause_partner_connection(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.resume_partner_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resume_partner_connection(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_partner_connection(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_partner_connection(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.get_my_partner_connections() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_partner_connections() TO authenticated;

REVOKE ALL ON FUNCTION public.get_shared_partner_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_partner_status(UUID) TO authenticated;

-- FORCE RLS FOR TABLE OWNERS (DEFENSE-IN-DEPTH)
ALTER TABLE public.partner_connections FORCE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.partner_permissions FORCE ROW LEVEL SECURITY;

