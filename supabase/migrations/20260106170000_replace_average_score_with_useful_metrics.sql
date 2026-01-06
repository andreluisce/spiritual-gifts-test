-- Replace confusing "average score" with useful metrics for spiritual gifts test
-- Add: mostCommonGift, mostCommonGiftPercentage, completionRate, averageCompletionTime

DROP FUNCTION IF EXISTS public.get_admin_stats();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
    totalUsers BIGINT,
    activeUsers BIGINT,
    inactiveUsers BIGINT,
    recentlyActiveUsers BIGINT,
    dormantUsers BIGINT,
    adminUsers BIGINT,
    newUsersThisMonth BIGINT,
    totalQuizzes BIGINT,
    completedToday BIGINT,
    -- New useful metrics instead of averageScore
    mostCommonGift TEXT,
    mostCommonGiftPercentage NUMERIC,
    completionRate NUMERIC,
    averageCompletionTimeMinutes NUMERIC,
    -- Keep mostPopularGift for backwards compatibility (deprecated)
    mostPopularGift TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    total_sessions BIGINT;
    completed_sessions BIGINT;
    top_gift_count BIGINT;
    total_completed_users BIGINT;
BEGIN
    -- Get totals for calculations
    SELECT COUNT(*) INTO total_sessions FROM quiz_sessions;
    SELECT COUNT(*) INTO completed_sessions FROM quiz_sessions WHERE is_completed = true;
    SELECT COUNT(DISTINCT user_id) INTO total_completed_users
    FROM quiz_sessions WHERE is_completed = true;

    RETURN QUERY
    SELECT
        -- Total users from auth.users
        (SELECT count(*) FROM auth.users)::BIGINT,

        -- Active users (by status in profiles)
        (SELECT count(*)
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.id = au.id
         WHERE COALESCE(p.status, 'active') = 'active')::BIGINT,

        -- Inactive/suspended users (by status)
        (SELECT count(*)
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.id = au.id
         WHERE p.status IN ('inactive', 'suspended'))::BIGINT,

        -- Recently active users (logged in within last 30 days)
        (SELECT count(*)
         FROM auth.users au
         WHERE au.last_sign_in_at > now() - interval '30 days')::BIGINT,

        -- Dormant users (status = active but haven't logged in for 30+ days)
        (SELECT count(*)
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.id = au.id
         WHERE COALESCE(p.status, 'active') = 'active'
         AND (au.last_sign_in_at IS NULL OR au.last_sign_in_at <= now() - interval '30 days'))::BIGINT,

        -- Admin users
        (SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin')::BIGINT,

        -- New users this month
        (SELECT count(*) FROM auth.users WHERE created_at > date_trunc('month', now()))::BIGINT,

        -- Total completed quizzes
        completed_sessions,

        -- Quizzes completed today
        (SELECT count(*) FROM quiz_sessions
         WHERE is_completed = true
         AND completed_at > date_trunc('day', now()))::BIGINT,

        -- Most common gift (the gift that appears most as TOP 1)
        (
            WITH user_top_gifts AS (
                SELECT DISTINCT ON (qrw.session_id)
                    qrw.gift
                FROM quiz_results_weighted qrw
                INNER JOIN quiz_sessions qs ON qs.id = qrw.session_id
                WHERE qs.is_completed = true
                ORDER BY qrw.session_id, qrw.total_weighted DESC
            ),
            gift_counts AS (
                SELECT
                    gift,
                    COUNT(*) as count
                FROM user_top_gifts
                GROUP BY gift
                ORDER BY count DESC
                LIMIT 1
            )
            SELECT CASE gc.gift
                WHEN 'A_PROPHECY' THEN 'Prophecy'
                WHEN 'B_SERVICE' THEN 'Service'
                WHEN 'C_TEACHING' THEN 'Teaching'
                WHEN 'D_EXHORTATION' THEN 'Exhortation'
                WHEN 'E_GIVING' THEN 'Giving'
                WHEN 'F_LEADERSHIP' THEN 'Leadership'
                WHEN 'G_MERCY' THEN 'Mercy'
                ELSE 'N/A'
            END
            FROM gift_counts gc
        )::TEXT,

        -- Most common gift percentage
        (
            WITH user_top_gifts AS (
                SELECT DISTINCT ON (qrw.session_id)
                    qrw.gift
                FROM quiz_results_weighted qrw
                INNER JOIN quiz_sessions qs ON qs.id = qrw.session_id
                WHERE qs.is_completed = true
                ORDER BY qrw.session_id, qrw.total_weighted DESC
            ),
            gift_counts AS (
                SELECT
                    COUNT(*) as count
                FROM user_top_gifts
                GROUP BY gift
                ORDER BY count DESC
                LIMIT 1
            )
            SELECT CASE
                WHEN total_completed_users > 0
                THEN ROUND((gc.count::NUMERIC / total_completed_users) * 100, 1)
                ELSE 0
            END
            FROM gift_counts gc
        )::NUMERIC,

        -- Completion rate (% of started quizzes that were completed)
        (
            CASE
                WHEN total_sessions > 0
                THEN ROUND((completed_sessions::NUMERIC / total_sessions) * 100, 1)
                ELSE 0
            END
        )::NUMERIC,

        -- Average completion time in minutes
        (
            SELECT COALESCE(
                ROUND(
                    AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60)::NUMERIC,
                    1
                ),
                0
            )
            FROM quiz_sessions
            WHERE is_completed = true
            AND completed_at IS NOT NULL
            AND created_at IS NOT NULL
        )::NUMERIC,

        -- Deprecated: mostPopularGift (kept for backwards compatibility, same as mostCommonGift)
        (
            WITH user_top_gifts AS (
                SELECT DISTINCT ON (qrw.session_id)
                    qrw.gift
                FROM quiz_results_weighted qrw
                INNER JOIN quiz_sessions qs ON qs.id = qrw.session_id
                WHERE qs.is_completed = true
                ORDER BY qrw.session_id, qrw.total_weighted DESC
            ),
            gift_counts AS (
                SELECT
                    gift,
                    COUNT(*) as count
                FROM user_top_gifts
                GROUP BY gift
                ORDER BY count DESC
                LIMIT 1
            )
            SELECT CASE gc.gift
                WHEN 'A_PROPHECY' THEN 'Prophecy'
                WHEN 'B_SERVICE' THEN 'Service'
                WHEN 'C_TEACHING' THEN 'Teaching'
                WHEN 'D_EXHORTATION' THEN 'Exhortation'
                WHEN 'E_GIVING' THEN 'Giving'
                WHEN 'F_LEADERSHIP' THEN 'Leadership'
                WHEN 'G_MERCY' THEN 'Mercy'
                ELSE 'N/A'
            END
            FROM gift_counts gc
        )::TEXT;
END;
$$;

COMMENT ON FUNCTION public.get_admin_stats IS 'Returns admin dashboard statistics with useful metrics: most common gift, completion rate, and average time (averageScore removed as it was confusing for spiritual gifts assessment)';
