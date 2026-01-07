-- Migration: Create Manager-Safe RPC Functions
-- Description: Create versions of admin functions that are safe for managers (with masked sensitive data)
-- Author: System
-- Date: 2026-01-07

-- ============================================
-- Manager-safe version of get_users_with_stats
-- Masks sensitive data like full email addresses
-- ============================================
CREATE OR REPLACE FUNCTION public.manager_get_users_with_stats()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email_masked TEXT,
  created_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  quiz_count BIGINT,
  role user_role_type,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is at least manager
  IF NOT is_user_manager() THEN
    RAISE EXCEPTION 'Manager or Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    COALESCE(p.display_name, 'Unknown User') as display_name,
    -- Mask email: show first 3 chars + @domain
    CASE
      WHEN u.email IS NOT NULL THEN
        substring(u.email from 1 for 3) || '***@' || split_part(u.email, '@', 2)
      ELSE 'hidden@email.com'
    END as email_masked,
    p.created_at,
    p.last_login,
    COUNT(DISTINCT qs.id) as quiz_count,
    p.role,
    COALESCE(p.is_active, true) as is_active
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN quiz_sessions qs ON qs.user_id = p.user_id AND qs.is_completed = true
  GROUP BY p.user_id, p.display_name, u.email, p.created_at, p.last_login, p.role, p.is_active
  ORDER BY p.created_at DESC;
END;
$$;

-- ============================================
-- Update existing admin functions to check for admin role
-- ============================================

-- Admin delete user - Only admins can delete
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check if caller is admin (not just manager)
  IF NOT is_user_admin_safe() THEN
    RAISE EXCEPTION 'Admin access required to delete users';
  END IF;

  -- Prevent self-deletion
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Delete user profile
  DELETE FROM profiles WHERE user_id = p_user_id;

  -- Delete auth user (cascade will handle related data)
  DELETE FROM auth.users WHERE id = p_user_id;

  v_result := jsonb_build_object(
    'success', true,
    'message', 'User deleted successfully',
    'user_id', p_user_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Admin update user - Only admins can change roles
CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_user_id UUID,
  p_display_name TEXT DEFAULT NULL,
  p_role user_role_type DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_old_role user_role_type;
BEGIN
  -- Check if caller is admin
  IF NOT is_user_admin_safe() THEN
    RAISE EXCEPTION 'Admin access required to update users';
  END IF;

  -- Get current role
  SELECT role INTO v_old_role FROM profiles WHERE user_id = p_user_id;

  -- Update profile
  UPDATE profiles
  SET
    display_name = COALESCE(p_display_name, display_name),
    role = COALESCE(p_role, role),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If role changed, update permissions
  IF p_role IS NOT NULL AND p_role != v_old_role THEN
    UPDATE profiles
    SET permissions = CASE p_role
      WHEN 'admin' THEN '["analytics", "users_read", "users_write", "system_admin"]'::jsonb
      WHEN 'manager' THEN '["analytics", "users_read"]'::jsonb
      ELSE '[]'::jsonb
    END
    WHERE user_id = p_user_id;
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'message', 'User updated successfully',
    'user_id', p_user_id,
    'role_changed', p_role IS NOT NULL AND p_role != v_old_role
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION public.manager_get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, user_role_type, BOOLEAN) TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.manager_get_users_with_stats() IS 'Returns user stats with masked emails for managers';
COMMENT ON FUNCTION public.admin_delete_user(UUID) IS 'Delete user (admin only)';
COMMENT ON FUNCTION public.admin_update_user(UUID, TEXT, user_role_type, BOOLEAN) IS 'Update user profile and role (admin only)';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Manager-safe RPC functions created';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '  - manager_get_users_with_stats() - View users with masked emails';
  RAISE NOTICE '  - admin_delete_user() - Admin only';
  RAISE NOTICE '  - admin_update_user() - Admin only';
END $$;
