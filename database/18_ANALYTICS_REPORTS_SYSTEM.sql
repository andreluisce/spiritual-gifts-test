-- ============================================================================
-- ANALYTICS REPORTS SYSTEM
-- ============================================================================
-- This file creates the infrastructure for generating and managing analytics reports

-- Create reports table
CREATE TABLE IF NOT EXISTS public.analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('overview', 'spiritual_gifts', 'demographics', 'ai_analytics', 'comprehensive')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'csv', 'json')),
    date_range VARCHAR(10) NOT NULL CHECK (date_range IN ('7d', '30d', '90d', '1y', 'all')),
    data JSONB NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    generated_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed', 'expired')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user ON public.analytics_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON public.analytics_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_status ON public.analytics_reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_created ON public.analytics_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_expires ON public.analytics_reports(expires_at);

-- Enable RLS
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_reports
-- Only admins can access reports
CREATE POLICY "Admins can view all reports" 
ON public.analytics_reports FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
);

CREATE POLICY "Admins can insert reports" 
ON public.analytics_reports FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
);

CREATE POLICY "Admins can update reports" 
ON public.analytics_reports FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
);

CREATE POLICY "Admins can delete reports" 
ON public.analytics_reports FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
);

-- Function to clean up expired reports
CREATE OR REPLACE FUNCTION public.cleanup_expired_reports()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.analytics_reports 
    WHERE expires_at < NOW() 
    AND status != 'generating';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to get comprehensive analytics data for reports
CREATE OR REPLACE FUNCTION public.get_comprehensive_analytics_data(p_date_range TEXT DEFAULT '30d')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    overview_stats JSONB;
    gift_distribution JSONB;
    ai_stats JSONB;
    user_stats JSONB;
    date_filter TIMESTAMP;
BEGIN
    -- Calculate date filter
    CASE p_date_range
        WHEN '7d' THEN date_filter := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN date_filter := NOW() - INTERVAL '30 days';
        WHEN '90d' THEN date_filter := NOW() - INTERVAL '90 days';
        WHEN '1y' THEN date_filter := NOW() - INTERVAL '1 year';
        ELSE date_filter := '1900-01-01'::TIMESTAMP;
    END CASE;

    -- Get overview statistics
    SELECT jsonb_build_object(
        'totalQuizzes', COUNT(DISTINCT qs.id),
        'totalUsers', COUNT(DISTINCT qs.user_id),
        'completedQuizzes', COUNT(DISTINCT CASE WHEN qs.is_completed = true THEN qs.id END),
        'averageScore', COALESCE(AVG(
            CASE WHEN qs.is_completed = true THEN 
                (SELECT AVG((value->>'score')::INTEGER) 
                 FROM jsonb_each(qs.gift_scores) 
                 WHERE (value->>'score')::INTEGER > 0)
            END
        ), 0),
        'completionRate', 
        CASE 
            WHEN COUNT(qs.id) > 0 THEN 
                (COUNT(CASE WHEN qs.is_completed = true THEN 1 END)::DECIMAL / COUNT(qs.id)::DECIMAL) * 100
            ELSE 0
        END,
        'dateRange', p_date_range,
        'generatedAt', NOW()
    ) INTO overview_stats
    FROM public.quiz_sessions qs
    WHERE qs.created_at >= date_filter;

    -- Get spiritual gifts distribution
    SELECT jsonb_agg(
        jsonb_build_object(
            'giftKey', gift_data.key,
            'giftName', gift_data.key,
            'count', gift_data.count,
            'percentage', gift_data.percentage
        ) ORDER BY gift_data.count DESC
    ) INTO gift_distribution
    FROM (
        SELECT 
            jsonb_object_keys(qs.gift_scores) as key,
            COUNT(*) as count,
            (COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM public.quiz_sessions WHERE is_completed = true AND created_at >= date_filter)::DECIMAL) * 100 as percentage
        FROM public.quiz_sessions qs
        WHERE qs.is_completed = true 
        AND qs.created_at >= date_filter
        AND qs.gift_scores IS NOT NULL
        GROUP BY jsonb_object_keys(qs.gift_scores)
    ) as gift_data;

    -- Get AI analytics if available
    SELECT jsonb_build_object(
        'totalAnalyses', COUNT(*),
        'cacheHits', COUNT(CASE WHEN ai_service_used = 'client-ai' THEN 1 END),
        'apiCalls', COUNT(CASE WHEN ai_service_used != 'client-ai' THEN 1 END),
        'uniqueUsers', COUNT(DISTINCT user_id),
        'avgConfidence', COALESCE(AVG(confidence_score), 0)
    ) INTO ai_stats
    FROM public.ai_analysis_cache
    WHERE created_at >= date_filter;

    -- Get user statistics
    SELECT jsonb_build_object(
        'totalUsers', COUNT(*),
        'newUsers', COUNT(CASE WHEN created_at >= date_filter THEN 1 END),
        'activeUsers', COUNT(CASE 
            WHEN id IN (
                SELECT DISTINCT user_id 
                FROM public.quiz_sessions 
                WHERE created_at >= date_filter
            ) THEN 1 END
        )
    ) INTO user_stats
    FROM auth.users;

    -- Build final result
    result := jsonb_build_object(
        'overview', overview_stats,
        'spiritualGifts', COALESCE(gift_distribution, '[]'::jsonb),
        'aiAnalytics', COALESCE(ai_stats, '{}'::jsonb),
        'userStatistics', COALESCE(user_stats, '{}'::jsonb),
        'metadata', jsonb_build_object(
            'dateRange', p_date_range,
            'generatedAt', NOW(),
            'totalDataPoints', jsonb_array_length(COALESCE(gift_distribution, '[]'::jsonb))
        )
    );

    RETURN result;
END;
$$;

-- Function to record report download
CREATE OR REPLACE FUNCTION public.record_report_download(p_report_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.analytics_reports
    SET 
        download_count = download_count + 1,
        last_downloaded_at = NOW()
    WHERE id = p_report_id;
    
    RETURN FOUND;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_reports TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_reports() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_comprehensive_analytics_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_report_download(UUID) TO authenticated;

-- Print completion message
SELECT 'Analytics reports system created successfully' AS status;