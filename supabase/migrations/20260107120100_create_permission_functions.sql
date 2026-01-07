-- Migration: Create Permission Check Functions
-- Description: RPC functions to check user roles and permissions
-- Author: System
-- Date: 2026-01-07

-- Function: Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_role user_role_type;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN 'user'::user_role_type;
  END IF;

  -- Get role from profiles (using 'id' column)
  SELECT role INTO v_role
  FROM profiles
  WHERE id = v_user_id;

  RETURN COALESCE(v_role, 'user'::user_role_type);
END;
$$;

-- Function: Check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_permissions JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get user permissions (using 'id' column)
  SELECT permissions INTO v_permissions
  FROM profiles
  WHERE id = v_user_id;

  -- Check if permission exists in array
  RETURN COALESCE(v_permissions ? p_permission, FALSE);
END;
$$;

-- Function: Check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_user_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_role user_role_type;
BEGIN
  v_role := get_user_role();
  RETURN v_role IN ('manager', 'admin');
END;
$$;

-- Function: Update is_user_admin_safe to use new role system
-- Maintains backward compatibility
CREATE OR REPLACE FUNCTION public.is_user_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_role user_role_type;
BEGIN
  v_role := get_user_role();
  RETURN v_role = 'admin';
END;
$$;

-- Function: Get user permissions (for frontend)
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_permissions JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Get user permissions (using 'id' column)
  SELECT permissions INTO v_permissions
  FROM profiles
  WHERE id = v_user_id;

  RETURN COALESCE(v_permissions, '[]'::jsonb);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the current user role (user, manager, or admin)';
COMMENT ON FUNCTION public.has_permission(TEXT) IS 'Checks if current user has a specific permission';
COMMENT ON FUNCTION public.is_user_manager() IS 'Returns true if user is manager or admin';
COMMENT ON FUNCTION public.is_user_admin_safe() IS 'Returns true if user is admin (backward compatible)';
COMMENT ON FUNCTION public.get_user_permissions() IS 'Returns array of user permissions';
