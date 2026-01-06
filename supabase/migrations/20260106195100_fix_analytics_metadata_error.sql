-- Fix metadata column error in get_analytics_data
-- The quiz_sessions table doesn't have a metadata column, so we'll return 0 for mobileUsers

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
            'mobileUsers', 0  -- Return 0 since we don't track device type in quiz_sessions
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

COMMENT ON FUNCTION public.get_analytics_data IS 'Returns analytics data without metadata column dependency';
