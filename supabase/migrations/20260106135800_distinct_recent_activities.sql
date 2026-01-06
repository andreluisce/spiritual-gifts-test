-- Fix get_user_activities to show only the most recent activity per user
-- This prevents the "Monica Barrense: login 26 min ago, login 27 min ago..." duplicate spam

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
  WITH latest_activities AS (
    SELECT DISTINCT ON (ua.user_id)
      ua.id,
      ua.user_id,
      ua.activity_type,
      COALESCE(ua.details->>'description', ua.activity_type) as activity_description,
      ua.ip_address,
      ua.user_agent,
      ua.details as metadata,
      ua.created_at
    FROM user_activities ua
    -- If user_id is NULL, we don't want to group them together,
    -- so we only apply DISTINCT ON for actual users
    WHERE ua.user_id IS NOT NULL
    ORDER BY ua.user_id, ua.created_at DESC
  )
  SELECT
    la.id,
    la.user_id,
    la.activity_type,
    la.activity_description,
    la.ip_address,
    la.user_agent,
    la.metadata,
    la.created_at,
    jsonb_build_object(
      'email', COALESCE(u.email, ''),
      'full_name', COALESCE(u.raw_user_meta_data->>'name', u.email, '')
    ) as users
  FROM latest_activities la
  LEFT JOIN auth.users u ON la.user_id = u.id
  ORDER BY la.created_at DESC
  LIMIT limit_count;
END;
$$;

COMMENT ON FUNCTION public.get_user_activities IS 'Returns the most recent activity for each user to avoid duplicates in the UI';
