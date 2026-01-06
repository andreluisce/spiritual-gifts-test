-- Fix column name in get_user_quiz_results function
-- The spiritual_gifts table has 'name' column, not 'name_pt'

DROP FUNCTION IF EXISTS public.get_user_quiz_results(uuid);

CREATE OR REPLACE FUNCTION public.get_user_quiz_results(p_user_id UUID)
RETURNS TABLE (
    session_id uuid,
    started_at timestamptz,
    completed_at timestamptz,
    is_completed boolean,
    total_score numeric,
    gift_results jsonb,
    top_gifts jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Check if user is admin
    IF NOT public.is_user_admin_safe() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
      qs.id as session_id,
      qs.created_at as started_at,
      qs.completed_at,
      qs.is_completed,
      -- Calculate total score from all answers
      COALESCE(
        (SELECT SUM(a.score::numeric)
         FROM answers a
         WHERE a.session_id = qs.id),
        0
      ) as total_score,
      -- Aggregate scores by gift using answer scores and question weights
      (SELECT jsonb_object_agg(gift_key, jsonb_build_object('score', total_gift_score))
       FROM (
         SELECT
           qp.gift::text as gift_key,
           SUM(a.score * qp.default_weight) as total_gift_score
         FROM answers a
         INNER JOIN question_pool qp ON qp.id = a.pool_question_id
         WHERE a.session_id = qs.id
         GROUP BY qp.gift
       ) gift_scores
      ) as gift_results,
      -- Get top 3 gifts with names
      (SELECT jsonb_agg(
          jsonb_build_object(
            'gift_id', ROW_NUMBER() OVER (ORDER BY total_weighted DESC),
            'gift_name', gift_name,
            'score', total_weighted
          )
        )
        FROM (
          SELECT
            qrw.gift,
            qrw.total_weighted,
            -- Map gift enum to display name using CASE statement
            CASE qrw.gift
              WHEN 'A_PROPHECY' THEN 'Prophecy'
              WHEN 'B_SERVICE' THEN 'Service'
              WHEN 'C_TEACHING' THEN 'Teaching'
              WHEN 'D_EXHORTATION' THEN 'Exhortation'
              WHEN 'E_GIVING' THEN 'Giving'
              WHEN 'F_LEADERSHIP' THEN 'Leadership'
              WHEN 'G_MERCY' THEN 'Mercy'
              ELSE qrw.gift::text
            END as gift_name
          FROM quiz_results_weighted qrw
          WHERE qrw.session_id = qs.id
          ORDER BY qrw.total_weighted DESC
          LIMIT 3
        ) top_3_gifts
      ) as top_gifts
    FROM quiz_sessions qs
    WHERE qs.user_id = p_user_id
    ORDER BY qs.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_quiz_results IS 'Returns all quiz results for a specific user (admin only) - uses CASE statement for gift names instead of spiritual_gifts table';
