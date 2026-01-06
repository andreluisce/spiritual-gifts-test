-- Fix get_user_quiz_results to properly calculate scores from answers table
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
SET search_path = public
AS $$
BEGIN
  -- Check if requester is admin
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
      (
        SELECT SUM(a.score::numeric)
        FROM answers a
        WHERE a.session_id = qs.id
      ),
      0
    ) as total_score,
    -- Aggregate scores by gift
    (
      SELECT jsonb_object_agg(
        gift_key,
        jsonb_build_object('score', total_gift_score)
      )
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
    -- Get top 3 gifts
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'gift_id', row_number,
          'gift_name', gift_name,
          'score', gift_score
        ) ORDER BY gift_score DESC
      )
      FROM (
        SELECT
          ROW_NUMBER() OVER (ORDER BY SUM(a.score * qp.default_weight) DESC) as row_number,
          COALESCE(
            (SELECT name_pt FROM spiritual_gifts WHERE key = qp.gift),
            qp.gift::text
          ) as gift_name,
          SUM(a.score * qp.default_weight) as gift_score
        FROM answers a
        INNER JOIN question_pool qp ON qp.id = a.pool_question_id
        WHERE a.session_id = qs.id
        GROUP BY qp.gift
        ORDER BY gift_score DESC
        LIMIT 3
      ) top_3
    ) as top_gifts
  FROM quiz_sessions qs
  WHERE qs.user_id = p_user_id
  ORDER BY qs.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_quiz_results IS 'Admin function to view all quiz attempts and calculated results for a specific user';

-- Also fix get_quiz_session_details
DROP FUNCTION IF EXISTS public.get_quiz_session_details(uuid);

CREATE OR REPLACE FUNCTION public.get_quiz_session_details(p_session_id UUID)
RETURNS TABLE (
  session_id uuid,
  user_id uuid,
  user_email text,
  user_name text,
  started_at timestamptz,
  completed_at timestamptz,
  is_completed boolean,
  total_score numeric,
  answers_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if requester is admin
  IF NOT public.is_user_admin_safe() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    qs.id as session_id,
    qs.user_id,
    COALESCE(u.email, '') as user_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email, '') as user_name,
    qs.created_at as started_at,
    qs.completed_at,
    qs.is_completed,
    COALESCE(
      (SELECT SUM(score::numeric) FROM answers WHERE session_id = qs.id),
      0
    ) as total_score,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_id', a.question_id,
          'pool_question_id', a.pool_question_id,
          'score', a.score,
          'gift', qp.gift::text,
          'created_at', a.created_at
        ) ORDER BY a.created_at
      )
      FROM answers a
      LEFT JOIN question_pool qp ON qp.id = a.pool_question_id
      WHERE a.session_id = qs.id
    ) as answers_data
  FROM quiz_sessions qs
  LEFT JOIN auth.users u ON u.id = qs.user_id
  WHERE qs.id = p_session_id;
END;
$$;

COMMENT ON FUNCTION public.get_quiz_session_details IS 'Admin function to view detailed information about a specific quiz session';
