#!/bin/bash

# =========================================================
# APPLY ROW LEVEL SECURITY POLICIES
# Standalone script to apply RLS policies to existing database
# =========================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default database connection (override with environment variables)
DB_HOST=${DB_HOST:-db.uedtwdxqplbwmgyoqunp.supabase.co}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-postgres}
DB_USER=${DB_USER:-postgres}
export PGPASSWORD=${PGPASSWORD:-oNOEmkfzrbGdAu3q}

# Print header
echo -e "${GREEN}"
echo "========================================="
echo "🔐 APPLYING RLS POLICIES"
echo "========================================="
echo -e "${NC}"

echo -e "${YELLOW}Database: $DB_NAME@$DB_HOST:$DB_PORT${NC}"
echo -e "${YELLOW}User: $DB_USER${NC}"
echo ""

# Check if RLS policies file exists
if [ ! -f "07_RLS_policies.sql" ]; then
    echo -e "${RED}❌ ERROR: File 07_RLS_policies.sql not found${NC}"
    echo -e "${YELLOW}Make sure you're running this script from the database directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Applying Row Level Security policies...${NC}"
echo ""

# Execute RLS policies
if PAGER= psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "07_RLS_policies.sql" -v ON_ERROR_STOP=1; then
    echo ""
    echo -e "${GREEN}✅ SUCCESS: RLS policies applied successfully${NC}"
else
    echo -e "${RED}❌ ERROR: Failed to apply RLS policies${NC}"
    exit 1
fi

# Test the policies
echo ""
echo -e "${BLUE}Testing RLS policies...${NC}"

PAGER= psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
    AND tablename IN ('categories', 'spiritual_gifts', 'question_pool', 'quiz_sessions', 'answers')
ORDER BY tablename;
"

echo ""
echo -e "${GREEN}🎉 RLS policies are now active!${NC}"
echo ""
echo -e "${BLUE}Key points:${NC}"
echo "• All authenticated users can read spiritual gifts data"
echo "• Users can only access their own quiz sessions and answers"  
echo "• Admins can access all data (if is_admin metadata is set)"
echo ""