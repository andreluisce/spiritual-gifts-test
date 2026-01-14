-- Fix audit_logs table structure and function return type
-- The issue is that the id column might be BIGSERIAL instead of UUID

-- First, check if the table exists and what type id is
DO $$
DECLARE
    v_id_type text;
BEGIN
    SELECT data_type INTO v_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_logs'
      AND column_name = 'id';

    RAISE NOTICE 'Current audit_logs.id type: %', COALESCE(v_id_type, 'column not found');
END $$;

-- Drop and recreate the table with correct UUID type
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
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

-- Create policies
CREATE POLICY "Allow insert for authenticated users"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow admins to view all logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
    public.is_user_manager()
    OR user_id = auth.uid()
);

-- Recreate get_audit_logs function
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
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied: Manager privileges required';
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

GRANT EXECUTE ON FUNCTION public.get_audit_logs(INT, INT, TEXT, TEXT, TEXT) TO authenticated;

-- Verify the fix
DO $$
DECLARE
    v_id_type text;
BEGIN
    SELECT data_type INTO v_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'audit_logs'
      AND column_name = 'id';

    IF v_id_type = 'uuid' THEN
        RAISE NOTICE '✓ audit_logs.id is now UUID type';
    ELSE
        RAISE WARNING '✗ audit_logs.id type is: %', v_id_type;
    END IF;
END $$;
