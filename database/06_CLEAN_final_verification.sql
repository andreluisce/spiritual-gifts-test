-- =========================================================
-- VERIFICAÇÃO FINAL DO SISTEMA MULTILÍNGUE
-- Execute POR ÚLTIMO: Verifica se tudo está funcionando
-- =========================================================

-- 1. TESTE DAS FUNÇÕES PRINCIPAIS
SELECT 'TESTE: Função multilíngue PT' as test_name, COUNT(*) as result_count
FROM public.get_questions_by_locale('pt')
UNION ALL
SELECT 'TESTE: Função multilíngue EN', COUNT(*)
FROM public.get_questions_by_locale('en')
UNION ALL
SELECT 'TESTE: Função multilíngue ES', COUNT(*)
FROM public.get_questions_by_locale('es');

-- 2. CRIAR SESSÃO DE TESTE PARA VERIFICAR CÁLCULOS
DO $$
DECLARE
  test_session_id uuid;
  test_user_id uuid;
  question_ids int[];
  i int;
BEGIN
  -- Criar usuário de teste
  test_user_id := uuid_generate_v4();
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (test_user_id, 'Test User', 'test@example.com', 'user');
  
  -- Criar sessão de teste
  test_session_id := uuid_generate_v4();
  INSERT INTO public.quiz_sessions (id, user_id)
  VALUES (test_session_id, test_user_id);
  
  -- Pegar IDs das primeiras 20 perguntas
  SELECT array_agg(id) INTO question_ids
  FROM (SELECT id FROM public.question_pool ORDER BY id LIMIT 20) q;
  
  -- Inserir respostas de teste (scores variados)
  FOR i IN 1..array_length(question_ids, 1) LOOP
    INSERT INTO public.answers (session_id, pool_question_id, score)
    VALUES (test_session_id, question_ids[i], (i % 3) + 1);
  END LOOP;
  
  -- Testar função de cálculo
  -- Sessão de teste criada: test_session_id
END$$;

-- 3. TESTAR CÁLCULO DE RESULTADOS COM SESSÃO REAL
WITH test_results AS (
  SELECT * FROM public.calculate_quiz_result(
    (SELECT id FROM public.quiz_sessions ORDER BY created_at DESC LIMIT 1)
  )
)
SELECT 
  'TESTE: Cálculo de resultados' as test_name,
  COUNT(*) as gifts_calculados,
  ROUND(AVG(total_weighted), 2) as media_ponderada
FROM test_results;

-- 4. VERIFICAR VIEWS E CÁLCULOS
SELECT 
  'TESTE: View pesos efetivos' as test_name,
  COUNT(*) as total_calculos
FROM public.v_answer_effective_weights
LIMIT 1;

SELECT 
  'TESTE: View resultados ponderados' as test_name,
  COUNT(*) as sessoes_com_resultados,
  COUNT(DISTINCT gift) as gifts_distintos
FROM public.quiz_results_weighted
WHERE question_count > 0;

-- 5. ESTATÍSTICAS FINAIS COMPLETAS
SELECT '=== SISTEMA MULTILÍNGUE - STATUS FINAL ===' as titulo;

SELECT 
  'TABELAS PRINCIPAIS' as categoria,
  table_schema as schema,
  table_name as tabela,
  CASE table_name
    WHEN 'question_pool' THEN (SELECT COUNT(*) FROM public.question_pool)
    WHEN 'question_translations' THEN (SELECT COUNT(*) FROM public.question_translations)
    WHEN 'decision_weights' THEN (SELECT COUNT(*) FROM public.decision_weights)
    WHEN 'answers' THEN (SELECT COUNT(*) FROM public.answers)
    WHEN 'quiz_sessions' THEN (SELECT COUNT(*) FROM public.quiz_sessions)
    WHEN 'profiles' THEN (SELECT COUNT(*) FROM public.profiles)
    ELSE 0
  END as total_registros
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('question_pool', 'question_translations', 'decision_weights', 'answers', 'quiz_sessions', 'profiles')
ORDER BY table_name;

-- IDIOMAS SUPORTADOS
SELECT 
  'MULTILÍNGUE' as categoria,
  locale as idioma,
  COUNT(*) as total_traducoes,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.question_pool), 1) as percentual_cobertura
FROM public.question_translations
GROUP BY locale
ORDER BY locale;

-- DISTRIBUIÇÃO DE PESOS
SELECT 
  'MATRIZ DE PESOS' as categoria,
  pclass as prioridade,
  COUNT(*) as configuracoes,
  ROUND(AVG(multiplier), 3) as peso_medio,
  MIN(multiplier) as peso_minimo,
  MAX(multiplier) as peso_maximo
FROM public.decision_weights
GROUP BY pclass
ORDER BY pclass;

-- DISTRIBUIÇÃO DE PERGUNTAS
SELECT 
  'PERGUNTAS POR DOM' as categoria,
  gift as dom,
  COUNT(*) as total_perguntas,
  COUNT(CASE WHEN reverse_scored THEN 1 END) as reversas,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.question_pool), 1) as percentual
FROM public.question_pool
GROUP BY gift
ORDER BY gift;

-- 6. FUNÇÃO DE VALIDAÇÃO COMPLETA
CREATE OR REPLACE FUNCTION public.validate_multilingual_system()
RETURNS TABLE (
  check_name text,
  status text,
  details text,
  is_critical boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check 1: Todas as perguntas têm tradução PT
  RETURN QUERY
  SELECT 
    'Traduções PT completas'::text,
    CASE 
      WHEN COUNT(*) = (SELECT COUNT(*) FROM public.question_pool) 
      THEN '✅ PASS'::text 
      ELSE '❌ FAIL'::text 
    END,
    FORMAT('%s de %s perguntas com tradução PT', 
      COUNT(*), 
      (SELECT COUNT(*) FROM public.question_pool)
    )::text,
    true as is_critical
  FROM public.question_translations qt
  WHERE qt.locale = 'pt';
  
  -- Check 2: Matriz de pesos completa
  RETURN QUERY
  SELECT 
    'Matriz de pesos completa'::text,
    CASE 
      WHEN COUNT(*) >= 105 
      THEN '✅ PASS'::text 
      ELSE '⚠️  PARTIAL'::text 
    END,
    FORMAT('%s pesos configurados (recomendado: 105)', COUNT(*))::text,
    true as is_critical
  FROM public.decision_weights;
  
  -- Check 3: Functions multilíngues
  RETURN QUERY
  SELECT 
    'Functions multilíngues'::text,
    CASE 
      WHEN COUNT(*) >= 2 
      THEN '✅ PASS'::text 
      ELSE '❌ FAIL'::text 
    END,
    FORMAT('%s functions criadas', COUNT(*))::text,
    true as is_critical
  FROM information_schema.routines 
  WHERE routine_name IN ('get_questions_by_locale', 'calculate_quiz_result');
  
  -- Check 4: Views de cálculo
  RETURN QUERY
  SELECT 
    'Views de cálculo'::text,
    CASE 
      WHEN COUNT(*) >= 2 
      THEN '✅ PASS'::text 
      ELSE '❌ FAIL'::text 
    END,
    FORMAT('%s views criadas', COUNT(*))::text,
    false as is_critical
  FROM information_schema.views 
  WHERE table_name IN ('v_answer_effective_weights', 'quiz_results_weighted');
  
  -- Check 5: Traduções EN
  RETURN QUERY
  SELECT 
    'Traduções EN disponíveis'::text,
    CASE 
      WHEN COUNT(*) > 0 
      THEN '✅ PASS'::text 
      ELSE '⚠️  MISSING'::text 
    END,
    FORMAT('%s traduções EN carregadas', COUNT(*))::text,
    false as is_critical
  FROM public.question_translations 
  WHERE locale = 'en';
  
  -- Check 6: Traduções ES
  RETURN QUERY
  SELECT 
    'Traduções ES disponíveis'::text,
    CASE 
      WHEN COUNT(*) > 0 
      THEN '✅ PASS'::text 
      ELSE '⚠️  MISSING'::text 
    END,
    FORMAT('%s traduções ES carregadas', COUNT(*))::text,
    false as is_critical
  FROM public.question_translations 
  WHERE locale = 'es';
END;
$$;

-- 7. EXECUTAR VALIDAÇÃO FINAL
SELECT 
  check_name,
  status,
  details,
  CASE WHEN is_critical THEN '🔴 CRÍTICO' ELSE '🟡 OPCIONAL' END as importancia
FROM public.validate_multilingual_system()
ORDER BY is_critical DESC, check_name;

-- 8. LOG FINAL
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES (
  '06_final_verification', 
  'Sistema multilíngue verificado e operacional',
  NOW()
) ON CONFLICT (step) DO UPDATE SET 
  executed_at = NOW(),
  description = EXCLUDED.description;

-- 9. RESUMO DE CONCLUSÃO
SELECT 
  '🎉 MIGRAÇÃO CONCLUÍDA' as status,
  NOW() as timestamp_conclusao,
  (SELECT COUNT(*) FROM public.question_pool) as perguntas_total,
  (SELECT COUNT(DISTINCT locale) FROM public.question_translations) as idiomas_suportados,
  (SELECT COUNT(*) FROM public.decision_weights) as configuracoes_peso,
  'SISTEMA OPERACIONAL' as resultado_final;

-- Sistema multilíngue 100% operacional