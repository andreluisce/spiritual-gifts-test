-- =========================================================
-- ADMIN FUNCTIONS FOR USER AND STATISTICS MANAGEMENT
-- =========================================================

-- Function to get user statistics for admin dashboard
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
  -- Check if user is admin
  IF NOT (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_user_meta_data ->> 'role' = 'admin'
          OR auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
          OR auth.users.email LIKE '%@admin.%'
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total users
  SELECT COUNT(*) INTO total_users_count FROM auth.users;

  -- Get active users (last 30 days)
  SELECT COUNT(*) INTO active_users_count 
  FROM auth.users 
  WHERE last_sign_in_at >= NOW() - INTERVAL '30 days';

  -- Get admin users
  SELECT COUNT(*) INTO admin_users_count 
  FROM auth.users 
  WHERE (
    raw_user_meta_data ->> 'role' = 'admin'
    OR raw_user_meta_data ->> 'is_admin' = 'true'
    OR email LIKE '%@admin.%'
  );

  -- Get new users this month
  SELECT COUNT(*) INTO new_users_this_month_count 
  FROM auth.users 
  WHERE created_at >= DATE_TRUNC('month', NOW());

  -- Get total completed quizzes
  SELECT COUNT(*) INTO total_quizzes_count 
  FROM public.quiz_sessions 
  WHERE is_completed = true;

  -- Get quizzes completed today
  SELECT COUNT(*) INTO completed_today_count 
  FROM public.quiz_sessions 
  WHERE is_completed = true 
    AND completed_at >= CURRENT_DATE;

  -- Get average score
  SELECT AVG(score::numeric) INTO avg_score_value 
  FROM public.answers;

  -- Get most popular gift (simplified)
  most_popular_gift_name := 'N/A'; -- TODO: Implement gift calculation

  -- Build result JSON
  SELECT JSON_BUILD_OBJECT(
    'totalUsers', COALESCE(total_users_count, 0),
    'activeUsers', COALESCE(active_users_count, 0),
    'adminUsers', COALESCE(admin_users_count, 0),
    'newUsersThisMonth', COALESCE(new_users_this_month_count, 0),
    'totalQuizzes', COALESCE(total_quizzes_count, 0),
    'completedToday', COALESCE(completed_today_count, 0),
    'averageScore', COALESCE(avg_score_value, 0),
    'mostPopularGift', most_popular_gift_name
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to get users with stats for admin management
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  user_metadata JSONB,
  quiz_count BIGINT,
  avg_score NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_user_meta_data ->> 'role' = 'admin'
          OR auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
          OR auth.users.email LIKE '%@admin.%'
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data,
    COALESCE(qs.quiz_count, 0) as quiz_count,
    COALESCE(ans.avg_score, 0) as avg_score,
    CASE 
      WHEN u.last_sign_in_at IS NULL THEN 'inactive'
      WHEN u.last_sign_in_at >= NOW() - INTERVAL '30 days' THEN 'active'
      ELSE 'inactive'
    END as status
  FROM auth.users u
  LEFT JOIN (
    SELECT user_id, COUNT(*) as quiz_count
    FROM public.quiz_sessions
    WHERE is_completed = true
    GROUP BY user_id
  ) qs ON qs.user_id = u.id
  LEFT JOIN (
    SELECT qs.user_id, AVG(a.score::numeric) as avg_score
    FROM public.quiz_sessions qs
    JOIN public.answers a ON a.session_id = qs.id
    WHERE qs.is_completed = true
    GROUP BY qs.user_id
  ) ans ON ans.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Function to get recent activity
CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id TEXT,
  user_email TEXT,
  user_name TEXT,
  action TEXT,
  type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_user_meta_data ->> 'role' = 'admin'
          OR auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
          OR auth.users.email LIKE '%@admin.%'
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    ('quiz-' || qs.id::text) as id,
    u.email as user_email,
    COALESCE(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)) as user_name,
    'Completed quiz' as action,
    'quiz' as type,
    qs.completed_at as created_at
  FROM public.quiz_sessions qs
  LEFT JOIN auth.users u ON u.id = qs.user_id
  WHERE qs.is_completed = true
    AND qs.completed_at IS NOT NULL
  ORDER BY qs.completed_at DESC
  LIMIT limit_count;
END;
$$;

-- Function to get gift distribution
CREATE OR REPLACE FUNCTION public.get_gift_distribution()
RETURNS TABLE (
  gift_id INTEGER,
  gift_name TEXT,
  count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count BIGINT;
BEGIN
  -- Check if user is admin
  IF NOT (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_user_meta_data ->> 'role' = 'admin'
          OR auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
          OR auth.users.email LIKE '%@admin.%'
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get total completed quizzes
  SELECT COUNT(*) INTO total_count
  FROM public.quiz_sessions
  WHERE is_completed = true;

  -- Return gift distribution (simplified for now)
  RETURN QUERY
  SELECT 
    1 as gift_id,
    'Gift data not yet implemented' as gift_name,
    0::bigint as count,
    0::numeric as percentage
  WHERE false; -- Return empty for now
END;
$$;

-- Function to delete a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_user_meta_data ->> 'role' = 'admin'
          OR auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
          OR auth.users.email LIKE '%@admin.%'
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Delete user quiz data first
  DELETE FROM public.answers 
  WHERE session_id IN (
    SELECT id FROM public.quiz_sessions WHERE user_id = target_user_id
  );

  DELETE FROM public.quiz_sessions WHERE user_id = target_user_id;

  -- Note: auth.users deletion requires admin API, not SQL
  -- This function only cleans up related data
  
  RETURN JSON_BUILD_OBJECT('success', true, 'message', 'User data deleted');
END;
$$;

-- Function to update user role
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id UUID, new_role TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
        AND (
          auth.users.raw_user_meta_data ->> 'role' = 'admin'
          OR auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
          OR auth.users.email LIKE '%@admin.%'
        )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Note: Updating auth.users requires admin API, not SQL
  -- This is a placeholder function
  
  RETURN JSON_BUILD_OBJECT('success', false, 'message', 'Role update requires admin API');
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(UUID, TEXT) TO authenticated;