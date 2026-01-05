-- =========================================================
-- FIX: submit_complete_quiz return type mismatch
-- Correção do cast de gift::text para text explicitamente
-- =========================================================

CREATE OR REPLACE FUNCTION public.submit_complete_quiz(
  p_user_id uuid,
  p_answers jsonb, -- Format: {"question_id": score, ...}
  p_quiz_id uuid DEFAULT NULL
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
AS $$
DECLARE
  new_session_id uuid;
  answer_record record;
  completion_time timestamptz;
BEGIN
  -- Gerar session ID e timestamp
  new_session_id := gen_random_uuid();
  completion_time := timezone('utc', now());

  -- Criar sessão do quiz
  INSERT INTO public.quiz_sessions (
    id, user_id, is_completed, completed_at, created_at
  ) VALUES (
    new_session_id, p_user_id, true, completion_time, completion_time
  );

  -- Inserir respostas do JSONB
  FOR answer_record IN
    SELECT
      key::bigint as question_id,
      value::integer as score
    FROM jsonb_each_text(p_answers)
  LOOP
    INSERT INTO public.answers (
      session_id, pool_question_id, score
    ) VALUES (
      new_session_id, answer_record.question_id, answer_record.score
    );
  END LOOP;

  -- Calcular e retornar resultados
  RETURN QUERY
  WITH quiz_results AS (
    -- Usar função existente de cálculo
    SELECT * FROM public.calculate_quiz_result(new_session_id)
  ),
  gift_names AS (
    -- Buscar nomes dos gifts em português
    SELECT
      qr.gift,
      qr.total_weighted,
      COALESCE(sg.name, qr.gift::text) as gift_name
    FROM quiz_results qr
    LEFT JOIN public.spiritual_gifts sg ON sg.gift_key = qr.gift
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
    -- FIX: Cast explícito para text[] ao invés de varchar[]
    SELECT
      array_agg(t5.gift::text::text ORDER BY t5.rank)::text[] as gift_keys,
      array_agg(t5.gift_name::text ORDER BY t5.rank)::text[] as gift_names,
      jsonb_object_agg(t5.gift::text, t5.total_weighted) as scores
    FROM top_5_gifts t5
  )
  -- Retorno final
  SELECT
    new_session_id,
    ar.gift_keys,
    ar.gift_names,
    ar.scores,
    completion_time
  FROM aggregated_results ar;
END;
$$;

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Função submit_complete_quiz corrigida - cast explícito para text[]';
END $$;
