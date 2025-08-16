-- ============================================================================
-- FIX ANALYTICS FUNCTION
-- ============================================================================
-- This file fixes the get_comprehensive_analytics_data function to work with the actual database schema

-- Drop and recreate the function with correct table structure
DROP FUNCTION IF EXISTS public.get_comprehensive_analytics_data(TEXT);

CREATE OR REPLACE FUNCTION public.get_comprehensive_analytics_data(p_date_range TEXT DEFAULT '30d')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    overview_stats JSONB;
    gift_distribution JSONB;
    ai_stats JSONB;
    user_stats JSONB;
    date_filter TIMESTAMP;
BEGIN
    -- Calculate date filter
    CASE p_date_range
        WHEN '7d' THEN date_filter := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN date_filter := NOW() - INTERVAL '30 days';
        WHEN '90d' THEN date_filter := NOW() - INTERVAL '90 days';
        WHEN '1y' THEN date_filter := NOW() - INTERVAL '1 year';
        ELSE date_filter := '1900-01-01'::TIMESTAMP;
    END CASE;

    -- Get overview statistics
    SELECT jsonb_build_object(
        'totalQuizzes', COUNT(DISTINCT qs.id),
        'totalUsers', COUNT(DISTINCT qs.user_id),
        'completedQuizzes', COUNT(DISTINCT CASE WHEN qs.is_completed = true THEN qs.id END),
        'averageScore', COALESCE(AVG(
            CASE WHEN qs.is_completed = true THEN 
                (SELECT AVG(a.score::DECIMAL) 
                 FROM answers a 
                 WHERE a.session_id = qs.id)
            END
        ), 0),
        'completionRate', 
        CASE 
            WHEN COUNT(qs.id) > 0 THEN 
                (COUNT(CASE WHEN qs.is_completed = true THEN 1 END)::DECIMAL / COUNT(qs.id)::DECIMAL) * 100
            ELSE 0
        END,
        'dateRange', p_date_range,
        'generatedAt', NOW()
    ) INTO overview_stats
    FROM public.quiz_sessions qs
    WHERE qs.created_at >= date_filter;

    -- Get spiritual gifts distribution
    SELECT jsonb_agg(
        jsonb_build_object(
            'giftKey', gift_data.gift,
            'giftName', gift_data.gift,
            'count', gift_data.count,
            'percentage', gift_data.percentage,
            'averageScore', gift_data.avg_score
        ) ORDER BY gift_data.count DESC
    ) INTO gift_distribution
    FROM (
        SELECT 
            qp.gift,
            COUNT(DISTINCT a.session_id) as count,
            (COUNT(DISTINCT a.session_id)::DECIMAL / 
             NULLIF((SELECT COUNT(DISTINCT session_id) 
                     FROM answers a2 
                     JOIN quiz_sessions qs2 ON a2.session_id = qs2.id 
                     WHERE qs2.is_completed = true AND qs2.created_at >= date_filter), 0)::DECIMAL
            ) * 100 as percentage,
            AVG(a.score::DECIMAL) as avg_score
        FROM public.answers a
        JOIN public.question_pool qp ON a.pool_question_id = qp.id
        JOIN public.quiz_sessions qs ON a.session_id = qs.id
        WHERE qs.is_completed = true 
        AND qs.created_at >= date_filter
        GROUP BY qp.gift
        HAVING COUNT(DISTINCT a.session_id) > 0
    ) as gift_data;

    -- Get AI analytics if available
    SELECT jsonb_build_object(
        'totalAnalyses', COUNT(*),
        'cacheHits', COUNT(CASE WHEN ai_service_used = 'client-ai' THEN 1 END),
        'apiCalls', COUNT(CASE WHEN ai_service_used != 'client-ai' THEN 1 END),
        'uniqueUsers', COUNT(DISTINCT user_id),
        'avgConfidence', COALESCE(AVG(confidence_score), 0)
    ) INTO ai_stats
    FROM public.ai_analysis_cache
    WHERE created_at >= date_filter;

    -- Get user statistics
    SELECT jsonb_build_object(
        'totalUsers', COUNT(*),
        'newUsers', COUNT(CASE WHEN created_at >= date_filter THEN 1 END),
        'activeUsers', COUNT(CASE 
            WHEN id IN (
                SELECT DISTINCT user_id 
                FROM public.quiz_sessions 
                WHERE created_at >= date_filter
            ) THEN 1 END
        )
    ) INTO user_stats
    FROM auth.users;

    -- Build final result
    result := jsonb_build_object(
        'overview', overview_stats,
        'spiritualGifts', COALESCE(gift_distribution, '[]'::jsonb),
        'aiAnalytics', COALESCE(ai_stats, '{}'::jsonb),
        'userStatistics', COALESCE(user_stats, '{}'::jsonb),
        'metadata', jsonb_build_object(
            'dateRange', p_date_range,
            'generatedAt', NOW(),
            'totalDataPoints', COALESCE(jsonb_array_length(gift_distribution), 0)
        )
    );

    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_comprehensive_analytics_data(TEXT) TO authenticated;

-- Test the function
SELECT 'Fixed analytics function - testing...' AS status;
SELECT public.get_comprehensive_analytics_data('30d');