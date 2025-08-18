-- =========================================================
-- SISTEMA MULTILÍNGUE COMPLETO - CRIAÇÃO LIMPA
-- Execute SEGUNDO: Cria todo o sistema de uma vez
-- =========================================================

-- 1. CRIAR ENUMS
CREATE TYPE public.gift_key AS ENUM (
  'A_PROPHECY','B_SERVICE','C_TEACHING','D_EXHORTATION','E_GIVING','F_LEADERSHIP','G_MERCY'
);

CREATE TYPE public.weight_class AS ENUM ('P1','P2','P3');

CREATE TYPE public.source_type AS ENUM (
  'QUALITY','CHARACTERISTIC','DANGER','MISUNDERSTANDING','OTHER'
);

-- 2. TABELA PRINCIPAL DE PERGUNTAS
CREATE TABLE public.question_pool (
  id bigserial PRIMARY KEY,
  gift public.gift_key NOT NULL,
  source public.source_type NOT NULL DEFAULT 'OTHER',
  pclass public.weight_class NOT NULL DEFAULT 'P2', 
  reverse_scored boolean NOT NULL DEFAULT false,
  default_weight numeric(6,3) NOT NULL DEFAULT 1.000,
  text text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- 3. TABELA DE TRADUÇÕES
CREATE TABLE public.question_translations (
  id bigserial PRIMARY KEY,
  question_id bigint NOT NULL REFERENCES public.question_pool(id) ON DELETE CASCADE,
  locale varchar(10) NOT NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  UNIQUE(question_id, locale)
);

-- 4. MATRIZ DE PESOS
CREATE TABLE public.decision_weights (
  id serial PRIMARY KEY,
  gift public.gift_key NOT NULL,
  source public.source_type NOT NULL,
  pclass public.weight_class NOT NULL, 
  multiplier numeric(6,3) NOT NULL DEFAULT 1.000,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  UNIQUE(gift, source, pclass)
);

-- 5. TABELAS PARA USUÁRIOS E SESSÕES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text UNIQUE,
  avatar_url text,
  role text DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.quiz_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id),
  questionnaire_id uuid,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE public.answers (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id integer, -- Compatibilidade
  pool_question_id bigint REFERENCES public.question_pool(id),
  questionnaire_id uuid,
  score integer NOT NULL CHECK (score >= 0 AND score <= 3),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- 6. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_question_translations_question_id ON public.question_translations(question_id);
CREATE INDEX idx_question_translations_locale ON public.question_translations(locale);
CREATE INDEX idx_question_pool_gift ON public.question_pool(gift);
CREATE INDEX idx_question_pool_active ON public.question_pool(is_active);
CREATE INDEX idx_answers_session_id ON public.answers(session_id);
CREATE INDEX idx_answers_pool_question_id ON public.answers(pool_question_id);
CREATE INDEX idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);

-- 7. TRIGGERS DE TIMESTAMP
CREATE TRIGGER question_pool_set_timestamp
  BEFORE UPDATE ON public.question_pool
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER question_translations_set_timestamp
  BEFORE UPDATE ON public.question_translations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER profiles_set_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER quiz_sessions_set_timestamp
  BEFORE UPDATE ON public.quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- 8. VIEW PARA CÁLCULO DE PESOS
CREATE VIEW public.v_answer_effective_weights AS
SELECT
  a.id as answer_id,
  a.session_id,
  a.pool_question_id,
  a.score,
  qp.gift,
  qp.source,
  qp.pclass,
  qp.reverse_scored,
  qp.default_weight as question_weight,
  COALESCE(dw.multiplier, 1.000) as matrix_multiplier,
  
  -- Score normalizado (reverse se necessário)
  CASE 
    WHEN qp.reverse_scored THEN (3 - a.score)::numeric 
    ELSE a.score::numeric 
  END as normalized_score,
  
  -- Score final ponderado
  (CASE 
    WHEN qp.reverse_scored THEN (3 - a.score)::numeric 
    ELSE a.score::numeric 
  END) * qp.default_weight * COALESCE(dw.multiplier, 1.000) as weighted_score

FROM public.answers a
JOIN public.question_pool qp ON qp.id = a.pool_question_id
LEFT JOIN public.decision_weights dw ON 
  dw.gift = qp.gift AND dw.source = qp.source AND dw.pclass = qp.pclass
WHERE qp.is_active = true;

-- 9. VIEW PARA RESULTADOS FINAIS
CREATE VIEW public.quiz_results_weighted AS
SELECT
  session_id,
  gift,
  SUM(weighted_score)::numeric(12,3) as total_weighted,
  SUM(normalized_score)::numeric(12,3) as total_raw,
  COUNT(*) as question_count,
  AVG(weighted_score)::numeric(12,3) as avg_weighted
FROM public.v_answer_effective_weights
GROUP BY session_id, gift;

-- 10. FUNÇÃO MULTILÍNGUE
CREATE OR REPLACE FUNCTION public.get_questions_by_locale(target_locale text DEFAULT 'pt')
RETURNS TABLE (
  id bigint,
  gift public.gift_key,
  source public.source_type,
  pclass public.weight_class,
  reverse_scored boolean,
  default_weight numeric(6,3),
  text text,
  is_active boolean
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    qp.id,
    qp.gift,
    qp.source,
    qp.pclass,
    qp.reverse_scored,
    qp.default_weight,
    COALESCE(qt_target.text, qt_fallback.text, qp.text) as text,
    qp.is_active
  FROM public.question_pool qp
  LEFT JOIN public.question_translations qt_target 
    ON qp.id = qt_target.question_id AND qt_target.locale = target_locale
  LEFT JOIN public.question_translations qt_fallback 
    ON qp.id = qt_fallback.question_id AND qt_fallback.locale = 'pt'
  WHERE qp.is_active = true
  ORDER BY qp.id;
$$;

-- 11. FUNÇÃO PARA CALCULAR RESULTADOS
CREATE OR REPLACE FUNCTION public.calculate_quiz_result(p_session_id uuid)
RETURNS TABLE (
  gift public.gift_key, 
  total_weighted numeric, 
  total_raw numeric,
  question_count bigint,
  avg_weighted numeric
)
LANGUAGE sql 
STABLE 
AS $$
  SELECT 
    r.gift, 
    r.total_weighted, 
    r.total_raw,
    r.question_count,
    r.avg_weighted
  FROM public.quiz_results_weighted r
  WHERE r.session_id = p_session_id
  ORDER BY r.total_weighted DESC, r.gift ASC;
$$;

-- 12. LOG DA CRIAÇÃO
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('01_clean_system', 'Sistema multilíngue completo criado do zero', NOW());

-- 13. VERIFICAÇÃO
SELECT 
  'Tabelas criadas' as status,
  COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Sistema multilíngue criado com sucesso

-- 14. FUNÇÕES ADICIONAIS PARA QUIZ BALANCEADO
-- Last Updated: 2025-08-12 - Moved business logic to backend
-- Migration Reference: 20250812182225_create_quiz_functions.sql

-- Create comprehensive quiz generation function (Updated: 2025-08-12)
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
  quiz_uuid := gen_random_uuid();
  
  RETURN QUERY
  WITH questions_with_translations AS (
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
    SELECT 
      qwt.*,
      ROW_NUMBER() OVER (PARTITION BY qwt.gift ORDER BY 
        CASE qwt.pclass 
          WHEN 'P1' THEN 1 
          WHEN 'P2' THEN 2 
          WHEN 'P3' THEN 3 
          ELSE 4 
        END, RANDOM()) as overall_rank
    FROM questions_with_translations qwt
  ),
  selected_questions AS (
    SELECT 
      bpg.*,
      ROW_NUMBER() OVER (ORDER BY bpg.gift, bpg.overall_rank) as final_order
    FROM balanced_per_gift bpg
    WHERE bpg.overall_rank <= questions_per_gift
  )
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

-- Create comprehensive quiz submission function (Updated: 2025-08-12)
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
  new_session_id := gen_random_uuid();
  completion_time := timezone('utc', now());
  
  INSERT INTO public.quiz_sessions (
    id, user_id, is_completed, completed_at, created_at
  ) VALUES (
    new_session_id, p_user_id, true, completion_time, completion_time
  );
  
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
  
  RETURN QUERY
  WITH quiz_results AS (
    SELECT * FROM public.calculate_quiz_result(new_session_id)
  ),
  gift_names AS (
    SELECT 
      qr.gift,
      qr.total_weighted,
      COALESCE(sg.name, qr.gift::text) as gift_name
    FROM quiz_results qr
    LEFT JOIN public.spiritual_gifts sg ON sg.gift_key = qr.gift
    WHERE sg.locale = 'pt' OR sg.locale IS NULL
  ),
  top_5_gifts AS (
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
    SELECT 
      array_agg(t5.gift::text ORDER BY t5.rank) as gift_keys,
      array_agg(t5.gift_name ORDER BY t5.rank) as gift_names,
      jsonb_object_agg(t5.gift::text, t5.total_weighted) as scores
    FROM top_5_gifts t5
  )
  SELECT 
    new_session_id,
    ar.gift_keys,
    ar.gift_names,
    ar.scores,
    completion_time
  FROM aggregated_results ar;
END;
$$;