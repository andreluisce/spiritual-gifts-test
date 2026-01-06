-- Fix all demographic and analytics functions to return real data

-- Fix get_age_demographics to return real data
DROP FUNCTION IF EXISTS public.get_age_demographics();
CREATE OR REPLACE FUNCTION public.get_age_demographics()
RETURNS TABLE (
    age_range TEXT,
    user_count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users_with_age BIGINT;
BEGIN
    -- Get total users with birth_year data
    SELECT count(*) INTO total_users_with_age
    FROM user_demographics
    WHERE birth_year IS NOT NULL;

    -- Return age distribution
    RETURN QUERY
    WITH age_groups AS (
        SELECT
            CASE
                WHEN (EXTRACT(YEAR FROM now()) - birth_year) < 18 THEN 'Under 18'
                WHEN (EXTRACT(YEAR FROM now()) - birth_year) BETWEEN 18 AND 24 THEN '18-24'
                WHEN (EXTRACT(YEAR FROM now()) - birth_year) BETWEEN 25 AND 34 THEN '25-34'
                WHEN (EXTRACT(YEAR FROM now()) - birth_year) BETWEEN 35 AND 44 THEN '35-44'
                WHEN (EXTRACT(YEAR FROM now()) - birth_year) BETWEEN 45 AND 54 THEN '45-54'
                WHEN (EXTRACT(YEAR FROM now()) - birth_year) BETWEEN 55 AND 64 THEN '55-64'
                ELSE '65+'
            END as age_range,
            count(*) as user_count
        FROM user_demographics
        WHERE birth_year IS NOT NULL
        GROUP BY age_range
    )
    SELECT
        ag.age_range,
        ag.user_count,
        CASE
            WHEN total_users_with_age > 0 THEN ROUND((ag.user_count::NUMERIC / total_users_with_age) * 100, 1)
            ELSE 0
        END as percentage
    FROM age_groups ag
    ORDER BY
        CASE ag.age_range
            WHEN 'Under 18' THEN 1
            WHEN '18-24' THEN 2
            WHEN '25-34' THEN 3
            WHEN '35-44' THEN 4
            WHEN '45-54' THEN 5
            WHEN '55-64' THEN 6
            WHEN '65+' THEN 7
        END;
END;
$$;

-- Fix get_geographic_demographics to return real data
DROP FUNCTION IF EXISTS public.get_geographic_demographics();
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
    -- Get total users with location data
    SELECT count(*) INTO total_users_with_location
    FROM user_demographics
    WHERE country IS NOT NULL;

    -- Return geographic distribution
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

-- Fix get_demographics_analytics to return real data
DROP FUNCTION IF EXISTS public.get_demographics_analytics();
CREATE OR REPLACE FUNCTION public.get_demographics_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_users BIGINT;
    users_with_data BIGINT;
    result JSONB;
BEGIN
    -- Get counts
    SELECT count(*) INTO total_users FROM auth.users;
    SELECT count(*) INTO users_with_data FROM user_demographics;

    -- Build result
    result := jsonb_build_object(
        'totalUsers', total_users,
        'usersWithData', users_with_data,
        'completionRate', CASE
            WHEN total_users > 0 THEN ROUND((users_with_data::NUMERIC / total_users) * 100, 1)
            ELSE 0
        END,
        'ageDistribution', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'range', age_range,
                    'count', user_count,
                    'percentage', percentage
                )
            ), '[]'::jsonb)
            FROM get_age_demographics()
        ),
        'geographicDistribution', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'country', country,
                    'state', state_province,
                    'city', city,
                    'count', user_count,
                    'percentage', percentage
                )
            ), '[]'::jsonb)
            FROM get_geographic_demographics()
        )
    );

    RETURN result;
END;
$$;

-- Fix get_gift_distribution to return real data
DROP FUNCTION IF EXISTS public.get_gift_distribution();
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

    -- Return gift distribution
    RETURN QUERY
    WITH gift_counts AS (
        SELECT
            qr.gift,
            count(*) as gift_count
        FROM quiz_results_weighted qr
        JOIN quiz_sessions qs ON qr.session_id = qs.id
        WHERE qs.is_completed = true
        GROUP BY qr.gift
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY gc.gift_count DESC)::INTEGER as gift_id,
        CASE gc.gift
            WHEN 'A_PROPHECY' THEN 'Prophecy'
            WHEN 'B_SERVICE' THEN 'Service'
            WHEN 'C_TEACHING' THEN 'Teaching'
            WHEN 'D_EXHORTATION' THEN 'Exhortation'
            WHEN 'E_GIVING' THEN 'Giving'
            WHEN 'F_LEADERSHIP' THEN 'Leadership'
            WHEN 'G_MERCY' THEN 'Mercy'
            ELSE gc.gift
        END as gift_name,
        gc.gift_count as count,
        CASE
            WHEN total_results > 0 THEN ROUND((gc.gift_count::NUMERIC / total_results) * 100, 1)
            ELSE 0
        END as percentage
    FROM gift_counts gc
    ORDER BY gc.gift_count DESC;
END;
$$;

COMMENT ON FUNCTION get_age_demographics IS 'Returns real age distribution from user_demographics table';
COMMENT ON FUNCTION get_geographic_demographics IS 'Returns real geographic distribution from user_demographics table';
COMMENT ON FUNCTION get_demographics_analytics IS 'Returns comprehensive demographics analytics with real data';
COMMENT ON FUNCTION get_gift_distribution IS 'Returns real spiritual gift distribution from quiz results';
