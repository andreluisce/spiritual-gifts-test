-- Fix ambiguous column reference in get_demographics_analytics
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
                    'range', gad.age_range,
                    'count', gad.user_count,
                    'percentage', gad.percentage
                )
            ), '[]'::jsonb)
            FROM get_age_demographics() gad
        ),
        'geographicDistribution', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'country', ggd.country,
                    'state', ggd.state_province,
                    'city', ggd.city,
                    'count', ggd.user_count,
                    'percentage', ggd.percentage
                )
            ), '[]'::jsonb)
            FROM get_geographic_demographics() ggd
        )
    );

    RETURN result;
END;
$$;

COMMENT ON FUNCTION get_demographics_analytics() IS 'Returns comprehensive demographics analytics with real data';
