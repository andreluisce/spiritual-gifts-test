-- Create function to safely delete a quiz session and its answers
-- This bypasses RLS issues by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.delete_quiz_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_requesting_user_id UUID;
BEGIN
  -- Get the requesting user
  v_requesting_user_id := auth.uid();

  IF v_requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get the session's user_id
  SELECT user_id INTO v_user_id
  FROM quiz_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Check permission: user can only delete their own sessions
  IF v_user_id != v_requesting_user_id THEN
    RAISE EXCEPTION 'Permission denied: You can only delete your own quiz sessions';
  END IF;

  -- Delete answers first (CASCADE should handle this, but being explicit)
  DELETE FROM answers
  WHERE session_id = p_session_id;

  -- Delete the session
  DELETE FROM quiz_sessions
  WHERE id = p_session_id
    AND user_id = v_requesting_user_id; -- Extra safety

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.delete_quiz_session IS 'Safely delete a quiz session and all its answers (user can only delete their own sessions)';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_quiz_session(UUID) TO authenticated;
