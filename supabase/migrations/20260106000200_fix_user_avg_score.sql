-- Fix get_users_with_stats to calculate real average scores
DROP FUNCTION IF EXISTS public.get_users_with_stats();
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    user_metadata JSONB,
    quiz_count BIGINT,
    avg_score NUMERIC,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email::varchar,
        u.created_at,
        u.last_sign_in_at,
        u.raw_user_meta_data,
        (SELECT count(*) FROM quiz_sessions qs WHERE qs.user_id = u.id AND qs.is_completed = true)::bigint as quiz_count,
        COALESCE(
            (
                SELECT AVG(qr.total_weighted)
                FROM quiz_results_weighted qr
                JOIN quiz_sessions qs ON qr.session_id = qs.id
                WHERE qs.user_id = u.id
                AND qs.is_completed = true
            ),
            0.0
        )::numeric as avg_score,
        CASE
            WHEN u.last_sign_in_at > now() - interval '30 days' THEN 'active'
            WHEN u.last_sign_in_at IS NULL THEN 'never_logged_in'
            ELSE 'inactive'
        END::text as status
    FROM auth.users u
    ORDER BY u.created_at DESC
    LIMIT 100;
END;
$$;
