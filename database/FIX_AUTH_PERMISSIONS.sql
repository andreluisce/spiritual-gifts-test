-- FIX AUTH PERMISSIONS - Execute this to fix the root cause
-- This addresses the "permission denied for table users" error

-- 1. Check current auth schema permissions
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'auth';

-- 2. Grant necessary permissions on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated, anon;

-- 3. Grant access to auth.users table for RLS policies
GRANT SELECT ON auth.users TO authenticated, anon;

-- 4. Specifically grant execute on auth functions
GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auth.role() TO authenticated, anon;

-- 5. Try to grant access to auth.jwt() if it exists
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION auth.jwt() TO authenticated, anon;
EXCEPTION 
  WHEN undefined_function THEN
    RAISE NOTICE 'auth.jwt() function not found, skipping';
END
$$;

-- 6. Now re-enable RLS and create working policies
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 7. Create policies that should now work with auth access
CREATE POLICY "Users can manage their quiz sessions"
ON quiz_sessions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 8. For answers, create a policy that checks session ownership
CREATE POLICY "Users can manage their answers"
ON answers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions 
    WHERE quiz_sessions.id = answers.session_id 
    AND quiz_sessions.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_sessions 
    WHERE quiz_sessions.id = answers.session_id 
    AND quiz_sessions.user_id = auth.uid()
  )
);

-- 9. Success message
SELECT 'Auth permissions fixed! RLS policies should work now.' as status;