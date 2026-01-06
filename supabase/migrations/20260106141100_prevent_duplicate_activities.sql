-- Add helper function to check if user has recent activity of same type
-- This prevents duplicate login events from being logged
CREATE OR REPLACE FUNCTION public.should_log_activity(
  p_user_id uuid,
  p_activity_type text,
  p_threshold_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_activity_exists boolean;
BEGIN
  -- Check if there's a recent activity of the same type within threshold
  SELECT EXISTS (
    SELECT 1
    FROM user_activities
    WHERE user_id = p_user_id
      AND activity_type = p_activity_type
      AND created_at > NOW() - (p_threshold_seconds || ' seconds')::interval
  ) INTO recent_activity_exists;

  -- Return true if we should log (no recent duplicate), false otherwise
  RETURN NOT recent_activity_exists;
END;
$$;

-- Update log_user_activity to check for duplicates before inserting
DROP FUNCTION IF EXISTS public.log_user_activity(uuid, text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_description text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if there's no recent duplicate activity
  IF should_log_activity(p_user_id, p_activity_type, 60) THEN
    INSERT INTO user_activities (
      user_id,
      activity_type,
      ip_address,
      user_agent,
      details
    ) VALUES (
      p_user_id,
      p_activity_type,
      p_ip_address,
      p_user_agent,
      jsonb_build_object(
        'description', COALESCE(p_description, p_activity_type)
      ) || COALESCE(p_metadata, '{}'::jsonb)
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.should_log_activity IS 'Checks if an activity should be logged based on recent duplicates';
COMMENT ON FUNCTION public.log_user_activity IS 'Logs user activity with duplicate prevention (60 second threshold)';
