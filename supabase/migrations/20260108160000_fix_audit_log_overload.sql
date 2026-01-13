-- Fix for missing log_audit_event overload with 8 arguments
-- This is required because some triggers or legacy code might still be calling the explicit version

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_user_email TEXT,
  p_action TEXT,
  p_resource TEXT,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'success'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    user_email,
    action,
    resource,
    details,
    ip_address,
    user_agent,
    status
  ) VALUES (
    p_user_id,
    p_user_email,
    p_action,
    p_resource,
    COALESCE(p_details, '{}'::jsonb),
    p_ip_address,
    p_user_agent,
    p_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO service_role;
