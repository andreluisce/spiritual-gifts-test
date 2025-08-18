-- =========================================================
-- FIX ALL ADMIN FUNCTIONS - COMPREHENSIVE FIXES
-- =========================================================

-- Drop existing problematic functions
DROP FUNCTION IF EXISTS public.get_users_with_stats();
DROP FUNCTION IF EXISTS public.get_user_activities(INTEGER);
DROP FUNCTION IF EXISTS public.get_user_activities(INTEGER, UUID);

-- Fix get_users_with_stats to use quiz_results_weighted directly
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  user_metadata JSONB,
  quiz_count BIGINT,
  avg_score NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data,
    COALESCE(qs.quiz_count, 0) as quiz_count,
    COALESCE(user_scores.avg_score, 0) as avg_score,
    CASE 
      WHEN u.last_sign_in_at IS NULL THEN 'inactive'
      WHEN u.last_sign_in_at >= NOW() - INTERVAL '30 days' THEN 'active'
      ELSE 'inactive'
    END as status
  FROM auth.users u
  LEFT JOIN (
    SELECT user_id, COUNT(*) as quiz_count
    FROM public.quiz_sessions
    WHERE is_completed = true
    GROUP BY user_id
  ) qs ON qs.user_id = u.id
  LEFT JOIN (
    SELECT 
      qs.user_id,
      AVG(qr.total_weighted) as avg_score
    FROM quiz_sessions qs
    JOIN quiz_results_weighted qr ON qr.session_id = qs.id
    WHERE qs.is_completed = true
    GROUP BY qs.user_id
  ) user_scores ON user_scores.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Create a simplified get_user_activities that uses quiz_sessions as activity source
CREATE OR REPLACE FUNCTION public.get_user_activities(limit_count INTEGER DEFAULT 100)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activities_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email LIKE '%@admin.%')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Return recent quiz activities since user_activities table doesn't exist
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activities(INTEGER) TO authenticated;