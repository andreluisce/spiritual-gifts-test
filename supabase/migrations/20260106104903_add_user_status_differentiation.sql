-- ============================================================
-- ADD USER STATUS DIFFERENTIATION
-- ============================================================
-- This migration adds proper user status management:
-- 1. status column: active/inactive/suspended (manual configuration)
-- 2. recently_active: based on last_sign_in_at (automatic)
--
-- This allows us to distinguish between:
-- - Users with active accounts who haven't logged in recently
-- - Users whose accounts are manually disabled/suspended
-- ============================================================

-- 1. Add status column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'suspended'));

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 3. Update all existing users to 'active' status
UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- 4. Add comment for documentation
COMMENT ON COLUMN public.profiles.status IS 'Manual user account status: active (normal), inactive (disabled), suspended (temporarily blocked)';

-- 5. Update get_admin_stats to include differentiated metrics
DROP FUNCTION IF EXISTS public.get_admin_stats();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
    totalUsers BIGINT,
    activeUsers BIGINT,              -- Users with status = 'active'
    inactiveUsers BIGINT,            -- Users with status = 'inactive' or 'suspended'
    recentlyActiveUsers BIGINT,      -- Users who logged in within last 30 days
    dormantUsers BIGINT,             -- Active status but no login in 30+ days
    adminUsers BIGINT,
    newUsersThisMonth BIGINT,
    totalQuizzes BIGINT,
    completedToday BIGINT,
    averageScore NUMERIC,
    mostPopularGift TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Total users from auth.users
        (SELECT count(*) FROM auth.users),

        -- Active users (by status in profiles)
        (SELECT count(*)
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.id = au.id
         WHERE COALESCE(p.status, 'active') = 'active'),

        -- Inactive/suspended users (by status)
        (SELECT count(*)
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.id = au.id
         WHERE p.status IN ('inactive', 'suspended')),

        -- Recently active users (logged in within last 30 days, regardless of status)
        (SELECT count(*)
         FROM auth.users au
         WHERE au.last_sign_in_at > now() - interval '30 days'),

        -- Dormant users (status = active but haven't logged in for 30+ days)
        (SELECT count(*)
         FROM auth.users au
         LEFT JOIN public.profiles p ON p.id = au.id
         WHERE COALESCE(p.status, 'active') = 'active'
         AND (au.last_sign_in_at IS NULL OR au.last_sign_in_at <= now() - interval '30 days')),

        -- Admin users
        (SELECT count(*) FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'),

        -- New users this month
        (SELECT count(*) FROM auth.users WHERE created_at > date_trunc('month', now())),

        -- Total completed quizzes
        (SELECT count(*) FROM quiz_sessions WHERE is_completed = true),

        -- Quizzes completed today
        (SELECT count(*) FROM quiz_sessions WHERE is_completed = true AND completed_at > date_trunc('day', now())),

        -- Average score across all completed quizzes
        (SELECT COALESCE(AVG(total_weighted), 0)
         FROM quiz_results_weighted qr
         JOIN quiz_sessions qs ON qr.session_id = qs.id
         WHERE qs.is_completed = true),

        -- Most popular gift
        (
            SELECT COALESCE(
                (
                    SELECT gift_name
                    FROM (
                        SELECT
                            CASE qr.gift
                                WHEN 'A_PROPHECY' THEN 'Prophecy'
                                WHEN 'B_SERVICE' THEN 'Service'
                                WHEN 'C_TEACHING' THEN 'Teaching'
                                WHEN 'D_EXHORTATION' THEN 'Exhortation'
                                WHEN 'E_GIVING' THEN 'Giving'
                                WHEN 'F_LEADERSHIP' THEN 'Leadership'
                                WHEN 'G_MERCY' THEN 'Mercy'
                                ELSE 'Unknown'
                            END as gift_name,
                            count(*) as gift_count
                        FROM quiz_results_weighted qr
                        JOIN quiz_sessions qs ON qr.session_id = qs.id
                        WHERE qs.is_completed = true
                        GROUP BY qr.gift
                        ORDER BY gift_count DESC
                        LIMIT 1
                    ) top_gift
                ),
                'N/A'
            )
        );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- 6. Create helper function to update user status (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
    target_user_id UUID,
    new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT public.is_user_admin_safe() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Validate status
    IF new_status NOT IN ('active', 'inactive', 'suspended') THEN
        RAISE EXCEPTION 'Invalid status. Must be: active, inactive, or suspended';
    END IF;

    -- Update or insert profile
    INSERT INTO public.profiles (id, status, created_at, updated_at)
    VALUES (target_user_id, new_status, now(), now())
    ON CONFLICT (id) DO UPDATE
    SET status = new_status, updated_at = now();

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_status(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_set_user_status IS 'Admin function to manually set user account status (active/inactive/suspended)';
