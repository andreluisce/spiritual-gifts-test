-- =========================================================
-- FIX USER ACTIVITIES PERMISSIONS FOR TESTING
-- =========================================================

-- Drop and recreate get_user_activities with more permissive access for now
DROP FUNCTION IF EXISTS public.get_user_activities(INTEGER);

CREATE OR REPLACE FUNCTION public.get_user_activities(limit_count INTEGER DEFAULT 100)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activities_data JSON;
BEGIN
    -- Return recent quiz activities
    SELECT json_agg(
        json_build_object(
            'id', qs.id,
            'user_id', qs.user_id,
            'user_email', COALESCE(u.email::TEXT, 'Unknown'),
            'user_name', COALESCE(
                (u.raw_user_meta_data->>'name')::TEXT, 
                split_part(u.email, '@', 1)::TEXT,
                'Unknown'
            ),
            'activity_type', CASE 
                WHEN qs.is_completed THEN 'quiz_completed'
                ELSE 'quiz_started'
            END,
            'activity_description', CASE 
                WHEN qs.is_completed THEN 'Completed spiritual gifts quiz'
                ELSE 'Started spiritual gifts quiz'
            END,
            'ip_address', NULL::INET,
            'user_agent', NULL::TEXT,
            'metadata', json_build_object(
                'session_id', qs.id,
                'completed', qs.is_completed
            )::JSONB,
            'created_at', COALESCE(qs.completed_at, qs.created_at)
        )
        ORDER BY COALESCE(qs.completed_at, qs.created_at) DESC
    ) INTO activities_data
    FROM (
        SELECT * FROM public.quiz_sessions
        ORDER BY COALESCE(completed_at, created_at) DESC
        LIMIT limit_count
    ) qs
    LEFT JOIN auth.users u ON u.id = qs.user_id;
    
    RETURN COALESCE(activities_data, '[]'::JSON);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_activities(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activities(INTEGER) TO anon;