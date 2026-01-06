#!/bin/bash

# Script to apply the duplicate activities fix migration
# Run this to fix the duplicate login activities issue

echo "🔧 Applying migration to fix duplicate activities..."
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/vttkurdzstlkybojigry/sql/new"
echo "2. Copy and paste the SQL from: supabase/migrations/20260106150000_fix_recent_activity_duplicates.sql"
echo "3. Click 'Run' to execute the migration"
echo ""
echo "Or use the Supabase CLI with:"
echo "  npx supabase db push --linked"
echo ""
echo "The migration will:"
echo "  ✓ Update get_recent_activity() to use the user_activities table"
echo "  ✓ Remove duplicate login/activity records (keeping only most recent)"
echo "  ✓ Map activity types correctly (login→user, quiz_complete→quiz, etc.)"
echo ""

# Try to open the SQL editor in the browser
if command -v open &> /dev/null; then
    read -p "Open Supabase SQL editor in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://supabase.com/dashboard/project/vttkurdzstlkybojigry/sql/new"
        echo "✅ Opened SQL editor in browser"
    fi
fi
