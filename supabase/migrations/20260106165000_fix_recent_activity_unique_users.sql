-- Fix get_recent_activity to show only ONE activity per unique user
-- This prevents the same user from appearing multiple times in the Recent Activity box

DROP FUNCTION IF EXISTS public.get_recent_activity(integer);

CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    activity_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT public.is_user_admin_safe() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Get recent activities from user_activities table
    -- Use DISTINCT ON to show only ONE activity per user (the most recent)
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
            -- Subquery to get only the most recent activity per user
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

COMMENT ON FUNCTION public.get_recent_activity IS 'Returns recent user activities - shows ONE activity per unique user (the most recent one)';
