-- ============================================================================
-- FIX ANALYTICS REPORTS RLS POLICIES
-- ============================================================================
-- This file fixes the RLS policies for analytics_reports table to properly allow admin inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all reports" ON public.analytics_reports;
DROP POLICY IF EXISTS "Admins can insert reports" ON public.analytics_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.analytics_reports;
DROP POLICY IF EXISTS "Admins can delete reports" ON public.analytics_reports;

-- Create a helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (raw_user_meta_data ->> 'role') = 'admin'
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- Create new RLS policies using the helper function
CREATE POLICY "Admin users can view all reports"
ON public.analytics_reports
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin users can insert reports"
ON public.analytics_reports
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin users can update reports"
ON public.analytics_reports
FOR UPDATE
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin users can delete reports"
ON public.analytics_reports
FOR DELETE
TO authenticated
USING (public.is_admin_user());

-- Test the helper function
SELECT 'Testing is_admin_user function:' AS test;
SELECT public.is_admin_user() AS result;

-- Verify policies are created
SELECT 
    policyname,
    cmd,
    qual IS NOT NULL as has_using,
    with_check IS NOT NULL as has_with_check
FROM pg_policies 
WHERE tablename = 'analytics_reports'
ORDER BY policyname;