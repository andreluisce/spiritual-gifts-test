-- Create user_activities table for tracking all user actions
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login', 
    'logout', 
    'quiz_start', 
    'quiz_complete', 
    'profile_update', 
    'password_change',
    'account_created',
    'email_verified'
  )),
  activity_description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can view all activities
CREATE POLICY "Admins can view all activities" ON public.user_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON public.user_activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.user_activities (
    user_id,
    activity_type,
    activity_description,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_description,
    p_ip_address,
    p_user_agent,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Function to automatically log quiz starts
CREATE OR REPLACE FUNCTION public.log_quiz_start()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_user_activity(
    NEW.user_id,
    'quiz_start',
    'Started spiritual gifts assessment'
  );
  RETURN NEW;
END;
$$;

-- Function to automatically log quiz completions
CREATE OR REPLACE FUNCTION public.log_quiz_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    PERFORM public.log_user_activity(
      NEW.user_id,
      'quiz_complete',
      'Completed spiritual gifts assessment',
      NULL,
      NULL,
      jsonb_build_object('session_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for automatic activity logging
CREATE TRIGGER trigger_log_quiz_start
  AFTER INSERT ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_quiz_start();

CREATE TRIGGER trigger_log_quiz_complete
  AFTER UPDATE ON public.quiz_sessions
  FOR EACH ROW
  WHEN (NEW.is_completed = true AND OLD.is_completed = false)
  EXECUTE FUNCTION public.log_quiz_complete();

-- RPC function to get user activities with user details
CREATE OR REPLACE FUNCTION public.get_user_activities(
  p_limit INTEGER DEFAULT 100,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  activity_type TEXT,
  activity_description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ) THEN
    -- If not admin, only return their own activities
    p_user_id := auth.uid();
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    u.email::TEXT as user_email,
    COALESCE(
      (u.raw_user_meta_data->>'name')::TEXT,
      split_part(u.email, '@', 1)::TEXT
    ) as user_name,
    a.activity_type,
    a.activity_description,
    a.ip_address,
    a.user_agent,
    a.metadata,
    a.created_at
  FROM public.user_activities a
  LEFT JOIN auth.users u ON u.id = a.user_id
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$;

-- RPC function to get activity statistics
CREATE OR REPLACE FUNCTION public.get_activity_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSON;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  WITH stats AS (
    SELECT
      COUNT(*) as total_activities,
      COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_activities,
      COUNT(DISTINCT user_id) as active_users
    FROM public.user_activities
  ),
  top_activities AS (
    SELECT
      activity_type,
      COUNT(*) as count
    FROM public.user_activities
    GROUP BY activity_type
    ORDER BY count DESC
    LIMIT 5
  )
  SELECT json_build_object(
    'totalActivities', s.total_activities,
    'todayActivities', s.today_activities,
    'activeUsers', s.active_users,
    'topActivities', (
      SELECT json_agg(
        json_build_object(
          'type', activity_type,
          'count', count
        )
      )
      FROM top_activities
    )
  ) INTO v_stats
  FROM stats s;

  RETURN v_stats;
END;
$$;

-- Insert some initial activity data from existing quiz sessions
INSERT INTO public.user_activities (user_id, activity_type, activity_description, created_at)
SELECT 
  user_id,
  'quiz_start',
  'Started spiritual gifts assessment',
  created_at
FROM public.quiz_sessions
ON CONFLICT DO NOTHING;

INSERT INTO public.user_activities (user_id, activity_type, activity_description, created_at)
SELECT 
  user_id,
  'quiz_complete',
  'Completed spiritual gifts assessment',
  completed_at
FROM public.quiz_sessions
WHERE is_completed = true
AND completed_at IS NOT NULL
ON CONFLICT DO NOTHING;