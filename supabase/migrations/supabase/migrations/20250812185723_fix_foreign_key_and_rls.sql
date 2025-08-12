-- Fix foreign key constraint and apply RLS policies

-- 1. FIX FOREIGN KEY CONSTRAINT
-- First, remove foreign key constraint that references non-existent profiles table
ALTER TABLE IF EXISTS quiz_sessions DROP CONSTRAINT IF EXISTS quiz_sessions_user_id_fkey;

-- Clean up invalid data first
DO $$
BEGIN
  -- Remove quiz sessions with invalid user_id (not in auth.users)
  DELETE FROM quiz_sessions 
  WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM auth.users);
  
  -- Remove quiz sessions with NULL user_id 
  DELETE FROM quiz_sessions WHERE user_id IS NULL;
  
  RAISE NOTICE 'Cleaned up invalid quiz sessions';
END
$$;

-- Now add the correct foreign key constraint
DO $$
BEGIN
  -- Add new constraint to auth.users
  ALTER TABLE quiz_sessions ADD CONSTRAINT quiz_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  
  RAISE NOTICE 'Foreign key constraint updated successfully';
END
$$;

-- 2. APPLY RLS POLICIES

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all read on categories" ON categories;
DROP POLICY IF EXISTS "Allow all read on spiritual_gifts" ON spiritual_gifts;
DROP POLICY IF EXISTS "Allow all read on qualities" ON qualities;
DROP POLICY IF EXISTS "Allow all read on characteristics" ON characteristics;
DROP POLICY IF EXISTS "Allow all read on dangers" ON dangers;
DROP POLICY IF EXISTS "Allow all read on misunderstandings" ON misunderstandings;
DROP POLICY IF EXISTS "Allow all read on ministries" ON ministries;
DROP POLICY IF EXISTS "Allow all read on manifestations" ON manifestations;
DROP POLICY IF EXISTS "Allow all read on question_pool" ON question_pool;
DROP POLICY IF EXISTS "Allow all read on question_translations" ON question_translations;
DROP POLICY IF EXISTS "Allow all read on decision_weights" ON decision_weights;
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can view their own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON answers;
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualities ENABLE ROW LEVEL SECURITY;
ALTER TABLE characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dangers ENABLE ROW LEVEL SECURITY;
ALTER TABLE misunderstandings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies for reference data (public read)
CREATE POLICY "Allow all read on categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on spiritual_gifts" ON spiritual_gifts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on qualities" ON qualities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on characteristics" ON characteristics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on dangers" ON dangers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on misunderstandings" ON misunderstandings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on ministries" ON ministries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on manifestations" ON manifestations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on question_pool" ON question_pool FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on question_translations" ON question_translations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all read on decision_weights" ON decision_weights FOR SELECT TO anon, authenticated USING (true);

-- Create policies for user data
CREATE POLICY "Users can view their own quiz sessions" ON quiz_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz sessions" ON quiz_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz sessions" ON quiz_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quiz sessions" ON quiz_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own answers" ON answers FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own answers" ON answers FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own answers" ON answers FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own answers" ON answers FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

-- Grant permissions
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON spiritual_gifts TO anon, authenticated;
GRANT SELECT ON qualities TO anon, authenticated;
GRANT SELECT ON characteristics TO anon, authenticated;
GRANT SELECT ON dangers TO anon, authenticated;
GRANT SELECT ON misunderstandings TO anon, authenticated;
GRANT SELECT ON ministries TO anon, authenticated;
GRANT SELECT ON manifestations TO anon, authenticated;
GRANT SELECT ON question_pool TO anon, authenticated;
GRANT SELECT ON question_translations TO anon, authenticated;
GRANT SELECT ON decision_weights TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON answers TO authenticated;