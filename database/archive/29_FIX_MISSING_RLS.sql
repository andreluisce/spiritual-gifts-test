-- =========================================================
-- FIX MISSING ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
-- This script enables RLS on tables that are missing it
-- and creates appropriate security policies
-- =========================================================

\echo '🔒 Enabling RLS on tables without protection...'

-- Enable RLS on all tables that don't have it
ALTER TABLE biblical_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblical_references_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_orientations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_synergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifestation_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_growth_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_required_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE synergy_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE synergy_strengths ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- CREATE SECURITY POLICIES FOR EACH TABLE
-- =========================================================

-- Biblical Activities (read-only for all authenticated users)
DROP POLICY IF EXISTS "Biblical activities are readable by authenticated users" ON biblical_activities;
CREATE POLICY "Biblical activities are readable by authenticated users"
  ON biblical_activities FOR SELECT
  TO authenticated
  USING (true);

-- Biblical References Detailed (read-only for all authenticated users)
DROP POLICY IF EXISTS "Biblical references are readable by authenticated users" ON biblical_references_detailed;
CREATE POLICY "Biblical references are readable by authenticated users"
  ON biblical_references_detailed FOR SELECT
  TO authenticated
  USING (true);

-- Gift Orientations (read-only for all authenticated users)
DROP POLICY IF EXISTS "Gift orientations are readable by authenticated users" ON gift_orientations;
CREATE POLICY "Gift orientations are readable by authenticated users"
  ON gift_orientations FOR SELECT
  TO authenticated
  USING (true);

-- Gift Synergies (read-only for all authenticated users)
DROP POLICY IF EXISTS "Gift synergies are readable by authenticated users" ON gift_synergies;
CREATE POLICY "Gift synergies are readable by authenticated users"
  ON gift_synergies FOR SELECT
  TO authenticated
  USING (true);

-- Manifestation Principles (read-only for all authenticated users)
DROP POLICY IF EXISTS "Manifestation principles are readable by authenticated users" ON manifestation_principles;
CREATE POLICY "Manifestation principles are readable by authenticated users"
  ON manifestation_principles FOR SELECT
  TO authenticated
  USING (true);

-- Ministry Growth Areas (read-only for all authenticated users)
DROP POLICY IF EXISTS "Ministry growth areas are readable by authenticated users" ON ministry_growth_areas;
CREATE POLICY "Ministry growth areas are readable by authenticated users"
  ON ministry_growth_areas FOR SELECT
  TO authenticated
  USING (true);

-- Ministry Recommendations (read-only for all authenticated users)
DROP POLICY IF EXISTS "Ministry recommendations are readable by authenticated users" ON ministry_recommendations;
CREATE POLICY "Ministry recommendations are readable by authenticated users"
  ON ministry_recommendations FOR SELECT
  TO authenticated
  USING (true);

-- Ministry Required Gifts (read-only for all authenticated users)
DROP POLICY IF EXISTS "Ministry required gifts are readable by authenticated users" ON ministry_required_gifts;
CREATE POLICY "Ministry required gifts are readable by authenticated users"
  ON ministry_required_gifts FOR SELECT
  TO authenticated
  USING (true);

-- Ministry Responsibilities (read-only for all authenticated users)
DROP POLICY IF EXISTS "Ministry responsibilities are readable by authenticated users" ON ministry_responsibilities;
CREATE POLICY "Ministry responsibilities are readable by authenticated users"
  ON ministry_responsibilities FOR SELECT
  TO authenticated
  USING (true);

-- Synergy Challenges (read-only for all authenticated users)
DROP POLICY IF EXISTS "Synergy challenges are readable by authenticated users" ON synergy_challenges;
CREATE POLICY "Synergy challenges are readable by authenticated users"
  ON synergy_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Synergy Strengths (read-only for all authenticated users)
DROP POLICY IF EXISTS "Synergy strengths are readable by authenticated users" ON synergy_strengths;
CREATE POLICY "Synergy strengths are readable by authenticated users"
  ON synergy_strengths FOR SELECT
  TO authenticated
  USING (true);

-- =========================================================
-- GRANT NECESSARY PERMISSIONS
-- =========================================================

-- Grant SELECT permissions to authenticated users for all tables
GRANT SELECT ON biblical_activities TO authenticated;
GRANT SELECT ON biblical_references_detailed TO authenticated;
GRANT SELECT ON gift_orientations TO authenticated;
GRANT SELECT ON gift_synergies TO authenticated;
GRANT SELECT ON manifestation_principles TO authenticated;
GRANT SELECT ON ministry_growth_areas TO authenticated;
GRANT SELECT ON ministry_recommendations TO authenticated;
GRANT SELECT ON ministry_required_gifts TO authenticated;
GRANT SELECT ON ministry_responsibilities TO authenticated;
GRANT SELECT ON synergy_challenges TO authenticated;
GRANT SELECT ON synergy_strengths TO authenticated;

-- Grant SELECT to anonymous users for public reference data
GRANT SELECT ON biblical_activities TO anon;
GRANT SELECT ON biblical_references_detailed TO anon;
GRANT SELECT ON gift_orientations TO anon;
GRANT SELECT ON gift_synergies TO anon;
GRANT SELECT ON manifestation_principles TO anon;
GRANT SELECT ON ministry_growth_areas TO anon;
GRANT SELECT ON ministry_recommendations TO anon;
GRANT SELECT ON ministry_required_gifts TO anon;
GRANT SELECT ON ministry_responsibilities TO anon;
GRANT SELECT ON synergy_challenges TO anon;
GRANT SELECT ON synergy_strengths TO anon;

-- =========================================================
-- VERIFICATION QUERY
-- =========================================================

\echo '✅ Verifying RLS status after fixes...'

SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Still Disabled'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'biblical_activities',
    'biblical_references_detailed', 
    'gift_orientations',
    'gift_synergies',
    'manifestation_principles',
    'ministry_growth_areas',
    'ministry_recommendations',
    'ministry_required_gifts',
    'ministry_responsibilities',
    'synergy_challenges',
    'synergy_strengths'
  )
ORDER BY tablename;

\echo '🔒 RLS fixes completed!'

-- =========================================================
-- SUMMARY OF SECURITY POLICIES APPLIED:
-- =========================================================
-- All tables now have RLS enabled with read-only policies
-- for authenticated users. This ensures:
-- 
-- 1. Data integrity is maintained
-- 2. No unauthorized modifications
-- 3. Consistent access patterns
-- 4. Future-proof security model
-- 
-- These are reference/lookup tables that should be
-- read-only for application users.
-- =========================================================