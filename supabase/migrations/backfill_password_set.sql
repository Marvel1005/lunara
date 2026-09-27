-- ============================================================================
-- ONE-TIME BACKFILL: password_set for pre-existing accounts
-- ============================================================================
-- Context: the mandatory-password-setup feature (middleware gate +
-- /set-password) keys off profiles.password_set, which defaults to FALSE
-- for every row created before the feature shipped — including users who
-- already set a password via the old Settings → Security flow. Without
-- this backfill they would be force-routed to /set-password on next login
-- despite already having one.
--
-- Run once in the Supabase SQL Editor (postgres role can read auth.users).
-- Safe to re-run: the WHERE clause only touches rows still marked false.
-- ============================================================================

UPDATE public.profiles p
SET password_set = true
WHERE p.password_set = false
  AND EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = p.id
      AND u.encrypted_password IS NOT NULL
      AND u.encrypted_password <> ''
  );
