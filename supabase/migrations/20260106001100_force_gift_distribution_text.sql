-- Fix 1: Force complete replacement of get_gift_distribution with proper TEXT casting
DROP FUNCTION IF EXISTS public.get_gift_distribution() CASCADE;

CREATE OR REPLACE FUNCTION public.get_gift_distribution()
RETURNS TABLE (
    gift_id INTEGER,
    gift_name TEXT,
    count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_results BIGINT;
BEGIN
    -- Get total quiz results
    SELECT count(*) INTO total_results
    FROM quiz_results_weighted qr
    JOIN quiz_sessions qs ON qr.session_id = qs.id
    WHERE qs.is_completed = true;

    -- Return gift distribution with proper TEXT casting
    RETURN QUERY
    WITH gift_counts AS (
        SELECT
            qr.gift::TEXT as gift_text,
            count(*) as gift_count
        FROM quiz_results_weighted qr
        JOIN quiz_sessions qs ON qr.session_id = qs.id
        WHERE qs.is_completed = true
        GROUP BY qr.gift::TEXT
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY gc.gift_count DESC)::INTEGER as gift_id,
        CASE gc.gift_text
            WHEN 'A_PROPHECY' THEN 'Prophecy'
            WHEN 'B_SERVICE' THEN 'Service'
            WHEN 'C_TEACHING' THEN 'Teaching'
            WHEN 'D_EXHORTATION' THEN 'Exhortation'
            WHEN 'E_GIVING' THEN 'Giving'
            WHEN 'F_LEADERSHIP' THEN 'Leadership'
            WHEN 'G_MERCY' THEN 'Mercy'
            ELSE gc.gift_text
        END::TEXT as gift_name,
        gc.gift_count as count,
        CASE
            WHEN total_results > 0 THEN ROUND((gc.gift_count::NUMERIC / total_results) * 100, 1)
            ELSE 0
        END as percentage
    FROM gift_counts gc
    ORDER BY gc.gift_count DESC;
END;
$$;

COMMENT ON FUNCTION get_gift_distribution() IS 'Returns real spiritual gift distribution from quiz results with TEXT names';

-- Fix 2: Fix ambiguous column reference in get_geographic_demographics
DROP FUNCTION IF EXISTS public.get_geographic_demographics() CASCADE;

CREATE OR REPLACE FUNCTION public.get_geographic_demographics()
RETURNS TABLE (
    country TEXT,
    state_province TEXT,
    city TEXT,
    user_count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users_with_location BIGINT;
BEGIN
    -- Get total users with location data (fully qualified column reference)
    SELECT count(*) INTO total_users_with_location
    FROM user_demographics ud
    WHERE ud.country IS NOT NULL;

    -- Return geographic distribution with fully qualified column names
    RETURN QUERY
    SELECT
        ud.country,
        ud.region as state_province,
        ud.city,
        count(*)::BIGINT as user_count,
        CASE
            WHEN total_users_with_location > 0 THEN ROUND((count(*)::NUMERIC / total_users_with_location) * 100, 1)
            ELSE 0
        END as percentage
    FROM user_demographics ud
    WHERE ud.country IS NOT NULL
    GROUP BY ud.country, ud.region, ud.city
    ORDER BY user_count DESC
    LIMIT 10;
END;
$$;

COMMENT ON FUNCTION get_geographic_demographics() IS 'Returns real geographic distribution from user_demographics with qualified column references';
