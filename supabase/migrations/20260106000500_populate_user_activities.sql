-- Populate user_activities table with historical data
-- This creates activity records based on existing data in the database

-- 1. Create account_created activities for all users
INSERT INTO user_activities (user_id, activity_type, details, created_at)
SELECT
    id as user_id,
    'account_created' as activity_type,
    jsonb_build_object(
        'description', 'User account created',
        'email', email,
        'provider', COALESCE(raw_user_meta_data->>'provider', 'email')
    ) as details,
    created_at
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM user_activities ua
    WHERE ua.user_id = auth.users.id
    AND ua.activity_type = 'account_created'
);

-- 2. Create login activities based on last_sign_in_at
INSERT INTO user_activities (user_id, activity_type, details, created_at)
SELECT
    id as user_id,
    'login' as activity_type,
    jsonb_build_object(
        'description', 'User logged in',
        'email', email
    ) as details,
    last_sign_in_at as created_at
FROM auth.users
WHERE last_sign_in_at IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_activities ua
    WHERE ua.user_id = auth.users.id
    AND ua.activity_type = 'login'
    AND ua.created_at = auth.users.last_sign_in_at
);

-- 3. Create quiz_start activities for all quiz sessions
INSERT INTO user_activities (user_id, activity_type, details, created_at)
SELECT
    qs.user_id,
    'quiz_start' as activity_type,
    jsonb_build_object(
        'description', 'Started spiritual gifts quiz',
        'session_id', qs.id::text
    ) as details,
    qs.created_at
FROM quiz_sessions qs
WHERE NOT EXISTS (
    SELECT 1 FROM user_activities ua
    WHERE ua.user_id = qs.user_id
    AND ua.activity_type = 'quiz_start'
    AND ua.details->>'session_id' = qs.id::text
);

-- 4. Create quiz_complete activities for completed quizzes
INSERT INTO user_activities (user_id, activity_type, details, created_at)
SELECT
    qs.user_id,
    'quiz_complete' as activity_type,
    jsonb_build_object(
        'description', 'Completed spiritual gifts quiz',
        'session_id', qs.id::text,
        'score', (
            SELECT AVG(total_weighted)
            FROM quiz_results_weighted qr
            WHERE qr.session_id = qs.id
        )
    ) as details,
    qs.completed_at
FROM quiz_sessions qs
WHERE qs.is_completed = true
AND qs.completed_at IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_activities ua
    WHERE ua.user_id = qs.user_id
    AND ua.activity_type = 'quiz_complete'
    AND ua.details->>'session_id' = qs.id::text
);

-- 5. Create email_verified activities for users with confirmed emails
INSERT INTO user_activities (user_id, activity_type, details, created_at)
SELECT
    id as user_id,
    'email_verified' as activity_type,
    jsonb_build_object(
        'description', 'Email address verified',
        'email', email
    ) as details,
    COALESCE(email_confirmed_at, created_at) as created_at
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM user_activities ua
    WHERE ua.user_id = auth.users.id
    AND ua.activity_type = 'email_verified'
);

-- Add comment
COMMENT ON TABLE user_activities IS 'Tracks all user activities in the system - populated with historical data';
