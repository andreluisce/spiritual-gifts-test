-- Fix column names in analytics functions
DROP FUNCTION IF EXISTS public.get_analytics_data(TEXT);
CREATE OR REPLACE FUNCTION public.get_analytics_data(date_range_param TEXT DEFAULT '30d')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    interval_value INTERVAL;
    result JSONB;
BEGIN
    -- Convert date range to interval
    interval_value := CASE date_range_param
        WHEN '7d' THEN interval '7 days'
        WHEN '30d' THEN interval '30 days'
        WHEN '90d' THEN interval '90 days'
        WHEN '1y' THEN interval '1 year'
        ELSE interval '30 days'
    END;

    -- Build comprehensive analytics object
    result := jsonb_build_object(
        'overview', jsonb_build_object(
            'totalQuizzes', (
                SELECT count(*)
                FROM quiz_sessions
                WHERE completed_at > now() - interval_value
                AND is_completed = true
            ),
            'avgCompletionTime', (
                SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60), 0)
                FROM quiz_sessions
                WHERE completed_at IS NOT NULL
                AND completed_at > now() - interval_value
                AND is_completed = true
            ),
            'avgScore', (
                SELECT COALESCE(AVG(total_weighted), 0)
                FROM quiz_results_weighted qr
                JOIN quiz_sessions qs ON qr.session_id = qs.id
                WHERE qs.created_at > now() - interval_value
                AND qs.is_completed = true
            ),
            'completionRate', (
                SELECT CASE
                    WHEN count(*) > 0 THEN
                        (count(*) FILTER (WHERE is_completed = true)::NUMERIC / count(*)) * 100
                    ELSE 0
                END
                FROM quiz_sessions
                WHERE created_at > now() - interval_value
            ),
            'returningUsers', (
                SELECT CASE
                    WHEN count(DISTINCT user_id) > 0 THEN
                        (count(DISTINCT user_id) FILTER (WHERE quiz_count > 1)::NUMERIC / count(DISTINCT user_id)) * 100
                    ELSE 0
                END
                FROM (
                    SELECT user_id, count(*) as quiz_count
                    FROM quiz_sessions
                    WHERE created_at > now() - interval_value
                    GROUP BY user_id
                ) user_quiz_counts
            ),
            'mobileUsers', (
                SELECT CASE
                    WHEN count(*) > 0 THEN
                        (count(*) FILTER (WHERE metadata->>'device' = 'mobile')::NUMERIC / count(*)) * 100
                    ELSE 0
                END
                FROM quiz_sessions
                WHERE created_at > now() - interval_value
            )
        ),
        'giftDistribution', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'giftKey', gift,
                    'count', gift_count,
                    'percentage', CASE
                        WHEN total_count > 0 THEN (gift_count::NUMERIC / total_count) * 100
                        ELSE 0
                    END
                )
            ), '[]'::jsonb)
            FROM (
                SELECT
                    qr.gift,
                    count(*) as gift_count,
                    (
                        SELECT count(*)
                        FROM quiz_results_weighted qr2
                        JOIN quiz_sessions qs2 ON qr2.session_id = qs2.id
                        WHERE qs2.created_at > now() - interval_value
                        AND qs2.is_completed = true
                    ) as total_count
                FROM quiz_results_weighted qr
                JOIN quiz_sessions qs ON qr.session_id = qs.id
                WHERE qs.created_at > now() - interval_value
                AND qs.is_completed = true
                GROUP BY qr.gift
            ) gift_stats
        ),
        'timeline', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'date', day::text,
                    'count', quiz_count
                )
                ORDER BY day DESC
            ), '[]'::jsonb)
            FROM (
                SELECT
                    date_trunc('day', created_at)::date as day,
                    count(*) as quiz_count
                FROM quiz_sessions
                WHERE created_at > now() - interval_value
                AND is_completed = true
                GROUP BY day
            ) daily_stats
        )
    );

    RETURN result;
END;
$$;

-- Update get_admin_stats to use correct column names
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
        (SELECT count(*) FROM auth.users),
        (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '30 days'),
        (SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'),
        (SELECT count(*) FROM auth.users WHERE created_at > date_trunc('month', now())),
        (SELECT count(*) FROM quiz_sessions WHERE is_completed = true),
        (SELECT count(*) FROM quiz_sessions WHERE is_completed = true AND completed_at > date_trunc('day', now())),
        (SELECT COALESCE(AVG(total_weighted), 0) FROM quiz_results_weighted qr JOIN quiz_sessions qs ON qr.session_id = qs.id WHERE qs.is_completed = true),
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
