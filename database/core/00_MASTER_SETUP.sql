-- =========================================================
-- MASTER SETUP SCRIPT - DOCUMENTATION ONLY
-- This file documents the execution order - run scripts manually
-- =========================================================

-- IMPORTANT: Execute these scripts in the following order:
-- (This file cannot execute other files directly in SQL)

-- STEP 1: FRESH START (WARNING - REMOVES ALL DATA!)
-- Execute: 00_FRESH_START_drop_and_recreate.sql

-- STEP 2: BASE SYSTEM
-- Execute: 01_CLEAN_complete_system.sql

-- STEP 3: LOAD DATA - WEIGHT MATRIX  
-- Execute: 02_CLEAN_load_data.sql

-- STEP 4: LOAD 140 QUESTIONS IN PORTUGUESE
-- Execute: 03_CLEAN_load_questions.sql

-- STEP 5: ENGLISH TRANSLATIONS
-- Execute: 04_CLEAN_english_translations.sql

-- STEP 6: SPANISH TRANSLATIONS
-- Execute: 05_CLEAN_spanish_translations.sql

-- STEP 7: RICH MULTILINGUAL DATA (ENHANCED)
-- Execute: enhanced_spiritual_gifts_schema.sql

-- STEP 8: FINAL VERIFICATION
-- Execute: 06_CLEAN_final_verification.sql

-- STEP 9: ROW LEVEL SECURITY (RLS) POLICIES  
-- Execute: 07_RLS_policies.sql

-- STEP 10: ADVANCED QUIZ FUNCTIONS (Updated: 2025-08-12)
-- Execute: 08_QUIZ_FUNCTIONS.sql

-- STEP 11: COMPREHENSIVE RLS FOR ALL TABLES (Updated: 2025-08-12)
-- Execute: 09_COMPREHENSIVE_RLS.sql

-- =========================================================
-- EXECUTION COMMANDS FOR PSQL CLIENT:
-- =========================================================
/*
To execute all scripts via psql command line:

psql -d your_database -c "\i 00_FRESH_START_drop_and_recreate.sql"
psql -d your_database -c "\i 01_CLEAN_complete_system.sql"
psql -d your_database -c "\i 02_CLEAN_load_data.sql"
psql -d your_database -c "\i 03_CLEAN_load_questions.sql"
psql -d your_database -c "\i 04_CLEAN_english_translations.sql"
psql -d your_database -c "\i 05_CLEAN_spanish_translations.sql"
psql -d your_database -c "\i enhanced_spiritual_gifts_schema.sql"
psql -d your_database -c "\i 06_CLEAN_final_verification.sql"
psql -d your_database -c "\i 07_RLS_policies.sql"
psql -d your_database -c "\i 08_QUIZ_FUNCTIONS.sql"
psql -d your_database -c "\i 09_COMPREHENSIVE_RLS.sql"

OR execute this entire folder with a bash script (see run_all_scripts.sh)
*/

-- Test the final system with these queries:
-- SELECT * FROM get_questions_by_locale('pt');
-- SELECT * FROM get_categories_by_locale('pt');  
-- SELECT * FROM get_all_gifts_with_data('pt');