-- =========================================================
-- CREATE MISSING TABLES AND FUNCTIONS
-- Adds ai_analysis_cache table and related RPCs
-- =========================================================

-- Create ai_analysis_cache table
CREATE TABLE IF NOT EXISTS public.ai_analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  gift_scores jsonb NOT NULL,
  primary_gifts text[] NOT NULL,
  locale text NOT NULL DEFAULT 'pt',
  personalized_insights text NOT NULL,
  strengths_description text NOT NULL,
  challenges_guidance text,
  ministry_recommendations text[],
  development_plan text NOT NULL,
  practical_applications text[],
  confidence_score numeric(3,2) NOT NULL DEFAULT 0.85,
  ai_service_used text NOT NULL DEFAULT 'gemini',
  analysis_version text NOT NULL DEFAULT '1.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_user_id ON public.ai_analysis_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_session_id ON public.ai_analysis_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_gift_scores ON public.ai_analysis_cache USING gin(gift_scores);

-- Enable RLS
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI analysis cache"
  ON public.ai_analysis_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI analysis cache"
  ON public.ai_analysis_cache FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI analysis cache"
  ON public.ai_analysis_cache FOR UPDATE
  USING (auth.uid() = user_id);

-- Create gift_compatibility_analysis table
CREATE TABLE IF NOT EXISTS public.gift_compatibility_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_gift_key public.gift_key NOT NULL,
  secondary_gift_key public.gift_key NOT NULL,
  compatibility_score numeric(5,2) NOT NULL,
  analysis_text text,
  recommendations text[],
  analysis_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_gift_compat_user_id ON public.gift_compatibility_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_compat_gifts ON public.gift_compatibility_analysis(primary_gift_key, secondary_gift_key);

-- Enable RLS
ALTER TABLE public.gift_compatibility_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own compatibility analysis"
  ON public.gift_compatibility_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own compatibility analysis"
  ON public.gift_compatibility_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RPC: get_ai_analysis_by_user_and_scores
CREATE OR REPLACE FUNCTION public.get_ai_analysis_by_user_and_scores(
  p_user_id text,
  p_gift_scores jsonb
)
RETURNS TABLE (
  id uuid,
  personalized_insights text,
  strengths_description text,
  challenges_guidance text,
  ministry_recommendations text[],
  development_plan text,
  practical_applications text[],
  confidence_score numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_uuid uuid;
BEGIN
  BEGIN
    v_user_uuid := p_user_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN;
  END;

  RETURN QUERY
  SELECT
    aac.id,
    aac.personalized_insights,
    aac.strengths_description,
    aac.challenges_guidance,
    aac.ministry_recommendations,
    aac.development_plan,
    aac.practical_applications,
    aac.confidence_score,
    aac.created_at
  FROM public.ai_analysis_cache aac
  WHERE aac.user_id = v_user_uuid
    AND aac.gift_scores = p_gift_scores
  ORDER BY aac.created_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_analysis_by_user_and_scores(text, jsonb) TO anon, authenticated, service_role;

-- RPC: get_ai_analysis_by_session
CREATE OR REPLACE FUNCTION public.get_ai_analysis_by_session(
  p_session_id text
)
RETURNS TABLE (
  id uuid,
  personalized_insights text,
  strengths_description text,
  challenges_guidance text,
  ministry_recommendations text[],
  development_plan text,
  practical_applications text[],
  confidence_score numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_uuid uuid;
BEGIN
  BEGIN
    v_session_uuid := p_session_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN;
  END;

  RETURN QUERY
  SELECT
    aac.id,
    aac.personalized_insights,
    aac.strengths_description,
    aac.challenges_guidance,
    aac.ministry_recommendations,
    aac.development_plan,
    aac.practical_applications,
    aac.confidence_score,
    aac.created_at
  FROM public.ai_analysis_cache aac
  WHERE aac.session_id = v_session_uuid
  ORDER BY aac.created_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ai_analysis_by_session(text) TO anon, authenticated, service_role;

-- RPC: get_gift_compatibility (stub - returns mock data)
CREATE OR REPLACE FUNCTION public.get_gift_compatibility(
  p_primary_gift public.gift_key,
  p_secondary_gift public.gift_key,
  p_locale text DEFAULT 'pt'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return mock compatibility data
  -- This should be replaced with actual compatibility logic
  RETURN jsonb_build_object(
    'synergyLevel', 'moderate',
    'description', 'Boa combinação de dons',
    'compatibilityScore', 75,
    'strengths', jsonb_build_array(
      jsonb_build_object('strength', 'Complementaridade', 'order', 1),
      jsonb_build_object('strength', 'Equilíbrio', 'order', 2)
    ),
    'challenges', jsonb_build_array(
      jsonb_build_object('challenge', 'Possível conflito de prioridades', 'solution', 'Comunicação clara', 'order', 1)
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_gift_compatibility(public.gift_key, public.gift_key, text) TO anon, authenticated, service_role;

-- RPC: get_ministry_recommendations (stub - returns mock data)
CREATE OR REPLACE FUNCTION public.get_ministry_recommendations(
  p_user_gifts public.gift_key[],
  p_locale text DEFAULT 'pt'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return mock ministry recommendations
  -- This should be replaced with actual ministry matching logic
  RETURN jsonb_build_array(
    jsonb_build_object(
      'ministry_key', 'teaching',
      'ministry_name', 'Ensino',
      'description', 'Ministério de ensino e discipulado',
      'compatibility_score', 85,
      'matched_gifts', 2,
      'total_required', 3,
      'responsibilities', jsonb_build_array(
        jsonb_build_object('responsibility', 'Preparar estudos bíblicos', 'order', 1),
        jsonb_build_object('responsibility', 'Liderar grupos pequenos', 'order', 2)
      ),
      'growth_areas', jsonb_build_array(
        jsonb_build_object('area', 'Comunicação', 'order', 1, 'resources', 'Cursos de oratória')
      )
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ministry_recommendations(public.gift_key[], text) TO anon, authenticated, service_role;

COMMENT ON TABLE public.ai_analysis_cache IS 'Stores AI-generated compatibility analysis for user gift profiles';
COMMENT ON TABLE public.gift_compatibility_analysis IS 'Stores user gift compatibility analysis history';
COMMENT ON FUNCTION public.get_ai_analysis_by_user_and_scores(text, jsonb) IS 'Retrieves cached AI analysis by user ID and gift scores';
COMMENT ON FUNCTION public.get_ai_analysis_by_session(text) IS 'Retrieves cached AI analysis by session ID';
COMMENT ON FUNCTION public.get_gift_compatibility(public.gift_key, public.gift_key, text) IS 'Returns compatibility analysis between two gifts';
COMMENT ON FUNCTION public.get_ministry_recommendations(public.gift_key[], text) IS 'Returns ministry recommendations based on user gifts';
