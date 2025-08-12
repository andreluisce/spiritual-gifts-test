-- Row Level Security (RLS) Policies for Spiritual Gifts Application
-- This script enables RLS and creates policies for authenticated users to read all necessary data

-- Drop existing policies first (for idempotent script execution)
DROP POLICY IF EXISTS "Allow authenticated read on categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated read on spiritual_gifts" ON spiritual_gifts;
DROP POLICY IF EXISTS "Allow authenticated read on qualities" ON qualities;
DROP POLICY IF EXISTS "Allow authenticated read on characteristics" ON characteristics;
DROP POLICY IF EXISTS "Allow authenticated read on dangers" ON dangers;
DROP POLICY IF EXISTS "Allow authenticated read on misunderstandings" ON misunderstandings;
DROP POLICY IF EXISTS "Allow authenticated read on ministries" ON ministries;
DROP POLICY IF EXISTS "Allow authenticated read on manifestations" ON manifestations;
DROP POLICY IF EXISTS "Allow authenticated read on question_pool" ON question_pool;
DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Users can view their own answers" ON answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON answers;
DROP POLICY IF EXISTS "Admins can view all quiz sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "Admins can view all answers" ON answers;

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
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Categories: Allow authenticated users to read all categories
CREATE POLICY "Allow authenticated read on categories" 
ON categories FOR SELECT 
TO authenticated 
USING (true);

-- Spiritual Gifts: Allow authenticated users to read all spiritual gifts
CREATE POLICY "Allow authenticated read on spiritual_gifts" 
ON spiritual_gifts FOR SELECT 
TO authenticated 
USING (true);

-- Qualities: Allow authenticated users to read all qualities
CREATE POLICY "Allow authenticated read on qualities" 
ON qualities FOR SELECT 
TO authenticated 
USING (true);

-- Characteristics: Allow authenticated users to read all characteristics
CREATE POLICY "Allow authenticated read on characteristics" 
ON characteristics FOR SELECT 
TO authenticated 
USING (true);

-- Dangers: Allow authenticated users to read all dangers
CREATE POLICY "Allow authenticated read on dangers" 
ON dangers FOR SELECT 
TO authenticated 
USING (true);

-- Misunderstandings: Allow authenticated users to read all misunderstandings
CREATE POLICY "Allow authenticated read on misunderstandings" 
ON misunderstandings FOR SELECT 
TO authenticated 
USING (true);

-- Ministries: Allow authenticated users to read all ministries
CREATE POLICY "Allow authenticated read on ministries" 
ON ministries FOR SELECT 
TO authenticated 
USING (true);

-- Manifestations: Allow authenticated users to read all manifestations
CREATE POLICY "Allow authenticated read on manifestations" 
ON manifestations FOR SELECT 
TO authenticated 
USING (true);

-- Question Pool: Allow authenticated users to read all questions
CREATE POLICY "Allow authenticated read on question_pool" 
ON question_pool FOR SELECT 
TO authenticated 
USING (true);

-- Quiz Sessions: Allow users to read their own sessions and insert new ones
CREATE POLICY "Users can view their own quiz sessions" 
ON quiz_sessions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions" 
ON quiz_sessions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Answers: Allow users to read and insert their own answers
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

-- Admin policies: Allow admins to read all data from quiz sessions and answers
CREATE POLICY "Admins can view all quiz sessions" 
ON quiz_sessions FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
  )
);

CREATE POLICY "Admins can view all answers" 
ON answers FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
  )
);

-- Grant permissions to functions if they exist (silently fail if not)
DO $$
BEGIN
    -- Grant permissions to quiz functions  
    BEGIN
        GRANT EXECUTE ON FUNCTION get_questions_by_locale(text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_questions_by_locale(text) does not exist, skipping grant';
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION calculate_quiz_result(uuid) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function calculate_quiz_result(uuid) does not exist, skipping grant';
    END;
    
    -- Grant permissions to rich data functions
    BEGIN
        GRANT EXECUTE ON FUNCTION get_all_gifts_with_data(text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_all_gifts_with_data(text) does not exist, skipping grant';
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_gift_complete_data(gift_key, text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_gift_complete_data(gift_key, text) does not exist, skipping grant';
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_top_gift_details(uuid, text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_top_gift_details(uuid, text) does not exist, skipping grant';
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_categories_by_locale(text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_categories_by_locale(text) does not exist, skipping grant';
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_ministries_by_locale(text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_ministries_by_locale(text) does not exist, skipping grant';
    END;
    
    BEGIN
        GRANT EXECUTE ON FUNCTION get_manifestations_by_locale(text) TO authenticated;
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'Function get_manifestations_by_locale(text) does not exist, skipping grant';
    END;
END
$$;

-- Grant usage on sequences (for inserting new records)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON POLICY "Allow authenticated read on categories" ON categories IS 
'Allow all authenticated users to read category data for the spiritual gifts application';

COMMENT ON POLICY "Allow authenticated read on question_pool" ON question_pool IS 
'Allow all authenticated users to read questions for taking the quiz';

COMMENT ON POLICY "Users can view their own quiz sessions" ON quiz_sessions IS 
'Users can only view their own quiz sessions for privacy';

COMMENT ON POLICY "Users can view their own answers" ON answers IS 
'Users can only view answers from their own quiz sessions';