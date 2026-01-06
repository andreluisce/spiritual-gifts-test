-- Debug query to check actual user_activities data
SELECT
  ua.user_id,
  u.email,
  ua.activity_type,
  ua.created_at,
  COUNT(*) OVER (PARTITION BY ua.user_id) as total_activities_for_user
FROM user_activities ua
LEFT JOIN auth.users u ON ua.user_id = u.id
WHERE u.email LIKE '%andre%' OR u.email LIKE '%evangelista%'
ORDER BY ua.created_at DESC
LIMIT 20;
