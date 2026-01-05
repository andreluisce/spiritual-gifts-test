-- Admin stats function with proper admin guard and updated logic
DROP FUNCTION IF EXISTS public.get_admin_stats();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_users_count INTEGER;
  active_users_count INTEGER;
  admin_users_count INTEGER;
  new_users_this_month_count INTEGER;
  total_quizzes_count INTEGER;
  completed_today_count INTEGER;
  avg_score_value NUMERIC;
  most_popular_gift_name TEXT;
BEGIN
  -- Ensure only admins can access
  IF NOT public.is_user_admin_safe() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Totals
  SELECT COUNT(*) INTO total_users_count FROM auth.users;

  SELECT COUNT(*) INTO active_users_count
  FROM auth.users
  WHERE last_sign_in_at >= NOW() - INTERVAL '30 days';

  SELECT COUNT(*) INTO admin_users_count
  FROM auth.users
  WHERE (
    raw_user_meta_data ->> 'role' = 'admin'
    OR raw_user_meta_data ->> 'is_admin' = 'true'
    OR raw_app_meta_data ->> 'role' = 'admin'
    OR raw_app_meta_data ->> 'is_admin' = 'true'
    OR email ILIKE '%@admin.%'
  );

  SELECT COUNT(*) INTO new_users_this_month_count
  FROM auth.users
  WHERE created_at >= DATE_TRUNC('month', NOW());

  SELECT COUNT(*) INTO total_quizzes_count
  FROM public.quiz_sessions
  WHERE is_completed = true;

  SELECT COUNT(*) INTO completed_today_count
  FROM public.quiz_sessions
  WHERE is_completed = true
    AND completed_at >= CURRENT_DATE;

  SELECT AVG(total_weighted) INTO avg_score_value
  FROM public.quiz_results_weighted
  WHERE session_id IN (
    SELECT id FROM public.quiz_sessions WHERE is_completed = true
  );

  WITH gift_counts AS (
    SELECT gift, COUNT(*) AS gift_count
    FROM public.quiz_results_weighted
    WHERE session_id IN (
      SELECT id FROM public.quiz_sessions WHERE is_completed = true
    )
    GROUP BY gift
  )
  SELECT 
    CASE 
      WHEN gift = 'A_PROPHECY' THEN 'Profecia'
      WHEN gift = 'B_SERVICE' THEN 'Serviço'
      WHEN gift = 'C_TEACHING' THEN 'Ensino'
      WHEN gift = 'D_EXHORTATION' THEN 'Exortação'
      WHEN gift = 'E_GIVING' THEN 'Contribuição'
      WHEN gift = 'F_LEADERSHIP' THEN 'Liderança'
      WHEN gift = 'G_MERCY' THEN 'Misericórdia'
      ELSE 'N/A'
    END
  INTO most_popular_gift_name
  FROM gift_counts
  ORDER BY gift_count DESC
  LIMIT 1;

  most_popular_gift_name := COALESCE(most_popular_gift_name, 'N/A');
  avg_score_value := COALESCE(avg_score_value, 0);

  SELECT JSON_BUILD_OBJECT(
    'totalUsers', COALESCE(total_users_count, 0),
    'activeUsers', COALESCE(active_users_count, 0),
    'adminUsers', COALESCE(admin_users_count, 0),
    'newUsersThisMonth', COALESCE(new_users_this_month_count, 0),
    'totalQuizzes', COALESCE(total_quizzes_count, 0),
    'completedToday', COALESCE(completed_today_count, 0),
    'averageScore', ROUND(COALESCE(avg_score_value, 0), 2),
    'mostPopularGift', most_popular_gift_name
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
