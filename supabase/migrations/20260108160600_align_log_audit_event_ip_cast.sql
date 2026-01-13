-- Align log_audit_event functions with the current audit_logs.ip_address inet column
-- Cast text IP inputs to inet and tolerate null/empty strings.

CREATE OR REPLACE FUNCTION public.log_audit_event(
    action_name TEXT,
    resource_name TEXT,
    details_json JSONB DEFAULT NULL,
    status_value TEXT DEFAULT 'success',
    ip_addr TEXT DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
    new_log_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();

    -- Get user email if authenticated
    IF current_user_id IS NOT NULL THEN
        SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
    END IF;

    -- Insert log
    INSERT INTO public.audit_logs (
        user_id,
        user_email,
        action,
        resource,
        details,
        status,
        ip_address,
        user_agent
    ) VALUES (
        current_user_id,
        current_user_email,
        action_name,
        resource_name,
        COALESCE(details_json, '{}'::jsonb),
        status_value,
        CASE WHEN ip_addr IS NULL OR ip_addr = '' THEN NULL ELSE ip_addr::inet END,
        user_agent_string
    )
    RETURNING id INTO new_log_id;

    RETURN new_log_id;
END;
$$;

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
    CASE WHEN p_ip_address IS NULL OR p_ip_address = '' THEN NULL ELSE p_ip_address::inet END,
    p_user_agent,
    p_status
  );
END;
$$;

-- Keep permissions intact
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO service_role;
