-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- Fixes: function privileges, missing index, RLS performance pattern
-- ============================================================================

-- 1. REVOKE EXECUTE from ALL roles, then grant only to authenticated
-- ---------------------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_partner_invitation(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_partner_invitation(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.accept_partner_invitation(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_partner_permissions(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pause_partner_connection(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resume_partner_connection(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.revoke_partner_connection(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_partner_connections() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_shared_partner_status(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_partner_invitation_preview(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Grant only the functions the app needs from authenticated users
GRANT EXECUTE ON FUNCTION public.create_partner_invitation(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_partner_invitation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_partner_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_partner_permissions(uuid, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pause_partner_connection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resume_partner_connection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_partner_connection(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_partner_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_partner_status(uuid) TO authenticated;

-- Do NOT grant: handle_new_user (trigger only), get_partner_invitation_preview, rls_auto_enable

-- 2. MISSING INDEX
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_partner_suggestions_author_user_id
ON public.partner_suggestions(author_user_id);

-- 3. RLS POLICIES: use (SELECT auth.uid()) for performance
-- ---------------------------------------------------------------------------

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- cycle_settings
DROP POLICY IF EXISTS "Users can manage own cycle_settings" ON public.cycle_settings;
CREATE POLICY "Users can manage own cycle_settings" ON public.cycle_settings
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- periods
DROP POLICY IF EXISTS "Users can manage own periods" ON public.periods;
CREATE POLICY "Users can manage own periods" ON public.periods
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- symptoms
DROP POLICY IF EXISTS "Users can manage own symptoms" ON public.symptoms;
CREATE POLICY "Users can manage own symptoms" ON public.symptoms
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- pain_logs
DROP POLICY IF EXISTS "Users can manage own pain_logs" ON public.pain_logs;
CREATE POLICY "Users can manage own pain_logs" ON public.pain_logs
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- mood_logs
DROP POLICY IF EXISTS "Users can manage own mood_logs" ON public.mood_logs;
CREATE POLICY "Users can manage own mood_logs" ON public.mood_logs
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- wellness_logs
DROP POLICY IF EXISTS "Users can manage own wellness_logs" ON public.wellness_logs;
CREATE POLICY "Users can manage own wellness_logs" ON public.wellness_logs
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- cravings
DROP POLICY IF EXISTS "Users can manage own cravings" ON public.cravings;
CREATE POLICY "Users can manage own cravings" ON public.cravings
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- journal_entries
DROP POLICY IF EXISTS "Users can manage own journal_entries" ON public.journal_entries;
CREATE POLICY "Users can manage own journal_entries" ON public.journal_entries
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.preferences;
CREATE POLICY "Users can manage own preferences" ON public.preferences
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- partner_connections
DROP POLICY IF EXISTS "Participants can view connections" ON public.partner_connections;
CREATE POLICY "Participants can view connections"
  ON public.partner_connections FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = partner_user_id);

-- partner_invitations
DROP POLICY IF EXISTS "Inviter can view own invitations" ON public.partner_invitations;
CREATE POLICY "Inviter can view own invitations"
  ON public.partner_invitations FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = inviter_user_id);

-- partner_suggestions (SELECT)
DROP POLICY IF EXISTS "Participants can view suggestions" ON public.partner_suggestions;
CREATE POLICY "Participants can view suggestions"
  ON public.partner_suggestions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_connections pc
      WHERE pc.id = partner_suggestions.connection_id
        AND (pc.user_id = (SELECT auth.uid()) OR pc.partner_user_id = (SELECT auth.uid()))
        AND pc.status IN ('active', 'paused')
    )
  );

-- partner_suggestions (INSERT)
DROP POLICY IF EXISTS "Supporting partner can suggest" ON public.partner_suggestions;
CREATE POLICY "Supporting partner can suggest"
  ON public.partner_suggestions FOR INSERT TO authenticated
  WITH CHECK (
    author_user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.partner_connections pc
      WHERE pc.id = partner_suggestions.connection_id
        AND pc.partner_user_id = (SELECT auth.uid())
        AND pc.status = 'active'
    )
  );

-- partner_suggestions (DELETE)
DROP POLICY IF EXISTS "Authors can delete own suggestions" ON public.partner_suggestions;
CREATE POLICY "Authors can delete own suggestions"
  ON public.partner_suggestions FOR DELETE TO authenticated
  USING (author_user_id = (SELECT auth.uid()));

-- partner_permissions
DROP POLICY IF EXISTS "Primary user can select permissions" ON public.partner_permissions;
CREATE POLICY "Primary user can select permissions"
  ON public.partner_permissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_connections pc
      WHERE pc.id = partner_permissions.connection_id AND pc.user_id = (SELECT auth.uid())
    )
  );
