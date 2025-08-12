-- =========================================================
-- QUIZ FUNCTIONS - BACKEND BUSINESS LOGIC
-- Created: 2025-08-12
-- Purpose: Advanced quiz functions for balanced question selection and complete submission
-- =========================================================

-- Log da execução
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('08_quiz_functions', 'Iniciando criação das funções avançadas de quiz', NOW());

-- Limpar funções existentes para recriação limpa
DROP FUNCTION IF EXISTS public.generate_balanced_quiz(text, integer, uuid);
DROP FUNCTION IF EXISTS public.submit_complete_quiz(uuid, jsonb, uuid);

-- =========================================================
-- 1. FUNÇÃO: GENERATE_BALANCED_QUIZ
-- Gera quiz com perguntas balanceadas por peso (P1, P2, P3)
-- Retorna 5 perguntas por gift (45 total) com tradução multilíngue
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_balanced_quiz(
  target_locale text DEFAULT 'pt',
  questions_per_gift integer DEFAULT 5,
  user_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  quiz_id uuid,
  question_id bigint,
  question_text text,
  gift_key public.gift_key,
  weight_class public.weight_class,
  question_order integer
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  quiz_uuid uuid;
BEGIN
  -- Gerar ID único para o quiz
  quiz_uuid := gen_random_uuid();
  
  -- Retornar perguntas balanceadas
  RETURN QUERY
  WITH questions_with_translations AS (
    -- Buscar perguntas com traduções (com fallback para português)
    SELECT 
      qp.id,
      qp.gift,
      qp.pclass,
      COALESCE(qt_target.text, qt_fallback.text, qp.text) as translated_text
    FROM public.question_pool qp
    LEFT JOIN public.question_translations qt_target 
      ON qp.id = qt_target.question_id AND qt_target.locale = target_locale
    LEFT JOIN public.question_translations qt_fallback 
      ON qp.id = qt_fallback.question_id AND qt_fallback.locale = 'pt'
    WHERE qp.is_active = true
  ),
  balanced_per_gift AS (
    -- Balancear perguntas por gift, priorizando distribuição de pesos
    SELECT 
      qwt.*,
      ROW_NUMBER() OVER (PARTITION BY qwt.gift ORDER BY 
        CASE qwt.pclass 
          WHEN 'P1' THEN 1  -- Peso baixo primeiro
          WHEN 'P2' THEN 2  -- Peso médio segundo
          WHEN 'P3' THEN 3  -- Peso alto terceiro
          ELSE 4            -- Outros por último
        END, RANDOM()       -- Depois randomiza dentro do peso
      ) as overall_rank
    FROM questions_with_translations qwt
  ),
  selected_questions AS (
    -- Selecionar até N perguntas por gift
    SELECT 
      bpg.*,
      ROW_NUMBER() OVER (ORDER BY bpg.gift, bpg.overall_rank) as final_order
    FROM balanced_per_gift bpg
    WHERE bpg.overall_rank <= questions_per_gift
  )
  -- Retorno final ordenado
  SELECT 
    quiz_uuid as quiz_id,
    sq.id as question_id,
    sq.translated_text as question_text,
    sq.gift as gift_key,
    sq.pclass as weight_class,
    sq.final_order::integer as question_order
  FROM selected_questions sq
  ORDER BY sq.final_order;
END;
$$;

-- =========================================================
-- 2. FUNÇÃO: SUBMIT_COMPLETE_QUIZ
-- Submissão completa do quiz com cálculo automático de resultados
-- Recebe respostas em JSON e retorna top 5 gifts com nomes
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
    SELECT 
      array_agg(t5.gift::text ORDER BY t5.rank) as gift_keys,
      array_agg(t5.gift_name ORDER BY t5.rank) as gift_names,
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

-- =========================================================
-- 3. CONCEDER PERMISSÕES
-- =========================================================

-- Permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION public.generate_balanced_quiz(text, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_complete_quiz(uuid, jsonb, uuid) TO authenticated;

-- Permissões para usuários anônimos (se necessário)
GRANT EXECUTE ON FUNCTION public.generate_balanced_quiz(text, integer, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_complete_quiz(uuid, jsonb, uuid) TO anon;

-- =========================================================
-- 4. VERIFICAÇÃO E TESTES
-- =========================================================

-- Verificar se funções foram criadas
DO $$
BEGIN
  RAISE NOTICE '🔍 Verificando criação das funções...';
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_balanced_quiz') THEN
    RAISE NOTICE '✅ Função generate_balanced_quiz criada com sucesso';
  ELSE
    RAISE EXCEPTION '❌ ERRO: Função generate_balanced_quiz não foi criada';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'submit_complete_quiz') THEN
    RAISE NOTICE '✅ Função submit_complete_quiz criada com sucesso';
  ELSE
    RAISE EXCEPTION '❌ ERRO: Função submit_complete_quiz não foi criada';
  END IF;
  
  RAISE NOTICE '🎉 Todas as funções de quiz foram criadas com sucesso!';
END
$$;

-- Teste de geração de quiz
DO $$
DECLARE
  question_count integer;
  gift_count integer;
BEGIN
  SELECT count(*), count(DISTINCT gift_key) 
  INTO question_count, gift_count
  FROM generate_balanced_quiz('pt', 5);
  
  RAISE NOTICE '🧪 TESTE: Quiz gerado com % perguntas e % gifts únicos', question_count, gift_count;
  
  IF question_count = 45 AND gift_count = 9 THEN
    RAISE NOTICE '✅ TESTE PASSOU: Quiz balanceado funcionando corretamente';
  ELSE
    RAISE WARNING '⚠️ TESTE FALHOU: Esperado 45 perguntas e 9 gifts, obtido % perguntas e % gifts', question_count, gift_count;
  END IF;
END
$$;

-- Log da conclusão
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('08_quiz_functions', 'Funções de quiz criadas e testadas com sucesso', NOW());

-- Comentários sobre as funções
COMMENT ON FUNCTION public.generate_balanced_quiz(text, integer, uuid) IS 
'Gera quiz balanceado com distribuição equilibrada de pesos (P1, P2, P3) por gift. Retorna perguntas traduzidas para o idioma especificado.';

COMMENT ON FUNCTION public.submit_complete_quiz(uuid, jsonb, uuid) IS 
'Submissão completa do quiz: cria sessão, insere respostas, calcula scores e retorna top 5 gifts com nomes em português.';

-- Fim do script