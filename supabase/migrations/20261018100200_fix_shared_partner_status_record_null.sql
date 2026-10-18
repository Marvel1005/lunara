-- Fix: get_shared_partner_status silently dropped all shared data for partners.
--
-- Root cause: in PL/pgSQL, `record IS NOT NULL` is only true when *every*
-- field of the row is non-null. Real log rows (pain_logs, mood_logs,
-- wellness_logs, periods, cycle_settings) almost always contain a NULL column
-- (e.g. notes, end_date, sleep_quality), so `IF v_latest_pain IS NOT NULL`
-- evaluated to false and the function fell through to the "nothing shared"
-- branch even though rows existed.
--
-- Fix: use the FOUND variable, which reflects whether the preceding
-- SELECT ... INTO returned a row, regardless of the row's NULL columns.
--
-- Idempotent: re-defines the function to match supabase/schema.sql.

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

    IF FOUND THEN
      v_avg_period_len := GREATEST(1, COALESCE(v_cycle_settings.average_period_length, 5));
      v_avg_cycle_len := GREATEST(v_avg_period_len, COALESCE(v_cycle_settings.average_cycle_length, 28));
    END IF;

    SELECT * INTO v_latest_period FROM public.periods
    WHERE user_id = v_connection.user_id ORDER BY start_date DESC LIMIT 1;

    IF FOUND THEN
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
    -- ±1 day window: the app stores the device-local date while CURRENT_DATE
    -- follows the database timezone, so strict equality misses logs near midnight.
    SELECT * INTO v_latest_pain FROM public.pain_logs
    WHERE user_id = v_connection.user_id AND date BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1
    ORDER BY date DESC, created_at DESC LIMIT 1;

    IF FOUND AND v_latest_pain.severity > 0 THEN
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
    WHERE user_id = v_connection.user_id AND date BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1
    ORDER BY date DESC, created_at DESC LIMIT 1;

    IF FOUND THEN
      v_result := v_result || jsonb_build_object('mood', v_latest_mood.mood, 'mood_intensity', v_latest_mood.intensity);
    END IF;
  END IF;

  IF v_perms.share_sleep OR v_perms.share_water OR v_perms.share_energy THEN
    SELECT * INTO v_latest_wellness FROM public.wellness_logs
    WHERE user_id = v_connection.user_id AND date BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1
    ORDER BY date DESC, created_at DESC LIMIT 1;

    IF FOUND THEN
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
