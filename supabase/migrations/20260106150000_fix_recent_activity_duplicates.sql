-- Fix get_recent_activity to show actual user activities without duplicates
-- This replaces the old quiz-only activity function with one that shows real user_activities

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
    -- No DISTINCT ON needed because duplicates are prevented at insert time
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
        FROM public.user_activities ua
        LEFT JOIN auth.users u ON u.id = ua.user_id
        WHERE ua.user_id IS NOT NULL
        ORDER BY ua.created_at DESC
        LIMIT limit_count
    ) sub;

    RETURN COALESCE(activity_data, '[]'::JSON);
END;
$$;

COMMENT ON FUNCTION public.get_recent_activity IS 'Returns recent user activities from user_activities table (duplicates prevented at insert time)';

-- Clean up any remaining duplicates in user_activities table
-- Keep only the most recent activity for each user+type combination within 60 second window
DELETE FROM user_activities ua1
WHERE EXISTS (
  SELECT 1
  FROM user_activities ua2
  WHERE ua2.user_id = ua1.user_id
    AND ua2.activity_type = ua1.activity_type
    AND ua2.created_at > ua1.created_at
    AND ua2.created_at - ua1.created_at < INTERVAL '60 seconds'
);

-- Add comment to explain cleanup
COMMENT ON TABLE user_activities IS 'Stores user activity logs with duplicate prevention (60 second threshold per user+activity_type)';
