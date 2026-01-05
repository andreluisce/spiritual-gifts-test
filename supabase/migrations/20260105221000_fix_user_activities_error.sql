-- =========================================================
-- FIX: Create get_user_activities RPC function
-- =========================================================

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
  -- Return empty result for now (table doesn't exist yet)
  -- This prevents the error while we implement the full feature
  RETURN QUERY
  SELECT
    gen_random_uuid() as id,
    auth.uid() as user_id,
    'system'::text as activity_type,
    'No activities yet'::text as activity_description,
    null::text as ip_address,
    null::text as user_agent,
    '{}'::jsonb as metadata,
    now() as created_at,
    jsonb_build_object('email', '', 'full_name', '') as users
  WHERE false; -- Return no rows
END;
$$;

-- Create get_activity_stats RPC function
CREATE OR REPLACE FUNCTION public.get_activity_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return empty stats for now
  RETURN jsonb_build_object(
    'totalActivities', 0,
    'todayActivities', 0,
    'activeUsers', 0,
    'topActivities', '[]'::jsonb
  );
END;
$$;

COMMENT ON FUNCTION public.get_user_activities IS 'Stub function - returns empty activities until user_activities table is created';
COMMENT ON FUNCTION public.get_activity_stats IS 'Stub function - returns empty stats until user_activities table is created';
