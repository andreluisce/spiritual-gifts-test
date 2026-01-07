-- Migration: Update RLS Policies for Manager Role
-- Description: Allow managers to view analytics and users (read-only)
-- Author: System
-- Date: 2026-01-07

-- ============================================
-- QUIZ SESSIONS - Allow managers to view
-- ============================================
DROP POLICY IF EXISTS "Managers can view quiz sessions" ON quiz_sessions;
CREATE POLICY "Managers can view quiz sessions"
  ON quiz_sessions FOR SELECT
  USING (
    is_user_manager() OR
    id = auth.uid()
  );

-- ============================================
-- PROFILES - Managers can view, only admins can edit/delete
-- ============================================
DROP POLICY IF EXISTS "Managers can view all profiles" ON profiles;
CREATE POLICY "Managers can view all profiles"
  ON profiles FOR SELECT
  USING (is_user_manager());

DROP POLICY IF EXISTS "Only admins can update profiles" ON profiles;
CREATE POLICY "Only admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    is_user_admin_safe() OR
    id = auth.uid()  -- Users can update their own profile
  );

DROP POLICY IF EXISTS "Only admins can delete profiles" ON profiles;
CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_user_admin_safe());

-- ============================================
-- SYSTEM SETTINGS - Managers can view, only admins can edit
-- ============================================
DROP POLICY IF EXISTS "Managers can view system settings" ON system_settings;
CREATE POLICY "Managers can view system settings"
  ON system_settings FOR SELECT
  USING (is_user_manager());

DROP POLICY IF EXISTS "Only admins can edit system settings" ON system_settings;
CREATE POLICY "Only admins can edit system settings"
  ON system_settings FOR UPDATE
  USING (is_user_admin_safe());

DROP POLICY IF EXISTS "Only admins can insert system settings" ON system_settings;
CREATE POLICY "Only admins can insert system settings"
  ON system_settings FOR INSERT
  WITH CHECK (is_user_admin_safe());

DROP POLICY IF EXISTS "Only admins can delete system settings" ON system_settings;
CREATE POLICY "Only admins can delete system settings"
  ON system_settings FOR DELETE
  USING (is_user_admin_safe());

-- ============================================
-- ============================================
-- ANSWERS - Managers can view all answers
-- ============================================
DROP POLICY IF EXISTS "Managers can view answers" ON answers;
CREATE POLICY "Managers can view answers"
  ON answers FOR SELECT
  USING (
    is_user_manager() OR
    session_id IN (
      SELECT id FROM quiz_sessions WHERE id = auth.uid()
    )
  );

-- ============================================
-- USER ACTIVITIES - Managers can view
-- ============================================
DROP POLICY IF EXISTS "Managers can view user activities" ON user_activities;
CREATE POLICY "Managers can view user activities"
  ON user_activities FOR SELECT
  USING (
    is_user_manager() OR
    id = auth.uid()
  );

-- ============================================
-- SPIRITUAL GIFTS - Everyone can view, only admins can edit
-- ============================================
DROP POLICY IF EXISTS "Anyone can view spiritual gifts" ON spiritual_gifts;
CREATE POLICY "Anyone can view spiritual gifts"
  ON spiritual_gifts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can edit spiritual gifts" ON spiritual_gifts;
CREATE POLICY "Only admins can edit spiritual gifts"
  ON spiritual_gifts FOR ALL
  USING (is_user_admin_safe())
  WITH CHECK (is_user_admin_safe());

-- ============================================
-- QUESTION POOL - Everyone can view, only admins can edit
-- ============================================
DROP POLICY IF EXISTS "Anyone can view questions" ON question_pool;
CREATE POLICY "Anyone can view questions"
  ON question_pool FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can edit questions" ON question_pool;
CREATE POLICY "Only admins can edit questions"
  ON question_pool FOR ALL
  USING (is_user_admin_safe())
  WITH CHECK (is_user_admin_safe());

-- ============================================
-- EDUCATIONAL CONTENT - Everyone can view, only admins can edit
-- ============================================
DROP POLICY IF EXISTS "Anyone can view educational content" ON educational_content;
CREATE POLICY "Anyone can view educational content"
  ON educational_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can edit educational content" ON educational_content;
CREATE POLICY "Only admins can edit educational content"
  ON educational_content FOR ALL
  USING (is_user_admin_safe())
  WITH CHECK (is_user_admin_safe());

-- Log policy updates
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated for manager role support';
  RAISE NOTICE 'Managers can now:';
  RAISE NOTICE '  - View quiz sessions, results, and answers';
  RAISE NOTICE '  - View all user profiles (read-only)';
  RAISE NOTICE '  - View system settings (read-only)';
  RAISE NOTICE '  - View user activities';
  RAISE NOTICE 'Only admins can:';
  RAISE NOTICE '  - Edit/delete users';
  RAISE NOTICE '  - Edit system settings';
  RAISE NOTICE '  - Edit spiritual gifts, questions, and content';
END $$;
