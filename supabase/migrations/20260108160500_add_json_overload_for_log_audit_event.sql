-- Add compatibility overload for log_audit_event that accepts JSON payloads
-- Some callers send json (not jsonb), which currently fails to resolve the
-- existing UUID/Text/Text/Text/JSONB/Text/Text/Text signature.

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_user_email TEXT,
  p_action TEXT,
  p_resource TEXT,
  p_details JSON DEFAULT NULL,
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
  -- Delegate to the jsonb overload to keep logic in one place
  PERFORM public.log_audit_event(
    p_user_id,
    p_user_email,
    p_action,
    p_resource,
    CASE WHEN p_details IS NULL THEN NULL ELSE p_details::jsonb END,
    p_ip_address,
    p_user_agent,
    p_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, TEXT, JSON, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, TEXT, JSON, TEXT, TEXT, TEXT) TO service_role;
