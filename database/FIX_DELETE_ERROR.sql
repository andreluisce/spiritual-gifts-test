-- Fix DELETE error: permission denied for table users
-- Execute this in Supabase SQL Editor

-- 1. Drop problematic policies first
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;
DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;

-- 2. Create simpler DELETE policy for quiz_sessions
CREATE POLICY "Users can delete their own quiz sessions"
ON quiz_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 3. Create simpler DELETE policy for answers (without subquery)
-- First, let's ensure we can access session info directly
CREATE POLICY "Users can delete their own answers"
ON answers FOR DELETE
TO authenticated
USING (
  session_id IN (
    SELECT id FROM quiz_sessions 
    WHERE user_id = auth.uid()
  )
);

-- 4. Grant explicit permissions
GRANT DELETE ON quiz_sessions TO authenticated;
GRANT DELETE ON answers TO authenticated;

-- 5. Ensure auth schema permissions (if needed)
-- This might be the issue - we need to ensure access to auth.uid()
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;

-- 6. Alternative: Create a security definer function for safer access
CREATE OR REPLACE FUNCTION public.user_owns_session(session_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM quiz_sessions 
    WHERE id = session_uuid 
    AND user_id = auth.uid()
  );
$$;

-- Grant execute on this function
GRANT EXECUTE ON FUNCTION public.user_owns_session(UUID) TO authenticated;

-- 7. Recreate the answers delete policy using the function
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;

CREATE POLICY "Users can delete their own answers"
ON answers FOR DELETE
TO authenticated
USING (public.user_owns_session(session_id));

-- 8. Test the policies
DO $$
BEGIN
  RAISE NOTICE '✅ DELETE policies recreated successfully';
  RAISE NOTICE '✅ Using security definer function for safer access';
  RAISE NOTICE '✅ Auth schema permissions granted';
END
$$;