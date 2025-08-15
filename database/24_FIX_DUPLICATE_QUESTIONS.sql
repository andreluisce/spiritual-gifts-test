-- =========================================================
-- FIX DUPLICATE QUESTIONS IN QUIZ GENERATION
-- =========================================================

-- Drop existing function
DROP FUNCTION IF EXISTS public.generate_balanced_quiz(text, integer, uuid);

-- Recreate with improved logic to prevent duplicates
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
  p1_count integer := CEIL(questions_per_gift * 0.4); -- 40% P1
  p2_count integer := CEIL(questions_per_gift * 0.3); -- 30% P2
  p3_count integer := questions_per_gift - p1_count - p2_count; -- Remaining for P3
BEGIN
  -- Generate unique quiz ID
  quiz_uuid := gen_random_uuid();
  
  -- Log distribution for debugging
  RAISE NOTICE 'Generated quiz with % questions per gift: P1=%, P2=%, P3=%', 
    questions_per_gift, p1_count, p2_count, p3_count;
  
  -- Return balanced questions with guaranteed uniqueness
  RETURN QUERY
  WITH questions_with_translations AS (
    -- Get questions with translations (fallback to Portuguese)
    SELECT DISTINCT -- Ensure no duplicates from joins
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
  balanced_selection AS (
    -- Select questions with explicit count control per weight class
    (
      -- P1 questions (40%)
      SELECT 
        qwt.*,
        1 as weight_priority,
        ROW_NUMBER() OVER (PARTITION BY qwt.gift ORDER BY RANDOM()) as rank_in_weight
      FROM questions_with_translations qwt
      WHERE qwt.pclass = 'P1'
    )
    UNION ALL
    (
      -- P2 questions (30%)
      SELECT 
        qwt.*,
        2 as weight_priority,
        ROW_NUMBER() OVER (PARTITION BY qwt.gift ORDER BY RANDOM()) as rank_in_weight
      FROM questions_with_translations qwt
      WHERE qwt.pclass = 'P2'
    )
    UNION ALL
    (
      -- P3 questions (remaining %)
      SELECT 
        qwt.*,
        3 as weight_priority,
        ROW_NUMBER() OVER (PARTITION BY qwt.gift ORDER BY RANDOM()) as rank_in_weight
      FROM questions_with_translations qwt
      WHERE qwt.pclass = 'P3'
    )
  ),
  final_selection AS (
    SELECT DISTINCT ON (bs.id) -- Ensure absolute uniqueness by question ID
      bs.*,
      ROW_NUMBER() OVER (
        ORDER BY bs.gift, bs.weight_priority, bs.rank_in_weight
      ) as final_order
    FROM balanced_selection bs
    WHERE 
      (bs.pclass = 'P1' AND bs.rank_in_weight <= p1_count) OR
      (bs.pclass = 'P2' AND bs.rank_in_weight <= p2_count) OR
      (bs.pclass = 'P3' AND bs.rank_in_weight <= p3_count)
  )
  -- Final return with uniqueness guarantee
  SELECT 
    quiz_uuid as quiz_id,
    fs.id as question_id,
    fs.translated_text as question_text,
    fs.gift as gift_key,
    fs.pclass as weight_class,
    fs.final_order::integer as question_order
  FROM final_selection fs
  ORDER BY fs.final_order;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.generate_balanced_quiz(text, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_balanced_quiz(text, integer, uuid) TO anon;