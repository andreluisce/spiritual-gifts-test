-- Clean up duplicate activities, keeping only the most recent of each type per user
-- This removes the historical duplicates that were created before the prevention was added

WITH activities_to_keep AS (
  SELECT DISTINCT ON (user_id, activity_type)
    id
  FROM user_activities
  ORDER BY user_id, activity_type, created_at DESC
)
DELETE FROM user_activities
WHERE id NOT IN (SELECT id FROM activities_to_keep);

-- Log the cleanup results
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM user_activities;
  RAISE NOTICE 'Cleanup complete. Remaining user_activities records: %', remaining_count;
END $$;
