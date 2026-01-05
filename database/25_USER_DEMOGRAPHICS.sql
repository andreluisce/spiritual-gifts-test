-- This will store geolocation data from IP and age from Google OAuth

-- Helper: safely determine if current user is an admin
-- Looks at user/app metadata flags and fallback email pattern.
CREATE OR REPLACE FUNCTION public.is_user_admin_safe()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_rec RECORD;
    role_list TEXT[];
BEGIN
    SELECT 
        raw_user_meta_data,
        raw_app_meta_data,
        email
    INTO user_rec
    FROM auth.users
    WHERE id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check common admin flags in user metadata
    IF user_rec.raw_user_meta_data ->> 'is_admin' = 'true'
       OR user_rec.raw_user_meta_data ->> 'role' = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Check app metadata flags/roles
    IF user_rec.raw_app_meta_data ->> 'is_admin' = 'true'
       OR user_rec.raw_app_meta_data ->> 'role' = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Array of roles in app metadata
    IF user_rec.raw_app_meta_data ? 'roles' THEN
        role_list := ARRAY(
            SELECT json_array_elements_text(user_rec.raw_app_meta_data -> 'roles')
        );
        IF role_list IS NOT NULL AND 'admin' = ANY(role_list) THEN
            RETURN true;
        END IF;
    END IF;
    
    -- Fallback: email pattern for seeded admin accounts
    IF user_rec.email ILIKE '%@admin.%' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_user_admin_safe() TO authenticated;

CREATE TABLE IF NOT EXISTS public.user_demographics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Location data (from IP geolocation)
    country TEXT,
    region TEXT,
    city TEXT,
    timezone TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Age data (from Google OAuth birth_date)
    birth_date DATE,
    age INTEGER,
    age_group TEXT, -- Computed: '18-24', '25-34', etc.
    
    -- Collection metadata
    ip_address INET,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    data_source TEXT DEFAULT 'auto_collection', -- 'auto_collection', 'manual', 'oauth'
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one demographic record per user
    UNIQUE(user_id)
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_demographics_country ON public.user_demographics(country);
CREATE INDEX IF NOT EXISTS idx_user_demographics_age_group ON public.user_demographics(age_group);
CREATE INDEX IF NOT EXISTS idx_user_demographics_created_at ON public.user_demographics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_demographics_user_id ON public.user_demographics(user_id);

-- Enable RLS
ALTER TABLE public.user_demographics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own demographics" ON public.user_demographics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own demographics" ON public.user_demographics
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all demographics" ON public.user_demographics
    FOR ALL USING (is_user_admin_safe());

-- Function to get or create user demographics
CREATE OR REPLACE FUNCTION public.upsert_user_demographics(
    p_user_id UUID,
    p_country TEXT DEFAULT NULL,
    p_region TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_timezone TEXT DEFAULT NULL,
    p_latitude DECIMAL DEFAULT NULL,
    p_longitude DECIMAL DEFAULT NULL,
    p_birth_date DATE DEFAULT NULL,
    p_age INTEGER DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_data_source TEXT DEFAULT 'auto_collection'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    computed_age_group TEXT;
    result_record RECORD;
BEGIN
    -- Compute age group
    IF p_age IS NOT NULL THEN
        CASE 
            WHEN p_age < 18 THEN computed_age_group := '< 18';
            WHEN p_age < 25 THEN computed_age_group := '18-24';
            WHEN p_age < 35 THEN computed_age_group := '25-34';
            WHEN p_age < 45 THEN computed_age_group := '35-44';
            WHEN p_age < 55 THEN computed_age_group := '45-54';
            WHEN p_age < 65 THEN computed_age_group := '55-64';
            ELSE computed_age_group := '65+';
        END CASE;
    END IF;
    
    -- Upsert demographics data
    INSERT INTO public.user_demographics (
        user_id, country, region, city, timezone, latitude, longitude,
        birth_date, age, age_group, ip_address, data_source, updated_at
    )
    VALUES (
        p_user_id, p_country, p_region, p_city, p_timezone, p_latitude, p_longitude,
        p_birth_date, p_age, computed_age_group, p_ip_address, p_data_source, NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        country = COALESCE(EXCLUDED.country, user_demographics.country),
        region = COALESCE(EXCLUDED.region, user_demographics.region),
        city = COALESCE(EXCLUDED.city, user_demographics.city),
        timezone = COALESCE(EXCLUDED.timezone, user_demographics.timezone),
        latitude = COALESCE(EXCLUDED.latitude, user_demographics.latitude),
        longitude = COALESCE(EXCLUDED.longitude, user_demographics.longitude),
        birth_date = COALESCE(EXCLUDED.birth_date, user_demographics.birth_date),
        age = COALESCE(EXCLUDED.age, user_demographics.age),
        age_group = COALESCE(EXCLUDED.age_group, user_demographics.age_group),
        ip_address = COALESCE(EXCLUDED.ip_address, user_demographics.ip_address),
        data_source = EXCLUDED.data_source,
        updated_at = NOW()
    RETURNING *;
    
    -- Get the updated record
    SELECT * INTO result_record FROM public.user_demographics WHERE user_id = p_user_id;
    
    -- Return as JSON
    RETURN row_to_json(result_record);
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in upsert_user_demographics: % - %', SQLSTATE, SQLERRM;
        RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.upsert_user_demographics TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_demographics TO anon;

-- Function to get demographics analytics for admin
CREATE OR REPLACE FUNCTION public.get_demographics_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    age_stats JSON;
    geo_stats JSON;
    total_users INTEGER;
BEGIN
    -- Check if user is admin
    IF NOT is_user_admin_safe() THEN
        RETURN json_build_object('error', 'Admin access required');
    END IF;
    
    -- Get age distribution
    SELECT json_agg(
        json_build_object(
            'ageRange', age_group,
            'count', count,
            'percentage', ROUND((count::DECIMAL / total_with_age * 100), 1)
        )
        ORDER BY 
            CASE age_group
                WHEN '< 18' THEN 1
                WHEN '18-24' THEN 2
                WHEN '25-34' THEN 3
                WHEN '35-44' THEN 4
                WHEN '45-54' THEN 5
                WHEN '55-64' THEN 6
                WHEN '65+' THEN 7
                ELSE 8
            END
    ) INTO age_stats
    FROM (
        SELECT 
            age_group,
            COUNT(*) as count,
            (SELECT COUNT(*) FROM public.user_demographics WHERE age_group IS NOT NULL) as total_with_age
        FROM public.user_demographics 
        WHERE age_group IS NOT NULL
        GROUP BY age_group
    ) age_data;
    
    -- Get geographic distribution
    SELECT json_agg(
        json_build_object(
            'country', country,
            'count', count,
            'percentage', ROUND((count::DECIMAL / total_with_country * 100), 1)
        )
        ORDER BY count DESC
    ) INTO geo_stats
    FROM (
        SELECT 
            country,
            COUNT(*) as count,
            (SELECT COUNT(*) FROM public.user_demographics WHERE country IS NOT NULL AND country != 'Unknown') as total_with_country
        FROM public.user_demographics 
        WHERE country IS NOT NULL AND country != 'Unknown'
        GROUP BY country
    ) geo_data;
    
    -- Get total users count
    SELECT COUNT(*) INTO total_users FROM public.user_demographics;
    
    RETURN json_build_object(
        'totalUsers', total_users,
        'ageDistribution', COALESCE(age_stats, '[]'::json),
        'geographicDistribution', COALESCE(geo_stats, '[]'::json)
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in get_demographics_analytics: % - %', SQLSTATE, SQLERRM;
        RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_demographics_analytics TO authenticated;

-- Test the functions
SELECT 'Demographics system created successfully' AS status;
