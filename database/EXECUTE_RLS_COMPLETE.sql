-- =========================================================
-- EXECUTE RLS COMPLETE - Aplicar todas as políticas RLS
-- Execute este script no Supabase SQL Editor
-- =========================================================

-- 1. ENABLE RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dangers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misunderstandings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- 2. DROP todas as políticas existentes
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
DROP POLICY IF EXISTS "Allow authenticated read on migration_log" ON migration_log;

-- Quiz Sessions policies
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;

-- Answers policies  
DROP POLICY IF EXISTS "Users can view their own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON answers;
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;

-- Admin policies
DROP POLICY IF EXISTS "Admins can access all quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Admins can access all answers" ON answers;

-- 3. CREATE políticas de leitura pública para dados estáticos
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
CREATE POLICY "Allow authenticated read on migration_log" ON migration_log FOR SELECT TO authenticated USING (true);

-- 4. CREATE políticas para quiz_sessions (CRUD completo)
CREATE POLICY "Users can view their own quiz sessions"
ON quiz_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions"
ON quiz_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions"
ON quiz_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions"
ON quiz_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. CREATE políticas para answers (CRUD via session ownership)
CREATE POLICY "Users can view their own answers"
ON answers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own answers"
ON answers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    WHERE quiz_sessions.id = answers.session_id
    AND quiz_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own answers"
ON answers FOR UPDATE
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

-- 6. CREATE políticas de admin (acesso total)
CREATE POLICY "Admins can access all quiz sessions"
ON quiz_sessions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role' = 'admin'
         OR auth.users.email = 'admin@example.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role' = 'admin'
         OR auth.users.email = 'admin@example.com')
  )
);

CREATE POLICY "Admins can access all answers"
ON answers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role' = 'admin'
         OR auth.users.email = 'admin@example.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_app_meta_data->>'role' = 'admin'
         OR auth.users.email = 'admin@example.com')
  )
);

-- 7. GRANT permissões adequadas
-- Dados estáticos - leitura pública
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
GRANT SELECT ON migration_log TO authenticated;

-- Dados de quiz - CRUD para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON answers TO authenticated;

-- 8. VERIFY que as policies foram criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename IN ('quiz_sessions', 'answers');
  RAISE NOTICE 'Total RLS policies created: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'quiz_sessions' AND cmd = 'DELETE';
  RAISE NOTICE 'DELETE policies for quiz_sessions: %', policy_count;
  
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'answers' AND cmd = 'DELETE';
  RAISE NOTICE 'DELETE policies for answers: %', policy_count;
END
$$;

-- 9. FIX answers table se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'answers'
  ) THEN
    CREATE TABLE public.answers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
      question_id INTEGER NOT NULL,
      answer_value INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS on new table
    ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Created answers table with RLS enabled';
  ELSE
    RAISE NOTICE 'Answers table already exists';
  END IF;
END
$$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies applied successfully!';
  RAISE NOTICE '✅ All tables have proper permissions for quiz operations';
  RAISE NOTICE '✅ DELETE operations should now work correctly';
END
$$;