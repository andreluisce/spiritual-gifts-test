-- Admin analytics helpers: recent activity and gift distribution
DROP FUNCTION IF EXISTS public.get_recent_activity(INTEGER);
DROP FUNCTION IF EXISTS public.get_gift_distribution();

CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    activity_data JSON;
BEGIN
    IF NOT public.is_user_admin_safe() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    SELECT json_agg(activity_row)
    INTO activity_data
    FROM (
        SELECT json_build_object(
            'id', ('quiz-' || qs.id::text),
            'user_email', COALESCE(u.email::TEXT, 'Unknown'),
            'user_name', COALESCE(
                (u.raw_user_meta_data->>'name')::TEXT,
                (u.raw_user_meta_data->>'full_name')::TEXT,
                split_part(u.email, '@', 1)::TEXT,
                'Unknown'
            ),
            'action', CASE 
                WHEN qs.is_completed THEN 'Completed quiz'
                ELSE 'Started quiz'
            END,
            'type', 'quiz',
            'created_at', COALESCE(qs.completed_at, qs.created_at)
        ) as activity_row
        FROM public.quiz_sessions qs
        LEFT JOIN auth.users u ON u.id = qs.user_id
        ORDER BY COALESCE(qs.completed_at, qs.created_at) DESC
        LIMIT limit_count
    ) sub;
    
    RETURN COALESCE(activity_data, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_gift_distribution()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    distribution_data JSON;
    total_count INTEGER;
BEGIN
    IF NOT public.is_user_admin_safe() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    SELECT COUNT(*) INTO total_count
    FROM public.quiz_sessions
    WHERE is_completed = true;

    SELECT json_agg(
        json_build_object(
            'gift_id', gift_id,
            'gift_name', gift_name,
            'count', gift_count,
            'percentage', percentage
        )
    ) INTO distribution_data
    FROM (
        WITH gift_counts AS (
            SELECT 
                qr.gift,
                COUNT(*) as gift_count
            FROM quiz_results_weighted qr
            JOIN quiz_sessions qs ON qs.id = qr.session_id
            WHERE qs.is_completed = true
            GROUP BY qr.gift
        )
        SELECT
            ROW_NUMBER() OVER (ORDER BY gift_count DESC) as gift_id,
            CASE 
                WHEN gift = 'A_PROPHECY' THEN 'Profecia'
                WHEN gift = 'B_SERVICE' THEN 'Serviço'
                WHEN gift = 'C_TEACHING' THEN 'Ensino'
                WHEN gift = 'D_EXHORTATION' THEN 'Exortação'
                WHEN gift = 'E_GIVING' THEN 'Contribuição'
                WHEN gift = 'F_LEADERSHIP' THEN 'Liderança'
                WHEN gift = 'G_MERCY' THEN 'Misericórdia'
                ELSE gift::TEXT
            END as gift_name,
            gift_count,
            CASE 
                WHEN total_count > 0 THEN ROUND((gift_count::NUMERIC / total_count * 100), 1)
                ELSE 0
            END as percentage
        FROM gift_counts
        ORDER BY gift_count DESC
    ) gift_stats;
    
    RETURN COALESCE(distribution_data, '[]'::JSON);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_distribution() TO authenticated;
