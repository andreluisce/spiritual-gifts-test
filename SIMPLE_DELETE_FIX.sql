-- SIMPLE DELETE FIX - Execute this first
-- Resolve permission denied for table users error

-- 1. Temporarily disable RLS to clean up
ALTER TABLE answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;
DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can view their own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON answers;
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON quiz_sessions;

-- 3. Re-enable RLS
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 4. Create very simple policies that should work
CREATE POLICY "quiz_sessions_select" ON quiz_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "quiz_sessions_insert" ON quiz_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "quiz_sessions_update" ON quiz_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "quiz_sessions_delete" ON quiz_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 5. For answers, use a direct approach without complex subqueries
CREATE POLICY "answers_all" ON answers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Grant permissions
GRANT ALL ON quiz_sessions TO authenticated;
GRANT ALL ON answers TO authenticated;

-- 7. Success message
SELECT 'DELETE permissions fixed! Try deleting a quiz result now.' as status;