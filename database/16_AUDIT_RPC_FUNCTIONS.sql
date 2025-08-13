-- ============================================================================
-- AUDIT SYSTEM RPC FUNCTIONS
-- Functions for audit logging and activity tracking
-- ============================================================================

-- First, create the audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    details JSONB,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can read audit logs
CREATE POLICY "Admin can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policy: System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Create user_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    user_name TEXT,
    activity_type TEXT NOT NULL,
    activity_description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own activities, admins can view all
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policy: System can insert activities
CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (true);

-- Function to get audit logs with filtering
CREATE OR REPLACE FUNCTION public.get_audit_logs(
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    action_filter TEXT DEFAULT NULL,
    status_filter TEXT DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    logs_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', al.id,
            'user_id', al.user_id,
            'user_email', COALESCE(al.user_email, 'System'),
            'action', al.action,
            'resource', COALESCE(al.resource, ''),
            'details', COALESCE(al.details, '{}'::jsonb),
            'status', al.status,
            'ip_address', al.ip_address,
            'user_agent', al.user_agent,
            'created_at', al.created_at
        )
    ) INTO logs_data
    FROM public.audit_logs al
    WHERE 
        (action_filter IS NULL OR al.action = action_filter) AND
        (status_filter IS NULL OR al.status = status_filter) AND
        (search_term IS NULL OR 
         al.user_email ILIKE '%' || search_term || '%' OR
         al.action ILIKE '%' || search_term || '%' OR
         al.resource ILIKE '%' || search_term || '%')
    ORDER BY al.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
    
    RETURN COALESCE(logs_data, '[]'::JSON);
END;
$$;

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION public.get_audit_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    WITH audit_stats AS (
        SELECT 
            COUNT(*) as total_events,
            COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as events_today,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_events,
            COUNT(DISTINCT user_id) as unique_users
        FROM public.audit_logs
    )
    SELECT json_build_object(
        'totalEvents', as_stats.total_events,
        'eventsToday', as_stats.events_today,
        'failedEvents', as_stats.failed_events,
        'uniqueUsers', COALESCE(as_stats.unique_users, 0)
    ) INTO stats_data
    FROM audit_stats as_stats;
    
    RETURN COALESCE(stats_data, json_build_object(
        'totalEvents', 0,
        'eventsToday', 0,
        'failedEvents', 0,
        'uniqueUsers', 0
    ));
END;
$$;

-- Function to get user activities
CREATE OR REPLACE FUNCTION public.get_user_activities(limit_count INTEGER DEFAULT 100)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activities_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', ua.id,
            'user_id', ua.user_id,
            'user_email', COALESCE(ua.user_email, 'Unknown'),
            'user_name', COALESCE(ua.user_name, split_part(ua.user_email, '@', 1)),
            'activity_type', ua.activity_type,
            'activity_description', ua.activity_description,
            'ip_address', ua.ip_address,
            'user_agent', ua.user_agent,
            'metadata', COALESCE(ua.metadata, '{}'::jsonb),
            'created_at', ua.created_at
        )
    ) INTO activities_data
    FROM public.user_activities ua
    ORDER BY ua.created_at DESC
    LIMIT limit_count;
    
    RETURN COALESCE(activities_data, '[]'::JSON);
END;
$$;

-- Function to get activity statistics
CREATE OR REPLACE FUNCTION public.get_activity_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    WITH activity_stats AS (
        SELECT 
            COUNT(*) as total_activities,
            COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_activities,
            COUNT(DISTINCT user_id) as active_users
        FROM public.user_activities
    ),
    top_activities AS (
        SELECT 
            activity_type as type,
            COUNT(*) as count
        FROM public.user_activities
        GROUP BY activity_type
        ORDER BY count DESC
        LIMIT 5
    )
    SELECT json_build_object(
        'totalActivities', as_stats.total_activities,
        'todayActivities', as_stats.today_activities,
        'activeUsers', as_stats.active_users,
        'topActivities', COALESCE(
            (SELECT json_agg(json_build_object('type', type, 'count', count)) FROM top_activities),
            '[]'::json
        )
    ) INTO stats_data
    FROM activity_stats as_stats;
    
    RETURN COALESCE(stats_data, json_build_object(
        'totalActivities', 0,
        'todayActivities', 0,
        'activeUsers', 0,
        'topActivities', '[]'::json
    ));
END;
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    action_name TEXT,
    resource_name TEXT DEFAULT NULL,
    details_json JSONB DEFAULT NULL,
    status_value TEXT DEFAULT 'success',
    ip_addr TEXT DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_id UUID;
    current_user_email TEXT;
BEGIN
    -- Get current user email if available
    SELECT email INTO current_user_email 
    FROM auth.users 
    WHERE id = auth.uid();

    -- Insert audit log
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
        auth.uid(),
        current_user_email,
        action_name,
        resource_name,
        details_json,
        status_value,
        ip_addr,
        user_agent_string
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    activity_type_name TEXT,
    activity_desc TEXT,
    metadata_json JSONB DEFAULT NULL,
    ip_addr TEXT DEFAULT NULL,
    user_agent_string TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
    current_user_email TEXT;
    current_user_name TEXT;
BEGIN
    -- Get current user info if available
    SELECT 
        email,
        COALESCE(
            raw_user_meta_data->>'name',
            raw_user_meta_data->>'full_name',
            split_part(email, '@', 1)
        )
    INTO current_user_email, current_user_name
    FROM auth.users 
    WHERE id = auth.uid();

    -- Insert user activity
    INSERT INTO public.user_activities (
        user_id,
        user_email,
        user_name,
        activity_type,
        activity_description,
        ip_address,
        user_agent,
        metadata
    ) VALUES (
        auth.uid(),
        current_user_email,
        current_user_name,
        activity_type_name,
        activity_desc,
        ip_addr,
        user_agent_string,
        metadata_json
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_audit_logs(INTEGER, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activities(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity(TEXT, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON public.audit_logs(status);

CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);