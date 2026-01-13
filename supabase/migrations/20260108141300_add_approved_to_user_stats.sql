-- Update get_users_with_stats to include approved status from profiles
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
    status TEXT,
    approved BOOLEAN
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
        -- Get status from user metadata, default to 'active'
        COALESCE(
            u.raw_user_meta_data->>'status',
            u.raw_app_meta_data->>'status',
            'active'
        )::text as status,
        -- Get approved status from profiles, default to false
        COALESCE(p.approved, false) as approved
    FROM auth.users u
    LEFT JOIN profiles p ON p.id = u.id
    ORDER BY u.created_at DESC
    LIMIT 100;
END;
$$;

-- Update manager_get_users_with_stats as well
DROP FUNCTION IF EXISTS public.manager_get_users_with_stats();
CREATE OR REPLACE FUNCTION public.manager_get_users_with_stats()
RETURNS TABLE (
    id UUID,
    email VARCHAR, -- Masked
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    user_metadata JSONB,
    quiz_count BIGINT,
    avg_score NUMERIC,
    status TEXT,
    approved BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is manager or admin
    IF NOT (SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (role = 'manager' OR role = 'admin')
    ) OR (
        SELECT (raw_user_meta_data->>'role')::text = ANY(ARRAY['manager'::text, 'admin'::text])
        FROM auth.users
        WHERE id = auth.uid()
    )) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        -- Mask email: first 3 chars + *** + domain
        CASE
            WHEN position('@' in u.email) > 3 THEN
                substring(u.email from 1 for 3) || '***' || substring(u.email from position('@' in u.email))
            ELSE
                '***' || substring(u.email from position('@' in u.email))
        END::varchar as email,
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
        COALESCE(
            u.raw_user_meta_data->>'status',
            u.raw_app_meta_data->>'status',
            'active'
        )::text as status,
        COALESCE(p.approved, false) as approved
    FROM auth.users u
    LEFT JOIN profiles p ON p.id = u.id
    ORDER BY u.created_at DESC
    LIMIT 100;
END;
$$;
