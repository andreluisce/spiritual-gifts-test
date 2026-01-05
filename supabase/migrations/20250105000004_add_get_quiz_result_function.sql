-- =========================================================
-- ADD: get_quiz_result_by_id function with SECURITY DEFINER
-- Permite buscar resultados de quiz sem RLS restrictions
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_quiz_result_by_id(
  p_session_id uuid
)
RETURNS TABLE (
  session_id uuid,
  user_id uuid,
  created_at timestamptz,
  completed_at timestamptz,
  gift_key text,
  total_weighted numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retornar informações da sessão + cálculo de resultados
  RETURN QUERY
  SELECT
    qs.id as session_id,
    qs.user_id,
    qs.created_at,
    qs.completed_at,
    r.gift::text as gift_key,
    r.total_weighted
  FROM public.quiz_sessions qs
  CROSS JOIN LATERAL (
    SELECT * FROM public.calculate_quiz_result(qs.id)
  ) r
  WHERE qs.id = p_session_id
    AND qs.is_completed = true;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.get_quiz_result_by_id(uuid) IS
  'Busca resultado de quiz por session_id. SECURITY DEFINER permite acesso sem RLS.';

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Função get_quiz_result_by_id criada com SECURITY DEFINER';
END $$;
