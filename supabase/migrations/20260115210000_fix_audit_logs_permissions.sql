-- Fix permissions and logic for audit log functions
-- This migration updates audit functions to use the more robust is_user_manager() check
-- and correctly grants execute permissions.

-- 1. Update get_audit_logs
CREATE OR REPLACE FUNCTION public.get_audit_logs(
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0,
    action_filter TEXT DEFAULT NULL,
    status_filter TEXT DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_email TEXT,
    action TEXT,
    resource TEXT,
    details JSONB,
    status TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user is admin or manager using robust function
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied: Manager or Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
        al.id,
        al.user_id,
        al.user_email,
        al.action,
        al.resource,
        al.details,
        al.status,
        al.ip_address,
        al.user_agent,
        al.created_at
    FROM public.audit_logs al
    WHERE
        (action_filter IS NULL OR al.action = action_filter)
        AND (status_filter IS NULL OR al.status = status_filter)
        AND (
            search_term IS NULL
            OR al.user_email ILIKE '%' || search_term || '%'
            OR al.action ILIKE '%' || search_term || '%'
            OR al.resource ILIKE '%' || search_term || '%'
        )
    ORDER BY al.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 2. Update get_audit_stats
CREATE OR REPLACE FUNCTION public.get_audit_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_events BIGINT;
    events_today BIGINT;
    failed_events BIGINT;
    unique_users BIGINT;
BEGIN
    -- Check permissions using robust function
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT COUNT(*) INTO total_events FROM public.audit_logs;

    SELECT COUNT(*) INTO events_today
    FROM public.audit_logs
    WHERE created_at >= CURRENT_DATE;

    SELECT COUNT(*) INTO failed_events
    FROM public.audit_logs
    WHERE status = 'failed';

    SELECT COUNT(DISTINCT user_id) INTO unique_users
    FROM public.audit_logs
    WHERE user_id IS NOT NULL;

    RETURN jsonb_build_object(
        'totalEvents', total_events,
        'eventsToday', events_today,
        'failedEvents', failed_events,
        'uniqueUsers', unique_users
    );
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_audit_logs(INT, INT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;

-- Ensure RLS is active and allows admins to see everything
-- Re-applying the policy just in case
DROP POLICY IF EXISTS "Allow admins to view all logs" ON public.audit_logs;
CREATE POLICY "Allow admins to view all logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
    public.is_user_manager()
    OR user_id = auth.uid()
);
