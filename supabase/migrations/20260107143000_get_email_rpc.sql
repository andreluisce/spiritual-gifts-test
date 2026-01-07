-- Migration: Create helper to get user email for managers
-- This allows Server Actions to fetch email securely for notifications

CREATE OR REPLACE FUNCTION public.manager_get_user_email(target_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- Check permissions
  IF NOT is_user_manager() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT email INTO v_email
  FROM auth.users
  WHERE id = target_user_id;

  RETURN v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.manager_get_user_email(UUID) TO authenticated;
