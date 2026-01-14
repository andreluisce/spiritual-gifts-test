-- COMPREHENSIVE ADMIN FUNCTION MIGRATION
-- This migration unifies the security logic across all administrative RPC functions,
-- ensuring they all use the robust is_user_manager() check and support metadata-based roles.

-- 1. Ensure user_role_type exists
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('user', 'manager', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Robust get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_role public.user_role_type;
  v_meta_role text;
  v_is_admin boolean;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN 'user'::public.user_role_type;
  END IF;

  -- 1. Try profiles table first
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = v_user_id;

  -- 2. If not found in profile or is 'user', check auth.users metadata for upgrade
  IF v_role IS NULL OR v_role = 'user' THEN
      SELECT
        raw_user_meta_data->>'role',
        COALESCE((raw_user_meta_data->>'is_admin')::boolean, (raw_app_meta_data->>'is_admin')::boolean, false)
      INTO v_meta_role, v_is_admin
      FROM auth.users
      WHERE id = v_user_id;

      IF v_meta_role = 'admin' OR v_is_admin = true THEN
          v_role := 'admin'::public.user_role_type;
      ELSIF v_meta_role = 'manager' THEN
          v_role := 'manager'::public.user_role_type;
      END IF;
  END IF;

  RETURN COALESCE(v_role, 'user'::public.user_role_type);
END;
$$;

-- 3. Unified is_user_manager function
CREATE OR REPLACE FUNCTION public.is_user_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN public.get_user_role() IN ('manager', 'admin');
END;
$$;

-- 4. Unified is_user_admin_safe function
CREATE OR REPLACE FUNCTION public.is_user_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN public.get_user_role() = 'admin';
END;
$$;

-- 5. Update Audit Logs function
CREATE OR REPLACE FUNCTION public.get_audit_logs(
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0,
    action_filter TEXT DEFAULT NULL,
    status_filter TEXT DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_email TEXT,
    action TEXT,
    resource TEXT,
    details JSONB,
    status TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied: Manager privileges required';
    END IF;

    RETURN QUERY
    SELECT
        al.id,
        al.user_id,
        al.user_email,
        al.action,
        al.resource,
        al.details,
        al.status,
        al.ip_address,
        al.user_agent,
        al.created_at
    FROM public.audit_logs al
    WHERE
        (action_filter IS NULL OR al.action = action_filter)
        AND (status_filter IS NULL OR al.status = status_filter)
        AND (
            search_term IS NULL
            OR al.user_email ILIKE '%' || search_term || '%'
            OR al.action ILIKE '%' || search_term || '%'
            OR al.resource ILIKE '%' || search_term || '%'
        )
    ORDER BY al.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 6. Update Recent Activity function (JSON version)
CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    activity_data JSON;
BEGIN
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied: Manager privileges required';
    END IF;

    SELECT json_agg(activity_row)
    INTO activity_data
    FROM (
        SELECT json_build_object(
            'id', ua.id::text,
            'user_email', COALESCE(u.email::TEXT, 'Unknown'),
            'user_name', COALESCE(
                (u.raw_user_meta_data->>'name')::TEXT,
                (u.raw_user_meta_data->>'full_name')::TEXT,
                split_part(u.email, '@', 1)::TEXT,
                'Unknown'
            ),
            'action', COALESCE(ua.details->>'description', ua.activity_type),
            'type', CASE
                WHEN ua.activity_type IN ('login', 'logout', 'account_created') THEN 'user'
                WHEN ua.activity_type IN ('quiz_start', 'quiz_complete') THEN 'quiz'
                WHEN ua.activity_type IN ('profile_update', 'password_change') THEN 'user'
                ELSE 'system'
            END,
            'created_at', ua.created_at
        ) as activity_row
        FROM (
            SELECT DISTINCT ON (ua.user_id)
                ua.id,
                ua.user_id,
                ua.activity_type,
                ua.details,
                ua.created_at
            FROM public.user_activities ua
            WHERE ua.user_id IS NOT NULL
            ORDER BY ua.user_id, ua.created_at DESC
        ) ua
        LEFT JOIN auth.users u ON u.id = ua.user_id
        ORDER BY ua.created_at DESC
        LIMIT limit_count
    ) sub;

    RETURN COALESCE(activity_data, '[]'::JSON);
END;
$$;

-- 7. Update User Lists
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    user_metadata JSONB,
    quiz_count BIGINT,
    avg_score NUMERIC,
    status TEXT,
    approved BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.email::varchar,
        u.created_at,
        u.last_sign_in_at,
        u.raw_user_meta_data,
        (SELECT count(*) FROM public.quiz_sessions qs WHERE qs.user_id = u.id AND qs.is_completed = true)::bigint as quiz_count,
        COALESCE(
            (
                SELECT AVG(qr.total_weighted)
                FROM public.quiz_results_weighted qr
                JOIN public.quiz_sessions qs ON qr.session_id = qs.id
                WHERE qs.user_id = u.id
                AND qs.is_completed = true
            ),
            0.0
        )::numeric as avg_score,
        COALESCE(u.raw_user_meta_data->>'status', u.raw_app_meta_data->>'status', 'active')::text as status,
        COALESCE(p.approved, false) as approved
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at DESC;
END;
$$;

-- 8. Core Stats/Distribution (ensure granted)
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_logs(INT, INT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_stats() TO authenticated;

-- 9. Check Audit Stats specifically
CREATE OR REPLACE FUNCTION public.get_audit_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_events BIGINT;
    events_today BIGINT;
    failed_events BIGINT;
    unique_users BIGINT;
BEGIN
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT COUNT(*) INTO total_events FROM public.audit_logs;
    SELECT COUNT(*) INTO events_today FROM public.audit_logs WHERE created_at >= CURRENT_DATE;
    SELECT COUNT(*) INTO failed_events FROM public.audit_logs WHERE status = 'failed';
    SELECT COUNT(DISTINCT user_id) INTO unique_users FROM public.audit_logs WHERE user_id IS NOT NULL;

    RETURN jsonb_build_object(
        'totalEvents', total_events,
        'eventsToday', events_today,
        'failedEvents', failed_events,
        'uniqueUsers', unique_users
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_audit_stats() TO authenticated;
