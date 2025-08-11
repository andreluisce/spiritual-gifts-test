-- Make a user admin by email
-- Replace 'user@example.com' with the actual email

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'user@example.com';

-- Also update the profiles table if it exists
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');