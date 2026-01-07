-- Migration: User Approval System
-- Description: Adds approval workflow for new users
-- Date: 2026-01-07

-- 1. Add approval columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON profiles(approved);

-- Update existing users to be approved (so we don't lock them out)
UPDATE profiles
SET approved = TRUE, approved_at = NOW()
WHERE approved IS FALSE;

-- 2. Create approvals history table
CREATE TABLE IF NOT EXISTS user_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'reset')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for user_approvals

-- Only admins and managers can view history
CREATE POLICY "Admins and Managers can view approval history"
  ON user_approvals FOR SELECT
  USING (is_user_manager());

-- Only admins and managers can insert (via RPC mostly, but good to have)
CREATE POLICY "Admins and Managers can insert approval history"
  ON user_approvals FOR INSERT
  WITH CHECK (is_user_manager());

-- 4. RPC Functions

-- Function: Check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_approved BOOLEAN;
BEGIN
  SELECT approved INTO v_approved
  FROM profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_approved, FALSE);
END;
$$;

-- Function: Approve User
CREATE OR REPLACE FUNCTION public.approve_user(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_details JSONB;
BEGIN
  -- Check permissions
  IF NOT is_user_manager() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Update profile
  UPDATE profiles
  SET
    approved = TRUE,
    approved_by = auth.uid(),
    approved_at = NOW(),
    rejection_reason = NULL
  WHERE id = target_user_id;

  -- Log action
  INSERT INTO user_approvals (user_id, performed_by, action)
  VALUES (target_user_id, auth.uid(), 'approved');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Reject User
CREATE OR REPLACE FUNCTION public.reject_user(
  target_user_id UUID,
  reject_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permissions
  IF NOT is_user_manager() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Update profile (set approved to false, keep user but mark as rejected)
  UPDATE profiles
  SET
    approved = FALSE,
    approved_by = auth.uid(), -- actively rejected by
    approved_at = NOW(), -- time of rejection
    rejection_reason = reject_reason
  WHERE id = target_user_id;

  -- Log action
  INSERT INTO user_approvals (user_id, performed_by, action, reason)
  VALUES (target_user_id, auth.uid(), 'rejected', reject_reason);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Get Pending Users (for Admin Dashboard)
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  approved BOOLEAN,
  rejection_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check permissions
  IF NOT is_user_manager() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    u.email,
    p.display_name,
    p.created_at,
    p.approved,
    p.rejection_reason
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.approved = FALSE
  ORDER BY p.created_at DESC;
END;
$$;

-- 5. Update Policies for Quiz Sessions
-- Block creation of quiz sessions if not approved
DROP POLICY IF EXISTS "Users can create their own quiz sessions" ON quiz_sessions;
CREATE POLICY "Users can create their own quiz sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      is_user_approved()
      OR is_user_manager() -- Managers/Admins always approved effectively
    )
  );

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_user_approved() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_user(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_users() TO authenticated;

-- Comments
COMMENT ON COLUMN profiles.approved IS 'Whether the user is approved to take the quiz';
COMMENT ON TABLE user_approvals IS 'History of approvals and rejections';
