-- Update get_user_activities and get_activity_stats to return real data
DROP FUNCTION IF EXISTS public.get_user_activities(integer);
CREATE OR REPLACE FUNCTION public.get_user_activities(limit_count integer DEFAULT 50)
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
  RETURN QUERY
  SELECT
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
  ORDER BY ua.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Update get_activity_stats to return real statistics
DROP FUNCTION IF EXISTS public.get_activity_stats();
CREATE OR REPLACE FUNCTION public.get_activity_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalActivities', (SELECT count(*) FROM user_activities),
    'todayActivities', (SELECT count(*) FROM user_activities WHERE created_at > date_trunc('day', now())),
    'activeUsers', (SELECT count(DISTINCT user_id) FROM user_activities WHERE created_at > now() - interval '24 hours'),
    'topActivities', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'type', activity_type,
          'count', activity_count
        )
        ORDER BY activity_count DESC
      ), '[]'::jsonb)
      FROM (
        SELECT
          activity_type,
          count(*) as activity_count
        FROM user_activities
        GROUP BY activity_type
        ORDER BY activity_count DESC
        LIMIT 10
      ) top_acts
    )
  ) INTO result;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_user_activities IS 'Returns user activities from user_activities table';
COMMENT ON FUNCTION public.get_activity_stats IS 'Returns activity statistics from user_activities table';
