#!/bin/bash

# Script to apply RLS policies to Supabase database
echo "Applying RLS policies to database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Using supabase db push..."
    supabase db push
else
    echo "Using psql with DATABASE_URL..."
    psql "$DATABASE_URL" -f database/07_RLS_policies.sql
fi

echo "RLS policies applied successfully!"