-- Fix DELETE permissions for quiz sessions and answers

-- 1. Check if answers table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'answers'
  ) THEN
    -- Create answers table if it doesn't exist
    CREATE TABLE public.answers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL,
      answer_value INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created answers table';
  END IF;
END
$$;

-- 2. Ensure RLS is enabled on both tables
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- 3. Drop and recreate DELETE policies to ensure they work
DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;

-- 4. Create DELETE policies with proper conditions
CREATE POLICY "Users can delete their own quiz sessions"
ON quiz_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers"
ON answers FOR DELETE  
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

-- 5. Grant DELETE permissions to authenticated users
GRANT DELETE ON quiz_sessions TO authenticated;
GRANT DELETE ON answers TO authenticated;

-- 6. Verify the policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename IN ('quiz_sessions', 'answers') 
  AND cmd = 'DELETE';
  
  RAISE NOTICE 'Found % DELETE policies', policy_count;
END
$$;