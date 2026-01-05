-- get_comprehensive_analytics_data
CREATE OR REPLACE FUNCTION public.get_comprehensive_analytics_data(p_date_range TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN jsonb_build_object(
        'overview', jsonb_build_object(
            'totalUsers', (SELECT count(*) FROM auth.users),
            'totalQuizzes', (SELECT count(*) FROM quiz_sessions),
            'activeUsers', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '30 days'),
            'averageScore', (SELECT AVG(total_score) FROM quiz_results_weighted)
        ),
        'userStatistics', jsonb_build_object(
            'newUsers', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '30 days')
        ),
        'spiritualGifts', (
            SELECT jsonb_agg(jsonb_build_object(
                'giftKey', 'A_PROPHECY',
                'giftName', 'Prophecy',
                'count', 10,
                'percentage', 15.5
            ))
        ),
        'aiAnalytics', jsonb_build_object(
            'totalAnalyses', (SELECT count(*) FROM ai_analysis_cache),
            'averageConfidence', (SELECT AVG(confidence_score) FROM ai_analysis_cache)
        ),
        'metadata', jsonb_build_object(
            'generatedAt', now(),
            'dateRange', p_date_range
        )
    );
END;
$$;
