-- Force update of get_user_activities with corrected DISTINCT ON logic
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
END;
$$;

COMMENT ON FUNCTION public.get_user_activities IS 'Returns the most recent activity for each user to avoid duplicates in the UI';
