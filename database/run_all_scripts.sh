#!/bin/bash

# =========================================================
# AUTOMATED SPIRITUAL GIFTS SYSTEM SETUP
# Execute all SQL scripts in correct order
# =========================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default database connection (override with environment variables)
DB_HOST=db.uedtwdxqplbwmgyoqunp.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
export PGPASSWORD=oNOEmkfzrbGdAu3q

# Function to execute SQL file
execute_sql() {
    local file=$1
    local description=$2

    echo -e "${BLUE}📋 EXECUTING: ${description}${NC}"
    echo -e "${YELLOW}   File: ${file}${NC}"

    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ ERROR: File $file not found${NC}"
        exit 1
    fi

    if PAGER= psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$file" -v ON_ERROR_STOP=1 -q; then
        echo -e "${GREEN}✅ SUCCESS: $description completed${NC}"
    else
        echo -e "${RED}❌ ERROR: Failed to execute $file${NC}"
        exit 1
    fi
    echo ""
}

# Print header
echo -e "${GREEN}"
echo "========================================="
echo "🚀 SPIRITUAL GIFTS SYSTEM SETUP"
echo "========================================="
echo -e "${NC}"

echo -e "${YELLOW}Database: $DB_NAME@$DB_HOST:$DB_PORT${NC}"
echo -e "${YELLOW}User: $DB_USER${NC}"
echo ""

# Confirm execution
read -p "This will COMPLETELY RESET the database. Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Execution cancelled by user${NC}"
    exit 0
fi

echo ""

# Execute scripts in order
execute_sql "00_FRESH_START_drop_and_recreate.sql" "STEP 1: Fresh start (drop & recreate schema)"
execute_sql "01_CLEAN_complete_system.sql" "STEP 2: Create base system"
execute_sql "02_CLEAN_load_data.sql" "STEP 3: Load weight matrix data"
execute_sql "03_CLEAN_load_questions.sql" "STEP 4: Load 140 questions in Portuguese"
execute_sql "04_CLEAN_english_translations.sql" "STEP 5: Load English translations"
execute_sql "05_CLEAN_spanish_translations.sql" "STEP 6: Load Spanish translations"
execute_sql "enhanced_spiritual_gifts_schema.sql" "STEP 7: Load rich multilingual data"
execute_sql "06_CLEAN_final_verification.sql" "STEP 8: Final verification & testing"

# Success message
echo -e "${GREEN}"
echo "========================================="
echo "✅ SETUP COMPLETED SUCCESSFULLY!"
echo "========================================="
echo -e "${NC}"

echo -e "${BLUE}Testing the system...${NC}"

# Test queries
PAGER= psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT
  '🎉 SYSTEM STATUS' as status,
  NOW() as completion_time,
  (SELECT COUNT(*) FROM public.question_pool) as total_questions,
  (SELECT COUNT(DISTINCT locale) FROM public.question_translations) as supported_languages,
  (SELECT COUNT(*) FROM public.decision_weights) as weight_configurations,
  (SELECT COUNT(*) FROM public.categories) as rich_data_categories,
  (SELECT COUNT(*) FROM public.spiritual_gifts) as gifts_with_rich_data,
  '✅ OPERATIONAL' as final_result;
"

echo ""
echo -e "${GREEN}🎉 System is ready for use!${NC}"
echo ""
echo -e "${BLUE}Test queries:${NC}"
echo "  SELECT * FROM get_questions_by_locale('pt');"
echo "  SELECT * FROM get_categories_by_locale('pt');"
echo "  SELECT * FROM get_all_gifts_with_data('pt');"
echo ""