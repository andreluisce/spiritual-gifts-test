-- Fix get_gift_distribution return type mismatch
-- The spiritual_gifts.name column is VARCHAR but the function expects TEXT

CREATE OR REPLACE FUNCTION public.get_gift_distribution(p_locale TEXT DEFAULT 'pt')
RETURNS TABLE (
    gift_id INTEGER,
    gift_name TEXT,
    gift_key TEXT,
    count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_users BIGINT;
BEGIN
    -- Count total users with completed quizzes
    SELECT COUNT(DISTINCT qs.user_id) INTO total_users
    FROM quiz_sessions qs
    WHERE qs.is_completed = true;

    -- For each completed session, find the TOP GIFT (highest score)
    -- Then count how many times each gift is the top gift
    RETURN QUERY
    WITH user_top_gifts AS (
        -- For each completed session, get the gift with highest score
        SELECT DISTINCT ON (qrw.session_id)
            qs.user_id,
            qrw.gift,
            qrw.total_weighted as score
        FROM quiz_results_weighted qrw
        INNER JOIN quiz_sessions qs ON qs.id = qrw.session_id
        WHERE qs.is_completed = true
        ORDER BY qrw.session_id, qrw.total_weighted DESC
    ),
    gift_counts AS (
        -- Count how many users have each gift as their top gift
        SELECT
            utg.gift as gift_key,
            COUNT(*) as gift_count
        FROM user_top_gifts utg
        GROUP BY utg.gift
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY gc.gift_count DESC)::INTEGER as gift_id,
        COALESCE(sg.name::TEXT, gc.gift_key::TEXT) as gift_name,  -- Cast VARCHAR to TEXT
        gc.gift_key::TEXT as gift_key,
        gc.gift_count as count,
        CASE
            WHEN total_users > 0 THEN ROUND((gc.gift_count::NUMERIC / total_users) * 100, 1)
            ELSE 0
        END as percentage
    FROM gift_counts gc
    LEFT JOIN public.spiritual_gifts sg ON sg.gift_key = gc.gift_key AND sg.locale = p_locale
    ORDER BY gc.gift_count DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_gift_distribution(TEXT) TO authenticated;
