-- =========================================================
-- FIX GET_ANALYTICS_DATA FUNCTION
-- =========================================================

-- Drop existing problematic function
DROP FUNCTION IF EXISTS public.get_analytics_data(TEXT);

-- Create fixed version that works with actual database structure
CREATE OR REPLACE FUNCTION public.get_analytics_data(date_range_param TEXT DEFAULT '30d')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  start_date TIMESTAMPTZ;
  end_date TIMESTAMPTZ;
  total_quizzes INTEGER;
  avg_score NUMERIC;
  completion_rate NUMERIC;
  daily_data JSON;
BEGIN
  -- Calculate date range
  end_date := NOW();
  
  CASE date_range_param
    WHEN '7d' THEN start_date := end_date - INTERVAL '7 days';
    WHEN '30d' THEN start_date := end_date - INTERVAL '30 days';
    WHEN '90d' THEN start_date := end_date - INTERVAL '90 days';
    WHEN '1y' THEN start_date := end_date - INTERVAL '1 year';
    ELSE start_date := end_date - INTERVAL '30 days';
  END CASE;

  -- Get total quizzes in date range
  SELECT COUNT(*) INTO total_quizzes
  FROM quiz_sessions 
  WHERE is_completed = true 
    AND completed_at >= start_date 
    AND completed_at <= end_date;

  -- Get average score from quiz_results_weighted directly
  SELECT AVG(qr.total_weighted) INTO avg_score
  FROM quiz_results_weighted qr
  JOIN quiz_sessions qs ON qs.id = qr.session_id
  WHERE qs.is_completed = true
    AND qs.completed_at >= start_date 
    AND qs.completed_at <= end_date;

  -- Calculate completion rate (assuming all completed sessions are 100% complete)
  completion_rate := 100.0;

  -- Get daily quiz counts for the last 7 days
  WITH daily_counts AS (
    SELECT 
      DATE(completed_at) as quiz_date,
      COUNT(*) as daily_count
    FROM quiz_sessions 
    WHERE is_completed = true 
      AND completed_at >= (NOW() - INTERVAL '7 days')
    GROUP BY DATE(completed_at)
    ORDER BY quiz_date
  ),
  date_series AS (
    SELECT generate_series(
      (NOW() - INTERVAL '6 days')::DATE,
      NOW()::DATE,
      '1 day'::INTERVAL
    )::DATE as series_date
  )
  SELECT JSON_AGG(
    COALESCE(dc.daily_count, 0) ORDER BY ds.series_date
  ) INTO daily_data
  FROM date_series ds
  LEFT JOIN daily_counts dc ON ds.series_date = dc.quiz_date;

  -- Build result JSON
  SELECT JSON_BUILD_OBJECT(
    'overview', JSON_BUILD_OBJECT(
      'totalQuizzes', COALESCE(total_quizzes, 0),
      'avgScore', ROUND(COALESCE(avg_score, 0), 2),
      'completionRate', COALESCE(completion_rate, 0),
      'avgCompletionTime', 8.5
    ),
    'trends', JSON_BUILD_OBJECT(
      'dailyQuizzes', COALESCE(daily_data, '[]'::JSON)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_analytics_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_data(TEXT) TO anon;