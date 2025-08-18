-- =========================================================
-- SPIRITUAL GIFTS TEST - COMPLETE DATABASE REBUILD SCRIPT
-- =========================================================
-- This script rebuilds the entire database from scratch
-- Execute files in this order for complete setup
-- 
-- Usage: Run each file sequentially in the order listed
-- =========================================================

-- 📊 EXECUTION ORDER FOR COMPLETE REBUILD:

-- PHASE 1: CORE SYSTEM SETUP
\echo '🔧 PHASE 1: Setting up core system...'
\i 01_CLEAN_complete_system.sql
\i 08_QUIZ_FUNCTIONS.sql
\i 15_SYSTEM_SETTINGS.sql

-- PHASE 2: DATA LOADING  
\echo '📁 PHASE 2: Loading base data...'
\i 02_CLEAN_load_data.sql
\i 03_CLEAN_load_questions.sql
\i 04_CLEAN_english_translations.sql
\i 05_CLEAN_spanish_translations.sql

-- PHASE 3: SECURITY & PERMISSIONS
\echo '🔒 PHASE 3: Setting up security...'
\i 09_COMPREHENSIVE_RLS.sql
\i 29_FIX_MISSING_RLS.sql

-- PHASE 4: ADVANCED FEATURES
\echo '⚡ PHASE 4: Advanced features...'
\i 25_CREATE_GIFT_COMPATIBILITY_TABLES.sql
\i 26_POPULATE_COMPATIBILITY_DATA.sql
\i 28_CREATE_AI_ANALYSIS_CACHE_SYSTEM.sql

-- PHASE 5: ADMIN & MONITORING
\echo '👑 PHASE 5: Admin and monitoring...'
\i 12_AUDIT_SYSTEM.sql
\i 14_USER_ACTIVITIES.sql
\i 22_USER_DEMOGRAPHICS.sql
\i 23_ADD_DEMOGRAPHICS_COLUMNS.sql

-- PHASE 6: FUNCTIONS & PROCEDURES
\echo '⚙️ PHASE 6: Functions and procedures...'
\i 11_REAL_ADMIN_FUNCTIONS.sql
\i 15_ADMIN_RPC_FUNCTIONS.sql
\i 16_AUDIT_RPC_FUNCTIONS.sql
\i 27_UPDATE_QUIZ_FUNCTION_WITH_DEBUG.sql

-- PHASE 7: FIXES & OPTIMIZATIONS
\echo '🔧 PHASE 7: Final fixes and optimizations...'
\i 17_FIX_ADMIN_STATS.sql
\i 18_FIX_ALL_ADMIN_FUNCTIONS.sql
\i 20_FIX_REMAINING_FUNCTIONS.sql
\i 21_FIX_ANALYTICS_FUNCTION.sql
\i 24_FIX_DUPLICATE_QUESTIONS.sql
\i 30_FIX_GET_ALL_GIFTS_FUNCTION.sql

-- PHASE 8: VERIFICATION
\echo '✅ PHASE 8: Verification...'
\i 13_SYSTEM_STATUS.sql

-- =========================================================
-- POST-SETUP VERIFICATION QUERIES
-- =========================================================

\echo '🔍 Running verification checks...'

-- Check all tables exist
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS status
SELECT 
  COUNT(*) as total_tables,
  COUNT(CASE WHEN rowsecurity THEN 1 END) as rls_enabled,
  COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as rls_disabled
FROM pg_tables 
WHERE schemaname = 'public';

-- Check critical functions exist
SELECT COUNT(*) as total_functions
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Sample data verification
SELECT 
  (SELECT COUNT(*) FROM spiritual_gifts) as spiritual_gifts,
  (SELECT COUNT(*) FROM question_pool) as questions,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM gift_synergies) as synergies;

\echo '✅ Database rebuild complete! Check the output above for verification.'

-- =========================================================
-- IMPORTANT NOTES:
-- =========================================================
-- 1. Ensure Supabase authentication is configured
-- 2. Set proper environment variables for AI services  
-- 3. Test all API endpoints after deployment
-- 4. Monitor RLS policies are working correctly
-- 5. Run backup before executing in production
-- =========================================================