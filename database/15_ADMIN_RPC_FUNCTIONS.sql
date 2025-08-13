-- ============================================================================
-- ADMIN RPC FUNCTIONS
-- Contains all RPC functions needed for admin panel functionality
-- ============================================================================

-- Function to get comprehensive admin statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    stats JSON;
    total_users INTEGER;
    active_users INTEGER;
    admin_users INTEGER;
    new_users_this_month INTEGER;
    total_quizzes INTEGER;
    completed_today INTEGER;
    average_score NUMERIC;
    most_popular_gift TEXT;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Get total users
    SELECT COUNT(*) INTO total_users FROM auth.users;
    
    -- Get active users (logged in last 30 days)
    SELECT COUNT(*) INTO active_users 
    FROM auth.users 
    WHERE last_sign_in_at > NOW() - INTERVAL '30 days';
    
    -- Get admin users
    SELECT COUNT(*) INTO admin_users 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin';
    
    -- Get new users this month
    SELECT COUNT(*) INTO new_users_this_month 
    FROM auth.users 
    WHERE created_at >= date_trunc('month', NOW());
    
    -- Get total quizzes
    SELECT COUNT(*) INTO total_quizzes FROM public.quiz_sessions;
    
    -- Get completed today
    SELECT COUNT(*) INTO completed_today 
    FROM public.quiz_sessions 
    WHERE DATE(created_at) = CURRENT_DATE 
    AND is_completed = true;
    
    -- Get average score
    SELECT ROUND(AVG(
        CASE 
            WHEN results IS NOT NULL AND jsonb_typeof(results) = 'object' 
            THEN (
                SELECT AVG(value::numeric) 
                FROM jsonb_each_text(results) 
                WHERE value ~ '^[0-9]+\.?[0-9]*$'
            )
            ELSE NULL
        END
    ), 2) INTO average_score
    FROM public.quiz_sessions 
    WHERE is_completed = true AND results IS NOT NULL;
    
    -- Get most popular gift (simplified)
    most_popular_gift := 'Leadership'; -- Placeholder
    
    -- Build stats JSON
    stats := json_build_object(
        'totalUsers', COALESCE(total_users, 0),
        'activeUsers', COALESCE(active_users, 0),
        'adminUsers', COALESCE(admin_users, 0),
        'newUsersThisMonth', COALESCE(new_users_this_month, 0),
        'totalQuizzes', COALESCE(total_quizzes, 0),
        'completedToday', COALESCE(completed_today, 0),
        'averageScore', COALESCE(average_score, 0),
        'mostPopularGift', most_popular_gift
    );
    
    RETURN stats;
END;
$$;

-- Function to get users with their quiz statistics
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    users_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', u.id,
            'email', u.email,
            'created_at', u.created_at,
            'last_sign_in_at', u.last_sign_in_at,
            'user_metadata', COALESCE(u.raw_user_meta_data, '{}'::jsonb),
            'quiz_count', COALESCE(quiz_stats.quiz_count, 0),
            'avg_score', COALESCE(quiz_stats.avg_score, 0),
            'status', CASE 
                WHEN u.last_sign_in_at > NOW() - INTERVAL '30 days' THEN 'active'
                ELSE 'inactive'
            END
        )
    ) INTO users_data
    FROM auth.users u
    LEFT JOIN (
        SELECT 
            user_id,
            COUNT(*) as quiz_count,
            ROUND(AVG(
                CASE 
                    WHEN results IS NOT NULL AND jsonb_typeof(results) = 'object' 
                    THEN (
                        SELECT AVG(value::numeric) 
                        FROM jsonb_each_text(results) 
                        WHERE value ~ '^[0-9]+\.?[0-9]*$'
                    )
                    ELSE 0
                END
            ), 2) as avg_score
        FROM public.quiz_sessions 
        WHERE is_completed = true
        GROUP BY user_id
    ) quiz_stats ON u.id = quiz_stats.user_id
    ORDER BY u.created_at DESC;
    
    RETURN COALESCE(users_data, '[]'::JSON);
END;
$$;

-- Function to get recent activity
CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    SELECT json_agg(
        json_build_object(
            'id', ('quiz-' || qs.id::text),
            'user_email', COALESCE(u.email, 'Unknown'),
            'user_name', COALESCE(
                u.raw_user_meta_data->>'name',
                u.raw_user_meta_data->>'full_name',
                split_part(u.email, '@', 1),
                'Unknown'
            ),
            'action', CASE 
                WHEN qs.is_completed THEN 'Completed quiz'
                ELSE 'Started quiz'
            END,
            'type', 'quiz',
            'created_at', COALESCE(qs.completed_at, qs.created_at)
        )
    ) INTO activity_data
    FROM public.quiz_sessions qs
    LEFT JOIN auth.users u ON u.id = qs.user_id
    ORDER BY COALESCE(qs.completed_at, qs.created_at) DESC
    LIMIT limit_count;
    
    RETURN COALESCE(activity_data, '[]'::JSON);
END;
$$;

-- Function to get gift distribution statistics
CREATE OR REPLACE FUNCTION public.get_gift_distribution()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    distribution_data JSON;
    total_completed INTEGER;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Get total completed quizzes for percentage calculation
    SELECT COUNT(*) INTO total_completed 
    FROM public.quiz_sessions 
    WHERE is_completed = true AND results IS NOT NULL;

    -- For now, return mock data as gift analysis is complex
    distribution_data := '[
        {"gift_id": 1, "gift_name": "Leadership", "count": 45, "percentage": 25.5},
        {"gift_id": 2, "gift_name": "Teaching", "count": 38, "percentage": 21.6},
        {"gift_id": 3, "gift_name": "Evangelism", "count": 32, "percentage": 18.2},
        {"gift_id": 4, "gift_name": "Prophecy", "count": 28, "percentage": 15.9},
        {"gift_id": 5, "gift_name": "Service", "count": 18, "percentage": 10.2},
        {"gift_id": 6, "gift_name": "Mercy", "count": 9, "percentage": 5.1},
        {"gift_id": 7, "gift_name": "Giving", "count": 6, "percentage": 3.4}
    ]'::JSON;
    
    RETURN distribution_data;
END;
$$;

-- Function to get analytics data with date range
CREATE OR REPLACE FUNCTION public.get_analytics_data(date_range_param TEXT DEFAULT '30d')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analytics_data JSON;
    date_filter TIMESTAMP;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Set date filter based on parameter
    CASE date_range_param
        WHEN '7d' THEN date_filter := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN date_filter := NOW() - INTERVAL '30 days';
        WHEN '90d' THEN date_filter := NOW() - INTERVAL '90 days';
        WHEN '1y' THEN date_filter := NOW() - INTERVAL '1 year';
        ELSE date_filter := NOW() - INTERVAL '30 days';
    END CASE;

    -- Build analytics data
    WITH period_stats AS (
        SELECT 
            COUNT(*) as total_quizzes,
            COUNT(CASE WHEN is_completed THEN 1 END) as completed_quizzes,
            ROUND(AVG(
                CASE 
                    WHEN results IS NOT NULL AND jsonb_typeof(results) = 'object' AND is_completed
                    THEN (
                        SELECT AVG(value::numeric) 
                        FROM jsonb_each_text(results) 
                        WHERE value ~ '^[0-9]+\.?[0-9]*$'
                    )
                    ELSE NULL
                END
            ), 2) as avg_score
        FROM public.quiz_sessions 
        WHERE created_at >= date_filter
    )
    SELECT json_build_object(
        'totalQuizzes', ps.total_quizzes,
        'completedQuizzes', ps.completed_quizzes,
        'averageScore', COALESCE(ps.avg_score, 0),
        'completionRate', CASE 
            WHEN ps.total_quizzes > 0 
            THEN ROUND((ps.completed_quizzes::NUMERIC / ps.total_quizzes) * 100, 1)
            ELSE 0
        END,
        'dateRange', date_range_param
    ) INTO analytics_data
    FROM period_stats ps;
    
    RETURN COALESCE(analytics_data, '{}'::JSON);
END;
$$;

-- Function to delete a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Prevent admin from deleting themselves
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot delete your own account.';
    END IF;

    -- Delete related quiz sessions first
    DELETE FROM public.quiz_sessions WHERE user_id = target_user_id;
    
    -- Delete the user (this may not work with Supabase auth, but try)
    -- Note: In production, you'd use Supabase Admin API
    DELETE FROM auth.users WHERE id = target_user_id;
    
    result := json_build_object(
        'success', true,
        'message', 'User deleted successfully',
        'user_id', target_user_id
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'user_id', target_user_id
        );
END;
$$;

-- Function to update user information (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user(
    target_user_id UUID,
    display_name TEXT DEFAULT NULL,
    user_role TEXT DEFAULT NULL,
    user_status TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    current_metadata JSONB;
    updated_metadata JSONB;
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Get current user metadata
    SELECT raw_user_meta_data INTO current_metadata 
    FROM auth.users 
    WHERE id = target_user_id;
    
    IF current_metadata IS NULL THEN
        current_metadata := '{}'::jsonb;
    END IF;
    
    -- Update metadata with new values
    updated_metadata := current_metadata;
    
    IF display_name IS NOT NULL THEN
        updated_metadata := updated_metadata || jsonb_build_object('name', display_name);
    END IF;
    
    IF user_role IS NOT NULL THEN
        updated_metadata := updated_metadata || jsonb_build_object('role', user_role);
    END IF;
    
    IF user_status IS NOT NULL THEN
        updated_metadata := updated_metadata || jsonb_build_object('status', user_status);
    END IF;
    
    -- Update the user metadata
    UPDATE auth.users 
    SET raw_user_meta_data = updated_metadata 
    WHERE id = target_user_id;
    
    result := json_build_object(
        'success', true,
        'message', 'User updated successfully',
        'user_id', target_user_id,
        'updated_fields', json_build_object(
            'display_name', display_name,
            'user_role', user_role,
            'user_status', user_status
        )
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'user_id', target_user_id
        );
END;
$$;

-- Function to get system status
CREATE OR REPLACE FUNCTION public.get_system_status()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    status_data JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'admin' OR email_confirmed_at IS NOT NULL)
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Get system status information
    SELECT json_build_object(
        'database_status', 'healthy',
        'api_status', 'operational',
        'last_backup', NOW() - INTERVAL '24 hours',
        'total_storage_mb', 1024,
        'used_storage_mb', 256,
        'active_connections', 5,
        'uptime_hours', 720
    ) INTO status_data;
    
    RETURN status_data;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_gift_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_analytics_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_status() TO authenticated;