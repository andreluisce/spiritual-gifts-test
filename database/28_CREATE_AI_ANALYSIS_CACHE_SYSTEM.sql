-- =========================================================
-- AI ANALYSIS CACHE SYSTEM
-- =========================================================
-- Creates comprehensive caching system for AI-generated analysis
-- to improve performance and reduce API costs

-- Create AI Analysis Cache Table
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  
  -- Quiz Data for Context
  gift_scores JSONB NOT NULL,
  primary_gifts TEXT[] NOT NULL,
  locale VARCHAR(5) DEFAULT 'pt',
  
  -- AI Analysis Results
  personalized_insights TEXT,
  strengths_description TEXT,
  challenges_guidance TEXT,
  ministry_recommendations TEXT[],
  development_plan TEXT,
  practical_applications TEXT[],
  confidence_score INTEGER DEFAULT 0,
  
  -- Metadata
  ai_service_used VARCHAR(50),
  analysis_version VARCHAR(10) DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique analysis per session
  UNIQUE(session_id)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id 
  ON ai_analysis_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_session_id 
  ON ai_analysis_cache(session_id);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at 
  ON ai_analysis_cache(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_confidence 
  ON ai_analysis_cache(confidence_score);

-- Enable Row Level Security
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Security

-- Users can view their own AI analyses
DROP POLICY IF EXISTS "Users can view their own AI analyses" ON ai_analysis_cache;
CREATE POLICY "Users can view their own AI analyses"
  ON ai_analysis_cache FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own AI analyses
DROP POLICY IF EXISTS "Users can insert their own AI analyses" ON ai_analysis_cache;
CREATE POLICY "Users can insert their own AI analyses"
  ON ai_analysis_cache FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI analyses
DROP POLICY IF EXISTS "Users can update their own AI analyses" ON ai_analysis_cache;
CREATE POLICY "Users can update their own AI analyses"
  ON ai_analysis_cache FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to Save AI Analysis with Upsert
CREATE OR REPLACE FUNCTION save_ai_analysis(
  p_user_id UUID,
  p_session_id UUID,
  p_gift_scores JSONB,
  p_primary_gifts TEXT[],
  p_locale VARCHAR(5),
  p_personalized_insights TEXT,
  p_strengths_description TEXT,
  p_challenges_guidance TEXT,
  p_ministry_recommendations TEXT[],
  p_development_plan TEXT,
  p_practical_applications TEXT[],
  p_confidence_score INTEGER,
  p_ai_service_used VARCHAR(50)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analysis_id UUID;
BEGIN
  -- Insert or update AI analysis
  INSERT INTO ai_analysis_cache (
    user_id, session_id, gift_scores, primary_gifts, locale,
    personalized_insights, strengths_description, challenges_guidance,
    ministry_recommendations, development_plan, practical_applications,
    confidence_score, ai_service_used
  )
  VALUES (
    p_user_id, p_session_id, p_gift_scores, p_primary_gifts, p_locale,
    p_personalized_insights, p_strengths_description, p_challenges_guidance,
    p_ministry_recommendations, p_development_plan, p_practical_applications,
    p_confidence_score, p_ai_service_used
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET
    personalized_insights = EXCLUDED.personalized_insights,
    strengths_description = EXCLUDED.strengths_description,
    challenges_guidance = EXCLUDED.challenges_guidance,
    ministry_recommendations = EXCLUDED.ministry_recommendations,
    development_plan = EXCLUDED.development_plan,
    practical_applications = EXCLUDED.practical_applications,
    confidence_score = EXCLUDED.confidence_score,
    ai_service_used = EXCLUDED.ai_service_used,
    updated_at = now()
  RETURNING id INTO analysis_id;
  
  RETURN analysis_id;
END;
$$;

-- Function to Get Cached AI Analysis by Session
CREATE OR REPLACE FUNCTION get_ai_analysis_by_session(
  p_session_id UUID
)
RETURNS TABLE (
  id INTEGER,
  personalized_insights TEXT,
  strengths_description TEXT,
  challenges_guidance TEXT,
  ministry_recommendations TEXT[],
  development_plan TEXT,
  practical_applications TEXT[],
  confidence_score INTEGER,
  ai_service_used VARCHAR(50),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.id,
    ac.personalized_insights,
    ac.strengths_description,
    ac.challenges_guidance,
    ac.ministry_recommendations,
    ac.development_plan,
    ac.practical_applications,
    ac.confidence_score,
    ac.ai_service_used,
    ac.created_at,
    ac.updated_at
  FROM ai_analysis_cache ac
  WHERE ac.session_id = p_session_id;
END;
$$;

-- Function to Get User's AI Analysis History
CREATE OR REPLACE FUNCTION get_user_ai_analysis_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  session_id UUID,
  primary_gifts TEXT[],
  personalized_insights TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.session_id,
    ac.primary_gifts,
    ac.personalized_insights,
    ac.confidence_score,
    ac.created_at
  FROM ai_analysis_cache ac
  WHERE ac.user_id = p_user_id
  ORDER BY ac.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to Get AI Analysis Statistics (for admin)
CREATE OR REPLACE FUNCTION get_ai_analysis_stats()
RETURNS TABLE (
  total_analyses INTEGER,
  unique_users INTEGER,
  avg_confidence NUMERIC,
  analyses_last_30_days INTEGER,
  most_common_service TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_analyses,
    COUNT(DISTINCT user_id)::INTEGER as unique_users,
    ROUND(AVG(confidence_score), 2) as avg_confidence,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END)::INTEGER as analyses_last_30_days,
    MODE() WITHIN GROUP (ORDER BY ai_service_used) as most_common_service
  FROM ai_analysis_cache;
END;
$$;

-- Add Comments for Documentation
COMMENT ON TABLE ai_analysis_cache IS 'Caches AI-generated personality and compatibility analyses to improve performance and reduce API costs';
COMMENT ON COLUMN ai_analysis_cache.gift_scores IS 'JSONB storing user gift scores for cache invalidation';
COMMENT ON COLUMN ai_analysis_cache.primary_gifts IS 'Array of user primary spiritual gifts';
COMMENT ON COLUMN ai_analysis_cache.confidence_score IS 'AI confidence score (0-100) for the analysis quality';
COMMENT ON COLUMN ai_analysis_cache.analysis_version IS 'Version of AI analysis algorithm used';

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON ai_analysis_cache TO authenticated;
GRANT USAGE ON SEQUENCE ai_analysis_cache_id_seq TO authenticated;

-- Example query to test the system:
/*
-- Get cache stats
SELECT * FROM get_ai_analysis_stats();

-- Get user analysis history
SELECT * FROM get_user_ai_analysis_history('user-uuid-here', 5);

-- Get cached analysis for session
SELECT * FROM get_ai_analysis_by_session('session-uuid-here');
*/