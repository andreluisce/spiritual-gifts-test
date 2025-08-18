-- ============================================================================
-- AI ANALYTICS FUNCTIONS
-- ============================================================================
-- This file creates functions for retrieving AI usage analytics and statistics

-- Function to get AI usage statistics
CREATE OR REPLACE FUNCTION public.get_ai_usage_stats()
RETURNS TABLE (
  total_analyses INTEGER,
  cache_hits INTEGER,
  api_calls INTEGER,
  unique_users INTEGER,
  analyses_today INTEGER,
  analyses_this_week INTEGER,
  analyses_this_month INTEGER,
  avg_confidence_score DECIMAL,
  most_analyzed_gift TEXT,
  cache_hit_rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total_count,
      COUNT(CASE WHEN ai_service_used = 'client-ai' THEN 1 END) as cache_count,
      COUNT(CASE WHEN ai_service_used != 'client-ai' THEN 1 END) as api_count,
      COUNT(DISTINCT user_id) as unique_user_count,
      COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_count,
      COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_count,
      COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as month_count,
      AVG(confidence_score) as avg_confidence,
      MODE() WITHIN GROUP (ORDER BY primary_gifts[1]) as popular_gift
    FROM public.ai_analysis_cache
  )
  SELECT 
    s.total_count::INTEGER,
    s.cache_count::INTEGER,
    s.api_count::INTEGER,
    s.unique_user_count::INTEGER,
    s.today_count::INTEGER,
    s.week_count::INTEGER,
    s.month_count::INTEGER,
    ROUND(s.avg_confidence, 1) as avg_confidence,
    COALESCE(s.popular_gift, 'N/A') as popular_gift,
    CASE 
      WHEN s.total_count > 0 THEN ROUND((s.cache_count::DECIMAL / s.total_count::DECIMAL) * 100, 1)
      ELSE 0
    END as cache_hit_rate
  FROM stats s;
END;
$$;

-- Function to get AI usage over time (last 30 days)
CREATE OR REPLACE FUNCTION public.get_ai_usage_timeline()
RETURNS TABLE (
  analysis_date DATE,
  daily_analyses INTEGER,
  daily_cache_hits INTEGER,
  daily_api_calls INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::DATE as analysis_date
  ),
  daily_stats AS (
    SELECT 
      DATE(created_at) as analysis_date,
      COUNT(*) as daily_count,
      COUNT(CASE WHEN ai_service_used = 'client-ai' THEN 1 END) as cache_count,
      COUNT(CASE WHEN ai_service_used != 'client-ai' THEN 1 END) as api_count
    FROM public.ai_analysis_cache
    WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY DATE(created_at)
  )
  SELECT 
    ds.analysis_date,
    COALESCE(st.daily_count, 0)::INTEGER as daily_analyses,
    COALESCE(st.cache_count, 0)::INTEGER as daily_cache_hits,
    COALESCE(st.api_count, 0)::INTEGER as daily_api_calls
  FROM date_series ds
  LEFT JOIN daily_stats st ON ds.analysis_date = st.analysis_date
  ORDER BY ds.analysis_date;
END;
$$;

-- Function to get AI analysis breakdown by gift
CREATE OR REPLACE FUNCTION public.get_ai_analysis_by_gift()
RETURNS TABLE (
  gift_key TEXT,
  analysis_count INTEGER,
  avg_confidence DECIMAL,
  last_analysis TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(primary_gifts) as gift_key,
    COUNT(*)::INTEGER as analysis_count,
    ROUND(AVG(confidence_score), 1) as avg_confidence,
    MAX(created_at) as last_analysis
  FROM public.ai_analysis_cache
  GROUP BY unnest(primary_gifts)
  ORDER BY analysis_count DESC;
END;
$$;

-- Function to get recent AI analysis activity
CREATE OR REPLACE FUNCTION public.get_recent_ai_activity(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id TEXT,
  user_email TEXT,
  primary_gift TEXT,
  confidence_score INTEGER,
  ai_service TEXT,
  created_at TIMESTAMPTZ,
  is_cached BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'ai-' || ac.id::TEXT as id,
    COALESCE(u.email, 'Unknown') as user_email,
    COALESCE(ac.primary_gifts[1], 'Unknown') as primary_gift,
    ac.confidence_score::INTEGER,
    ac.ai_service_used as ai_service,
    ac.created_at,
    (ac.ai_service_used = 'client-ai') as is_cached
  FROM public.ai_analysis_cache ac
  LEFT JOIN auth.users u ON u.id = ac.user_id
  ORDER BY ac.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get system-wide AI configuration status
CREATE OR REPLACE FUNCTION public.get_ai_system_status()
RETURNS TABLE (
  ai_button_enabled BOOLEAN,
  auto_generate_enabled BOOLEAN,
  cache_strategy TEXT,
  total_system_analyses INTEGER,
  system_health_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH settings AS (
    SELECT 
      COALESCE((settings->'ai'->>'showAIButton')::BOOLEAN, false) as show_ai_button,
      COALESCE((settings->'ai'->>'autoGenerate')::BOOLEAN, false) as auto_generate,
      COALESCE(settings->'ai'->>'cacheStrategy', 'gift_scores') as cache_strategy
    FROM public.system_settings 
    WHERE id = 1
  ),
  analytics AS (
    SELECT COUNT(*) as total_analyses
    FROM public.ai_analysis_cache
  )
  SELECT 
    s.show_ai_button,
    s.auto_generate,
    s.cache_strategy::TEXT,
    a.total_analyses::INTEGER,
    CASE 
      WHEN a.total_analyses > 100 THEN 100
      WHEN a.total_analyses > 50 THEN 85
      WHEN a.total_analyses > 10 THEN 70
      ELSE 50
    END as system_health_score
  FROM settings s, analytics a;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_ai_usage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_usage_timeline() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_analysis_by_gift() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_ai_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_system_status() TO authenticated;

-- Print completion message
SELECT 'AI analytics functions created successfully' AS status;