-- ============================================================================
-- FIX AUDIT LOGS FUNCTION
-- ============================================================================
-- This file fixes the get_audit_logs function to work with the current table structure

-- Drop the existing function and recreate with correct types
DROP FUNCTION IF EXISTS public.get_audit_logs(INTEGER, INTEGER, TEXT, TEXT, TEXT);

-- Create the corrected function
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

    -- Build the result with proper error handling
    SELECT COALESCE(
        json_agg(
            json_build_object(
                'id', al.id::TEXT,  -- Convert BIGINT to TEXT to avoid issues
                'user_id', al.user_id,
                'user_email', COALESCE(al.user_email, 'System'),
                'action', al.action,
                'resource', COALESCE(al.resource, ''),
                'details', COALESCE(al.details, '{}'::jsonb),
                'status', al.status,
                'ip_address', COALESCE(al.ip_address::TEXT, ''),
                'user_agent', COALESCE(al.user_agent, ''),
                'created_at', al.created_at
            ) ORDER BY al.created_at DESC  -- Move ORDER BY inside the aggregate
        ),
        '[]'::JSON
    ) INTO logs_data
    FROM (
        SELECT 
            al.id,
            al.user_id,
            al.user_email,
            al.action,
            al.resource,
            al.details,
            al.ip_address,
            al.user_agent,
            al.status,
            al.created_at
        FROM public.audit_logs al
        WHERE 
            (action_filter IS NULL OR al.action ILIKE '%' || action_filter || '%') AND
            (status_filter IS NULL OR al.status = status_filter) AND
            (search_term IS NULL OR 
             al.user_email ILIKE '%' || search_term || '%' OR
             al.action ILIKE '%' || search_term || '%' OR
             al.resource ILIKE '%' || search_term || '%')
        ORDER BY al.created_at DESC
        LIMIT limit_count
        OFFSET offset_count
    ) al;
    
    RETURN logs_data;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_audit_logs(INTEGER, INTEGER, TEXT, TEXT, TEXT) TO authenticated;

-- Test the function
SELECT 'Fixed audit logs function - testing...' AS status;
SELECT public.get_audit_logs(5);