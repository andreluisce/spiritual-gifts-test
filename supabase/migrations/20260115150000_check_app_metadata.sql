-- Improve get_user_role to check app_metadata as well
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_role user_role_type;
  v_meta_role text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN 'user'::user_role_type;
  END IF;

  -- 1. Try profiles
  SELECT role INTO v_role
  FROM profiles
  WHERE id = v_user_id;

  -- 2. If not found or user, check auth.users metadata for upgrade
  IF v_role IS NULL OR v_role = 'user' THEN
      -- Check user_metadata
      SELECT raw_user_meta_data->>'role' INTO v_meta_role
      FROM auth.users
      WHERE id = v_user_id;

      -- If not found, check app_metadata
      IF v_meta_role IS NULL THEN
          SELECT raw_app_meta_data->>'role' INTO v_meta_role
          FROM auth.users
          WHERE id = v_user_id;
      END IF;

      IF v_meta_role = 'manager' THEN
          v_role := 'manager'::user_role_type;
      ELSIF v_meta_role = 'admin' THEN
          v_role := 'admin'::user_role_type;
      END IF;
  END IF;

  RETURN COALESCE(v_role, 'user'::user_role_type);
END;
$$;
