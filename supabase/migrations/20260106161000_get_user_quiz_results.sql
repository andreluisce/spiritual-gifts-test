-- Create function for admin to view all quiz results for a specific user
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
    COALESCE(
      (
        SELECT SUM((value->'score')::numeric)
        FROM jsonb_each(qs.results)
      ),
      0
    ) as total_score,
    qs.results as gift_results,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'gift_id', gift_id,
          'gift_name', gift_name,
          'score', score
        ) ORDER BY score DESC
      )
      FROM (
        SELECT
          (key)::integer as gift_id,
          COALESCE(g.name_pt, key) as gift_name,
          (value->>'score')::numeric as score
        FROM jsonb_each(qs.results) je
        LEFT JOIN spiritual_gifts g ON g.id = (je.key)::integer
        ORDER BY (value->>'score')::numeric DESC
        LIMIT 3
      ) top_3
    ) as top_gifts
  FROM quiz_sessions qs
  WHERE qs.user_id = p_user_id
  ORDER BY qs.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_quiz_results IS 'Admin function to view all quiz attempts and results for a specific user';

-- Create function to get detailed quiz session with all answers
CREATE OR REPLACE FUNCTION public.get_quiz_session_details(p_session_id UUID)
RETURNS TABLE (
  session_id uuid,
  user_id uuid,
  user_email text,
  user_name text,
  started_at timestamptz,
  completed_at timestamptz,
  is_completed boolean,
  results jsonb,
  answers jsonb
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
    qs.results,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'question_id', qa.question_id,
          'answer_value', qa.answer_value,
          'created_at', qa.created_at
        ) ORDER BY qa.created_at
      )
      FROM quiz_answers qa
      WHERE qa.session_id = qs.id
    ) as answers
  FROM quiz_sessions qs
  LEFT JOIN auth.users u ON u.id = qs.user_id
  WHERE qs.id = p_session_id;
END;
$$;

COMMENT ON FUNCTION public.get_quiz_session_details IS 'Admin function to view detailed information about a specific quiz session including all answers';
