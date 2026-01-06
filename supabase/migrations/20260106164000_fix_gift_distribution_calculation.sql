-- Fix get_gift_distribution to show ONLY the top gift for each user
-- Previously counted ALL answers, now counts how many users have each gift as their TOP 1

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
            utg.gift::TEXT as gift_text,
            COUNT(*) as gift_count
        FROM user_top_gifts utg
        GROUP BY utg.gift::TEXT
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
            WHEN total_users > 0 THEN ROUND((gc.gift_count::NUMERIC / total_users) * 100, 1)
            ELSE 0
        END as percentage
    FROM gift_counts gc
    ORDER BY gc.gift_count DESC;
END;
$$;

COMMENT ON FUNCTION public.get_gift_distribution IS 'Returns distribution of TOP spiritual gifts - counts how many users have each gift as their #1 (highest score)';
