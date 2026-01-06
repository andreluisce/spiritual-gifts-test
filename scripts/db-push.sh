#!/bin/bash
# Script to push Supabase migrations
# Uses the access token from .env.local

set -e

# Load access token from .env.local
if [ -f .env.local ]; then
    export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.local | cut -d '=' -f2)
fi

# Check if token is set
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Error: SUPABASE_ACCESS_TOKEN not found in .env.local"
    echo "Add this line to .env.local:"
    echo "SUPABASE_ACCESS_TOKEN=sbp_6abad92ce0edd0173b360b34faa1e147893e3fd2"
    exit 1
fi

echo "🚀 Pushing migrations to Supabase..."
npx supabase db push "$@"
