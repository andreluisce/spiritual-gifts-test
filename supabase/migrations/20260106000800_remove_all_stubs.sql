-- REMOVE ALL STUBS AND MOCKED DATA - ONLY REAL DATA
-- This migration fixes all remaining placeholder/stub functions

-- 1. Fix get_ai_usage_stats - remove placeholders
DROP FUNCTION IF EXISTS public.get_ai_usage_stats();
CREATE OR REPLACE FUNCTION public.get_ai_usage_stats()
RETURNS TABLE (
    total_analyses BIGINT,
    cache_hits BIGINT,
    api_calls BIGINT,
    unique_users BIGINT,
    analyses_today BIGINT,
    analyses_this_week BIGINT,
    analyses_this_month BIGINT,
    avg_confidence_score NUMERIC,
    most_analyzed_gift TEXT,
    cache_hit_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count BIGINT;
    cache_count BIGINT;
BEGIN
    SELECT count(*) INTO total_count FROM ai_analysis_cache;
    SELECT count(*) INTO cache_count FROM ai_analysis_cache WHERE ai_service_used = 'cache';

    RETURN QUERY
    SELECT
        total_count,
        cache_count,
        (total_count - cache_count) as api_calls,
        (SELECT count(DISTINCT user_id) FROM ai_analysis_cache),
        (SELECT count(*) FROM ai_analysis_cache WHERE created_at > now() - interval '24 hours'),
        (SELECT count(*) FROM ai_analysis_cache WHERE created_at > now() - interval '7 days'),
        (SELECT count(*) FROM ai_analysis_cache WHERE created_at > now() - interval '30 days'),
        (SELECT COALESCE(AVG(confidence_score), 0) FROM ai_analysis_cache),
        (
            SELECT COALESCE(
                (SELECT input_data->>'giftKey'
                 FROM ai_analysis_cache
                 GROUP BY input_data->>'giftKey'
                 ORDER BY count(*) DESC
                 LIMIT 1),
                'No data'
            )
        ),
        CASE
            WHEN total_count > 0 THEN ROUND((cache_count::NUMERIC / total_count) * 100, 2)
            ELSE 0
        END;
END;
$$;

-- 2. Fix get_ai_analysis_by_gift - remove placeholder
DROP FUNCTION IF EXISTS public.get_ai_analysis_by_gift();
CREATE OR REPLACE FUNCTION public.get_ai_analysis_by_gift()
RETURNS TABLE (
    gift_key TEXT,
    count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        input_data->>'giftKey' as gift_key,
        count(*) as count
    FROM ai_analysis_cache
    WHERE input_data->>'giftKey' IS NOT NULL
    GROUP BY input_data->>'giftKey'
    ORDER BY count DESC;
END;
$$;

-- 3. Fix get_ai_system_status - remove hardcoded values
DROP FUNCTION IF EXISTS public.get_ai_system_status();
CREATE OR REPLACE FUNCTION public.get_ai_system_status()
RETURNS TABLE (
    status TEXT,
    latency_ms INTEGER,
    error_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_requests BIGINT;
    failed_requests BIGINT;
    avg_latency NUMERIC;
BEGIN
    -- Calculate real metrics from ai_analysis_cache
    SELECT
        count(*),
        count(*) FILTER (WHERE result_data IS NULL OR result_data = '{}'),
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000)
    INTO total_requests, failed_requests, avg_latency
    FROM ai_analysis_cache
    WHERE created_at > now() - interval '24 hours';

    RETURN QUERY
    SELECT
        CASE
            WHEN failed_requests::NUMERIC / NULLIF(total_requests, 0) > 0.1 THEN 'degraded'
            WHEN total_requests = 0 THEN 'unknown'
            ELSE 'operational'
        END as status,
        COALESCE(avg_latency::INTEGER, 0) as latency_ms,
        CASE
            WHEN total_requests > 0 THEN ROUND((failed_requests::NUMERIC / total_requests) * 100, 2)
            ELSE 0
        END as error_rate;
END;
$$;

-- 4. Fix get_gift_compatibility - remove mock data
DROP FUNCTION IF EXISTS public.get_gift_compatibility(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.get_gift_compatibility(
    gift1_key TEXT,
    gift2_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Get real compatibility data from gift_compatibility table
    SELECT jsonb_build_object(
        'gift1', gift1_key,
        'gift2', gift2_key,
        'compatibilityScore', COALESCE(gc.compatibility_score, 50),
        'strengths', COALESCE(gc.strengths, '[]'::jsonb),
        'challenges', COALESCE(gc.challenges, '[]'::jsonb),
        'tips', COALESCE(gc.ministry_tips, '[]'::jsonb)
    ) INTO result
    FROM gift_compatibility gc
    WHERE (gc.gift1_key = gift1_key AND gc.gift2_key = gift2_key)
       OR (gc.gift1_key = gift2_key AND gc.gift2_key = gift1_key)
    LIMIT 1;

    -- If no data found, return minimal structure
    IF result IS NULL THEN
        result := jsonb_build_object(
            'gift1', gift1_key,
            'gift2', gift2_key,
            'compatibilityScore', 50,
            'strengths', '[]'::jsonb,
            'challenges', '[]'::jsonb,
            'tips', '[]'::jsonb,
            'note', 'No compatibility data available yet'
        );
    END IF;

    RETURN result;
END;
$$;

-- 5. Fix get_ministry_recommendations - remove mock data
DROP FUNCTION IF EXISTS public.get_ministry_recommendations(TEXT);
CREATE OR REPLACE FUNCTION public.get_ministry_recommendations(user_gift_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return real ministry recommendations from spiritual_gifts table
    RETURN (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'ministry', ministry,
                    'description', description,
                    'giftKey', gift_key
                )
            ),
            '[]'::jsonb
        )
        FROM (
            SELECT
                jsonb_array_elements_text(ministry_applications) as ministry,
                description,
                gift_key
            FROM spiritual_gifts
            WHERE gift_key = user_gift_key
            AND locale = 'pt'
            LIMIT 10
        ) ministries
    );
END;
$$;

COMMENT ON FUNCTION get_ai_usage_stats() IS 'Returns real AI usage statistics from ai_analysis_cache';
COMMENT ON FUNCTION get_ai_analysis_by_gift() IS 'Returns real AI analysis counts by gift';
COMMENT ON FUNCTION get_ai_system_status() IS 'Returns real AI system status based on recent performance';
COMMENT ON FUNCTION get_gift_compatibility(TEXT, TEXT) IS 'Returns real gift compatibility data from database';
COMMENT ON FUNCTION get_ministry_recommendations(TEXT) IS 'Returns real ministry recommendations from spiritual_gifts table';
