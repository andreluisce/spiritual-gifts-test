-- =========================================================
-- COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES
-- Created: 2025-08-12
-- Purpose: Enable RLS and create policies for ALL tables with COMPLETE access patterns
-- =========================================================

-- Log da execução
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('09_comprehensive_rls', 'Iniciando configuração completa de RLS para todas as tabelas', NOW());

-- =========================================================
-- 1. DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- =========================================================

-- Categories
DROP POLICY IF EXISTS "Allow authenticated read on categories" ON categories;
DROP POLICY IF EXISTS "Allow anon read on categories" ON categories;
DROP POLICY IF EXISTS "Allow all read on categories" ON categories;

-- Spiritual Gifts  
DROP POLICY IF EXISTS "Allow authenticated read on spiritual_gifts" ON spiritual_gifts;
DROP POLICY IF EXISTS "Allow anon read on spiritual_gifts" ON spiritual_gifts;
DROP POLICY IF EXISTS "Allow all read on spiritual_gifts" ON spiritual_gifts;

-- Qualities
DROP POLICY IF EXISTS "Allow authenticated read on qualities" ON qualities;
DROP POLICY IF EXISTS "Allow anon read on qualities" ON qualities;
DROP POLICY IF EXISTS "Allow all read on qualities" ON qualities;

-- Characteristics
DROP POLICY IF EXISTS "Allow authenticated read on characteristics" ON characteristics;
DROP POLICY IF EXISTS "Allow anon read on characteristics" ON characteristics;
DROP POLICY IF EXISTS "Allow all read on characteristics" ON characteristics;

-- Dangers
DROP POLICY IF EXISTS "Allow authenticated read on dangers" ON dangers;
DROP POLICY IF EXISTS "Allow anon read on dangers" ON dangers;
DROP POLICY IF EXISTS "Allow all read on dangers" ON dangers;

-- Misunderstandings
DROP POLICY IF EXISTS "Allow authenticated read on misunderstandings" ON misunderstandings;
DROP POLICY IF EXISTS "Allow anon read on misunderstandings" ON misunderstandings;
DROP POLICY IF EXISTS "Allow all read on misunderstandings" ON misunderstandings;

-- Ministries
DROP POLICY IF EXISTS "Allow authenticated read on ministries" ON ministries;
DROP POLICY IF EXISTS "Allow anon read on ministries" ON ministries;
DROP POLICY IF EXISTS "Allow all read on ministries" ON ministries;

-- Manifestations
DROP POLICY IF EXISTS "Allow authenticated read on manifestations" ON manifestations;
DROP POLICY IF EXISTS "Allow anon read on manifestations" ON manifestations;
DROP POLICY IF EXISTS "Allow all read on manifestations" ON manifestations;

-- Question Pool
DROP POLICY IF EXISTS "Allow authenticated read on question_pool" ON question_pool;
DROP POLICY IF EXISTS "Allow anon read on question_pool" ON question_pool;
DROP POLICY IF EXISTS "Allow all read on question_pool" ON question_pool;

-- Question Translations
DROP POLICY IF EXISTS "Allow authenticated read on question_translations" ON question_translations;
DROP POLICY IF EXISTS "Allow anon read on question_translations" ON question_translations;
DROP POLICY IF EXISTS "Allow all read on question_translations" ON question_translations;

-- Decision Weights
DROP POLICY IF EXISTS "Allow authenticated read on decision_weights" ON decision_weights;
DROP POLICY IF EXISTS "Allow anon read on decision_weights" ON decision_weights;
DROP POLICY IF EXISTS "Allow all read on decision_weights" ON decision_weights;

-- Quiz Sessions
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Allow authenticated read all quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Admins can view all quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Allow all read on quiz_sessions" ON quiz_sessions;

-- Answers
DROP POLICY IF EXISTS "Users can view their own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Users can update their own answers" ON answers;
DROP POLICY IF EXISTS "Users can delete their own answers" ON answers;
DROP POLICY IF EXISTS "Admins can view all answers" ON answers;
DROP POLICY IF EXISTS "Allow all read on answers" ON answers;

-- Migration Log
DROP POLICY IF EXISTS "Allow authenticated read on migration_log" ON migration_log;
DROP POLICY IF EXISTS "Allow all read on migration_log" ON migration_log;

-- =========================================================
-- 2. ENABLE RLS ON ALL TABLES
-- =========================================================

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
ALTER TABLE migration_log ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 3. CREATE READ-ONLY POLICIES FOR REFERENCE DATA
-- =========================================================

-- Categories: Public read access
CREATE POLICY "Allow all read on categories"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

-- Spiritual Gifts: Public read access
CREATE POLICY "Allow all read on spiritual_gifts"
ON spiritual_gifts FOR SELECT
TO anon, authenticated
USING (true);

-- Qualities: Public read access
CREATE POLICY "Allow all read on qualities"
ON qualities FOR SELECT
TO anon, authenticated
USING (true);

-- Characteristics: Public read access
CREATE POLICY "Allow all read on characteristics"
ON characteristics FOR SELECT
TO anon, authenticated
USING (true);

-- Dangers: Public read access
CREATE POLICY "Allow all read on dangers"
ON dangers FOR SELECT
TO anon, authenticated
USING (true);

-- Misunderstandings: Public read access
CREATE POLICY "Allow all read on misunderstandings"
ON misunderstandings FOR SELECT
TO anon, authenticated
USING (true);

-- Ministries: Public read access
CREATE POLICY "Allow all read on ministries"
ON ministries FOR SELECT
TO anon, authenticated
USING (true);

-- Manifestations: Public read access
CREATE POLICY "Allow all read on manifestations"
ON manifestations FOR SELECT
TO anon, authenticated
USING (true);

-- Question Pool: Public read access
CREATE POLICY "Allow all read on question_pool"
ON question_pool FOR SELECT
TO anon, authenticated
USING (true);

-- Question Translations: Public read access
CREATE POLICY "Allow all read on question_translations"
ON question_translations FOR SELECT
TO anon, authenticated
USING (true);

-- Decision Weights: Public read access
CREATE POLICY "Allow all read on decision_weights"
ON decision_weights FOR SELECT
TO anon, authenticated
USING (true);

-- Migration Log: Read access for authenticated users
CREATE POLICY "Allow authenticated read on migration_log"
ON migration_log FOR SELECT
TO authenticated
USING (true);

-- =========================================================
-- 4. CREATE USER-SPECIFIC POLICIES FOR QUIZ DATA
-- =========================================================

-- Quiz Sessions: Complete CRUD for own sessions
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

-- Answers: Complete CRUD for own answers
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

-- =========================================================
-- 5. CREATE ADMIN POLICIES (IF NEEDED)
-- =========================================================

-- Admin access to all quiz sessions
CREATE POLICY "Admins can access all quiz sessions"
ON quiz_sessions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR auth.users.email LIKE '%@admin.%'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR auth.users.email LIKE '%@admin.%'
    )
  )
);

-- Admin access to all answers
CREATE POLICY "Admins can access all answers"
ON answers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR auth.users.email LIKE '%@admin.%'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR auth.users.email LIKE '%@admin.%'
    )
  )
);

-- =========================================================
-- 6. GRANT ADDITIONAL TABLE PERMISSIONS
-- =========================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant select on all reference tables to anon users (for public quiz access)
GRANT SELECT ON categories TO anon;
GRANT SELECT ON spiritual_gifts TO anon;
GRANT SELECT ON qualities TO anon;
GRANT SELECT ON characteristics TO anon;
GRANT SELECT ON dangers TO anon;
GRANT SELECT ON misunderstandings TO anon;
GRANT SELECT ON ministries TO anon;
GRANT SELECT ON manifestations TO anon;
GRANT SELECT ON question_pool TO anon;
GRANT SELECT ON question_translations TO anon;
GRANT SELECT ON decision_weights TO anon;

-- Grant insert/update/delete on quiz tables for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON answers TO authenticated;

-- =========================================================
-- 7. VERIFICATION AND TESTING
-- =========================================================

DO $$
BEGIN
  RAISE NOTICE '🔍 Verificando políticas RLS...';
  
  -- Check if all tables have RLS enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('categories', 'spiritual_gifts', 'qualities', 'characteristics', 
                        'dangers', 'misunderstandings', 'ministries', 'manifestations',
                        'question_pool', 'question_translations', 'decision_weights',
                        'quiz_sessions', 'answers', 'migration_log')
    AND c.relrowsecurity = false
  ) THEN
    RAISE WARNING '⚠️ Algumas tabelas não têm RLS habilitado';
  ELSE
    RAISE NOTICE '✅ Todas as tabelas têm RLS habilitado';
  END IF;
  
  -- Count policies
  DECLARE
    policy_count integer;
  BEGIN
    SELECT count(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '📊 Total de políticas RLS criadas: %', policy_count;
    
    IF policy_count >= 20 THEN
      RAISE NOTICE '✅ Número adequado de políticas criadas';
    ELSE
      RAISE WARNING '⚠️ Poucas políticas criadas (%), esperado pelo menos 20', policy_count;
    END IF;
  END;
END
$$;

-- Log da conclusão
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('09_comprehensive_rls', 'RLS completo configurado para todas as tabelas com sucesso', NOW());

-- =========================================================
-- 8. POLICY COMMENTS FOR DOCUMENTATION
-- =========================================================

COMMENT ON POLICY "Allow all read on categories" ON categories IS
'Permite leitura pública de categorias para usuários autenticados e anônimos';

COMMENT ON POLICY "Users can view their own quiz sessions" ON quiz_sessions IS
'Usuários podem ver apenas suas próprias sessões de quiz';

COMMENT ON POLICY "Users can insert their own quiz sessions" ON quiz_sessions IS
'Usuários podem criar novas sessões de quiz para si mesmos';

COMMENT ON POLICY "Admins can access all quiz sessions" ON quiz_sessions IS
'Administradores têm acesso completo a todas as sessões de quiz';

-- Fim do script
RAISE NOTICE '🎉 Comprehensive RLS setup completed successfully!';