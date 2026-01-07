-- Migration: Create User Roles System
-- Description: Adds ENUM for user roles and permissions column to profiles table
-- Author: System
-- Date: 2026-01-07

-- Create ENUM for user roles
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('user', 'manager', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role_new user_role_type DEFAULT 'user',
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Migrate existing admin users to new role system
-- Check old role column and auth.users raw_user_meta_data
UPDATE profiles
SET
  role_new = 'admin',
  permissions = '["analytics", "users_read", "users_write", "system_admin"]'::jsonb
WHERE
  -- Check old role column (if it exists and is text-based)
  role = 'admin'
  -- Check if user is in auth.users with admin in raw_user_meta_data
  OR id IN (
    SELECT id FROM auth.users
    WHERE
      (raw_user_meta_data->>'role')::text = 'admin'
      OR (raw_user_meta_data->>'is_admin')::boolean = true
  );

-- Set all non-admin users to 'user' role with no permissions
UPDATE profiles
SET
  role_new = 'user',
  permissions = '[]'::jsonb
WHERE role_new IS NULL OR role_new = 'user';

-- Drop old role column if it exists and is text-based
DO $$ BEGIN
  ALTER TABLE profiles DROP COLUMN IF EXISTS role;
EXCEPTION
  WHEN undefined_column THEN null;
END $$;

-- Rename new role column to role
ALTER TABLE profiles RENAME COLUMN role_new TO role;

-- Add NOT NULL constraint
ALTER TABLE profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN permissions SET NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_permissions ON profiles USING gin(permissions);

-- Add comments for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user (default), manager (analytics access), or admin (full access)';
COMMENT ON COLUMN profiles.permissions IS 'Array of permission groups: analytics, users_read, users_write, system_admin';

-- Add check constraint to ensure permissions are valid
ALTER TABLE profiles
ADD CONSTRAINT check_valid_permissions
CHECK (
  permissions <@ '["analytics", "users_read", "users_write", "system_admin"]'::jsonb
);

-- Log migration completion
DO $$
DECLARE
  admin_count INTEGER;
  manager_count INTEGER;
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  SELECT COUNT(*) INTO manager_count FROM profiles WHERE role = 'manager';
  SELECT COUNT(*) INTO user_count FROM profiles WHERE role = 'user';

  RAISE NOTICE 'User roles migration completed:';
  RAISE NOTICE '  - Admins: %', admin_count;
  RAISE NOTICE '  - Managers: %', manager_count;
  RAISE NOTICE '  - Users: %', user_count;
END $$;
