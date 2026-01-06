-- ============================================================
-- FIX ADMIN STATS TO USE REAL DATA IN PRODUCTION
-- ============================================================
-- This script updates the get_admin_stats() function to return
-- REAL data from the database instead of mock/stub data.
--
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Update get_admin_stats to return TABLE with REAL data
DROP FUNCTION IF EXISTS public.get_admin_stats();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
    totalUsers BIGINT,
    activeUsers BIGINT,
    adminUsers BIGINT,
    newUsersThisMonth BIGINT,
    totalQuizzes BIGINT,
    completedToday BIGINT,
    averageScore NUMERIC,
    mostPopularGift TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Total users from auth.users
        (SELECT count(*) FROM auth.users),

        -- Active users (logged in within last 30 days)
        (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '30 days'),

        -- Admin users
        (SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'),

        -- New users this month
        (SELECT count(*) FROM auth.users WHERE created_at > date_trunc('month', now())),

        -- Total completed quizzes
        (SELECT count(*) FROM quiz_sessions WHERE is_completed = true),

        -- Quizzes completed today
        (SELECT count(*) FROM quiz_sessions WHERE is_completed = true AND completed_at > date_trunc('day', now())),

        -- Average score across all completed quizzes
        (SELECT COALESCE(AVG(total_weighted), 0) FROM quiz_results_weighted qr JOIN quiz_sessions qs ON qr.session_id = qs.id WHERE qs.is_completed = true),

        -- Most popular gift
        (
            SELECT COALESCE(
                (
                    SELECT gift_name
                    FROM (
                        SELECT
                            CASE qr.gift
                                WHEN 'A_PROPHECY' THEN 'Prophecy'
                                WHEN 'B_SERVICE' THEN 'Service'
                                WHEN 'C_TEACHING' THEN 'Teaching'
                                WHEN 'D_EXHORTATION' THEN 'Exhortation'
                                WHEN 'E_GIVING' THEN 'Giving'
                                WHEN 'F_LEADERSHIP' THEN 'Leadership'
                                WHEN 'G_MERCY' THEN 'Mercy'
                                ELSE 'Unknown'
                            END as gift_name,
                            count(*) as gift_count
                        FROM quiz_results_weighted qr
                        JOIN quiz_sessions qs ON qr.session_id = qs.id
                        WHERE qs.is_completed = true
                        GROUP BY qr.gift
                        ORDER BY gift_count DESC
                        LIMIT 1
                    ) top_gift
                ),
                'N/A'
            )
        );
END;
$$;

-- Grant execute permission to authenticated users (admin check is done in frontend)
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- Test the function
SELECT * FROM public.get_admin_stats();
