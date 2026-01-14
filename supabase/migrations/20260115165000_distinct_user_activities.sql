-- Update get_user_activities to only show distinct activities by type for user profile
-- This ensures that the profile "Recent Activities" list shows the latest occurrence of each activity type
-- instead of flooding the list with multiple repeated events (like multiple logins).

CREATE OR REPLACE FUNCTION public.get_user_activities(
  limit_count INTEGER DEFAULT 50,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  activity_type text,
  activity_description text,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz,
  users jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user_id is provided, show activities for that specific user
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT * FROM (
        SELECT DISTINCT ON (ua.activity_type)
          ua.id,
          ua.user_id,
          ua.activity_type,
          COALESCE(ua.details->>'description', ua.activity_type) as activity_description,
          ua.ip_address,
          ua.user_agent,
          ua.details as metadata,
          ua.created_at,
          jsonb_build_object(
            'email', COALESCE(u.email, ''),
            'full_name', COALESCE(u.raw_user_meta_data->>'name', u.email, '')
          ) as users
        FROM user_activities ua
        LEFT JOIN auth.users u ON ua.user_id = u.id
        WHERE ua.user_id = p_user_id
        ORDER BY ua.activity_type, ua.created_at DESC
    ) sub
    ORDER BY sub.created_at DESC
    LIMIT limit_count;
  ELSE
    -- Otherwise show most recent activity per user (for admin dashboard)
    RETURN QUERY
    SELECT DISTINCT ON (ua.user_id)
      ua.id,
      ua.user_id,
      ua.activity_type,
      COALESCE(ua.details->>'description', ua.activity_type) as activity_description,
      ua.ip_address,
      ua.user_agent,
      ua.details as metadata,
      ua.created_at,
      jsonb_build_object(
        'email', COALESCE(u.email, ''),
        'full_name', COALESCE(u.raw_user_meta_data->>'name', u.email, '')
      ) as users
    FROM user_activities ua
    LEFT JOIN auth.users u ON ua.user_id = u.id
    WHERE ua.user_id IS NOT NULL
    ORDER BY ua.user_id, ua.created_at DESC
    LIMIT limit_count;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_user_activities IS 'Returns user activities - shows one per user (admin) or unique latest activity per type (profile)';
