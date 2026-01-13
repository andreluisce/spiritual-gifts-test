-- Refresh submit_complete_quiz to match app signature (p_user_id, p_answers, p_session_id default NULL)
-- Fixes schema cache errors expecting different argument order.

DROP FUNCTION IF EXISTS public.submit_complete_quiz(uuid, jsonb, uuid);

CREATE OR REPLACE FUNCTION public.submit_complete_quiz(
  p_user_id uuid,
  p_answers jsonb, -- Format: {"question_id": score, ...}
  p_session_id uuid DEFAULT NULL  -- Optional: existing session to complete
)
RETURNS TABLE (
  session_id uuid,
  top_gifts_keys text[],
  top_gifts_names text[],
  total_scores jsonb,
  completed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_session_id uuid;
  completion_time timestamptz := now();
  answer_record RECORD;
  v_session_exists boolean;
BEGIN
  -- If session_id provided, update existing session; else create a completed one
  IF p_session_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM quiz_sessions
      WHERE id = p_session_id AND user_id = p_user_id
    ) INTO v_session_exists;

    IF NOT v_session_exists THEN
      RAISE EXCEPTION 'Invalid session_id or session does not belong to user';
    END IF;

    new_session_id := p_session_id;

    UPDATE quiz_sessions
    SET
      is_completed = true,
      completed_at = completion_time
    WHERE id = new_session_id;
  ELSE
    new_session_id := gen_random_uuid();

    INSERT INTO quiz_sessions (
      id, user_id, is_completed, completed_at, created_at
    ) VALUES (
      new_session_id, p_user_id, true, completion_time, completion_time
    );
  END IF;

  -- Insert answers
  FOR answer_record IN
    SELECT
      key::bigint as question_id,
      value::integer as score
    FROM jsonb_each_text(p_answers)
  LOOP
    INSERT INTO answers (
      session_id, pool_question_id, score
    ) VALUES (
      new_session_id, answer_record.question_id, answer_record.score
    );
  END LOOP;

  -- Return calculated results
  RETURN QUERY
  WITH quiz_results AS (
    SELECT * FROM calculate_quiz_result(new_session_id)
  ),
  gift_names AS (
    SELECT
      qr.gift,
      qr.total_weighted,
      COALESCE(sg.name, qr.gift::text) as gift_name
    FROM quiz_results qr
    LEFT JOIN spiritual_gifts sg ON sg.gift_key = qr.gift
  ),
  totals AS (
    SELECT jsonb_object_agg(gift, total_weighted) AS scores
    FROM quiz_results
  )
  SELECT
    new_session_id as session_id,
    ARRAY(
      SELECT gift
      FROM quiz_results
      ORDER BY total_weighted DESC
      LIMIT 3
    ) as top_gifts_keys,
    ARRAY(
      SELECT gift_name
      FROM gift_names
      ORDER BY total_weighted DESC
      LIMIT 3
    ) as top_gifts_names,
    (SELECT scores FROM totals) as total_scores,
    completion_time as completed_at;
END;
$$;

COMMENT ON FUNCTION public.submit_complete_quiz IS 'Completes quiz session and calculates results - accepts optional session_id to update existing session with proper time tracking';

REVOKE EXECUTE ON FUNCTION public.submit_complete_quiz(UUID, JSONB, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_complete_quiz(UUID, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_complete_quiz(UUID, JSONB, UUID) TO anon;
