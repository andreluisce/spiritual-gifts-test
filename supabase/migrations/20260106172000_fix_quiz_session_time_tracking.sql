-- Fix quiz session time tracking
-- Problem: created_at and completed_at are the same, making average time = 0
-- Solution: Create sessions when quiz starts, update when completed

-- 1. Create function to start a quiz session
CREATE OR REPLACE FUNCTION public.start_quiz_session(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Generate new session ID
    v_session_id := gen_random_uuid();

    -- Create incomplete session with current timestamp as created_at
    INSERT INTO quiz_sessions (
        id,
        user_id,
        is_completed,
        created_at
    ) VALUES (
        v_session_id,
        p_user_id,
        false,
        now()
    );

    RETURN v_session_id;
END;
$$;

-- 2. Update submit_complete_quiz to accept optional session_id
-- If session_id provided, update existing session
-- If not provided, create new one (backwards compatibility)
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
  -- If session_id provided, use it; otherwise create new one
  IF p_session_id IS NOT NULL THEN
    -- Check if session exists and belongs to user
    SELECT EXISTS(
      SELECT 1 FROM quiz_sessions
      WHERE id = p_session_id AND user_id = p_user_id
    ) INTO v_session_exists;

    IF NOT v_session_exists THEN
      RAISE EXCEPTION 'Invalid session_id or session does not belong to user';
    END IF;

    new_session_id := p_session_id;

    -- Update existing session to completed
    UPDATE quiz_sessions
    SET
      is_completed = true,
      completed_at = completion_time
    WHERE id = new_session_id;
  ELSE
    -- Backwards compatibility: create new session with both timestamps
    new_session_id := gen_random_uuid();

    INSERT INTO quiz_sessions (
      id, user_id, is_completed, completed_at, created_at
    ) VALUES (
      new_session_id, p_user_id, true, completion_time, completion_time
    );
  END IF;

  -- Inserir respostas do JSONB
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

  -- Calcular e retornar resultados
  RETURN QUERY
  WITH quiz_results AS (
    -- Usar função existente de cálculo
    SELECT * FROM calculate_quiz_result(new_session_id)
  ),
  gift_names AS (
    -- Buscar nomes dos gifts em português
    SELECT
      qr.gift,
      qr.total_weighted,
      COALESCE(sg.name, qr.gift::text) as gift_name
    FROM quiz_results qr
    LEFT JOIN spiritual_gifts sg ON sg.gift_key = qr.gift
    WHERE sg.locale = 'pt' OR sg.locale IS NULL
  ),
  top_5_gifts AS (
    -- Selecionar top 5 gifts
    SELECT
      gn.gift,
      gn.gift_name,
      gn.total_weighted,
      ROW_NUMBER() OVER (ORDER BY gn.total_weighted DESC) as rank
    FROM gift_names gn
    ORDER BY gn.total_weighted DESC
    LIMIT 5
  ),
  aggregated_results AS (
    -- Agregar resultados em arrays e JSON
    SELECT
      new_session_id as session_id,
      array_agg(tg.gift::text ORDER BY tg.rank)::text[] as top_gifts_keys,
      array_agg(tg.gift_name ORDER BY tg.rank)::text[] as top_gifts_names,
      jsonb_object_agg(
        tg.gift::text,
        jsonb_build_object(
          'score', tg.total_weighted,
          'rank', tg.rank
        ) ORDER BY tg.rank
      ) as total_scores,
      completion_time as completed_at
    FROM top_5_gifts tg
  )
  SELECT * FROM aggregated_results;
END;
$$;

COMMENT ON FUNCTION public.start_quiz_session IS 'Creates a new quiz session when user starts the quiz - tracks created_at timestamp';
COMMENT ON FUNCTION public.submit_complete_quiz IS 'Completes quiz session and calculates results - accepts optional session_id to update existing session with proper time tracking';
