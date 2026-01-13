-- Safely recreate functions by dropping ALL overloaded versions dynamically
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all versions of log_audit_event
    FOR r IN SELECT oid::regprocedure AS func_signature
             FROM pg_proc
             WHERE proname = 'log_audit_event'
             AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;

    -- Drop all versions of get_audit_logs
    FOR r IN SELECT oid::regprocedure AS func_signature
             FROM pg_proc
             WHERE proname = 'get_audit_logs'
             AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_signature || ' CASCADE';
    END LOOP;

    -- Drop get_audit_stats just in case
    DROP FUNCTION IF EXISTS public.get_audit_stats();
END $$;

-- Create a simple audit logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'success',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert by anyone (authenticated or not for system logs, but here we restrict to authenticated for user actions)
-- For simplicity, we allow authenticated users to insert their own logs
-- Drop policy if exists to avoid error
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.audit_logs;
CREATE POLICY "Allow insert for authenticated users"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins to view all logs
DROP POLICY IF EXISTS "Allow admins to view all logs" ON public.audit_logs;
CREATE POLICY "Allow admins to view all logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'manager')
    )
    OR user_id = auth.uid()
);

-- Create the log_audit_event function that matches usage in useAuditData.ts
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
        ip_addr,
        user_agent_string
    )
    RETURNING id INTO new_log_id;

    RETURN new_log_id;
END;
$$;

-- Create get_audit_logs function matching the hook
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
    -- Check if user is admin or manager
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'manager')
    ) THEN
        RAISE EXCEPTION 'Access denied';
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

-- Create get_audit_stats function
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
    -- Check permissions
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.role = 'manager')
    ) THEN
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

-- Add comment
COMMENT ON FUNCTION log_audit_event(text, text, jsonb, text, text, text) IS 'Logs an audit event for system security and tracking';
