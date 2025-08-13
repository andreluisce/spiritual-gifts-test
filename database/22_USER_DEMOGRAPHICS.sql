-- =========================================================
-- USER DEMOGRAPHICS - AGE AND LOCATION FIELDS
-- =========================================================

-- Add demographics columns to profiles table (if it exists)
-- First check if profiles table exists, if not we'll store in user metadata

-- Create a profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  age_range TEXT CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
  country TEXT,
  city TEXT,
  state_province TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to get age demographics
CREATE OR REPLACE FUNCTION public.get_age_demographics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demographics_data JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'age_range', age_range,
      'count', user_count,
      'percentage', percentage
    )
  ) INTO demographics_data
  FROM (
    WITH age_groups AS (
      SELECT 
        COALESCE(p.age_range, 'Unknown') as age_range,
        COUNT(*) as user_count
      FROM auth.users u
      LEFT JOIN public.profiles p ON p.id = u.id
      GROUP BY p.age_range
    ),
    total AS (
      SELECT COUNT(*) as total_users FROM auth.users
    )
    SELECT 
      age_range,
      user_count,
      CASE 
        WHEN (SELECT total_users FROM total) > 0 
        THEN ROUND((user_count::NUMERIC / (SELECT total_users FROM total) * 100), 1)
        ELSE 0
      END as percentage
    FROM age_groups
    ORDER BY 
      CASE age_range
        WHEN '18-24' THEN 1
        WHEN '25-34' THEN 2
        WHEN '35-44' THEN 3
        WHEN '45-54' THEN 4
        WHEN '55-64' THEN 5
        WHEN '65+' THEN 6
        ELSE 7
      END
  ) demographic_stats;
  
  RETURN COALESCE(demographics_data, '[]'::JSON);
END;
$$;

-- Function to get geographic distribution
CREATE OR REPLACE FUNCTION public.get_geographic_distribution()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  geographic_data JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'country', country,
      'count', user_count,
      'percentage', percentage,
      'cities', cities
    )
  ) INTO geographic_data
  FROM (
    WITH country_stats AS (
      SELECT 
        COALESCE(p.country, 'Unknown') as country,
        COUNT(*) as user_count,
        json_agg(DISTINCT p.city) FILTER (WHERE p.city IS NOT NULL) as cities
      FROM auth.users u
      LEFT JOIN public.profiles p ON p.id = u.id
      GROUP BY p.country
    ),
    total AS (
      SELECT COUNT(*) as total_users FROM auth.users
    )
    SELECT 
      country,
      user_count,
      CASE 
        WHEN (SELECT total_users FROM total) > 0 
        THEN ROUND((user_count::NUMERIC / (SELECT total_users FROM total) * 100), 1)
        ELSE 0
      END as percentage,
      COALESCE(cities, '[]'::JSON) as cities
    FROM country_stats
    ORDER BY user_count DESC
    LIMIT 10
  ) geographic_stats;
  
  RETURN COALESCE(geographic_data, '[]'::JSON);
END;
$$;

-- Function to upsert user profile
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_birth_date DATE DEFAULT NULL,
  p_age_range TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state_province TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data JSON;
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    birth_date,
    age_range,
    country,
    city,
    state_province,
    updated_at
  ) VALUES (
    auth.uid(),
    p_birth_date,
    p_age_range,
    p_country,
    p_city,
    p_state_province,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
    age_range = COALESCE(EXCLUDED.age_range, profiles.age_range),
    country = COALESCE(EXCLUDED.country, profiles.country),
    city = COALESCE(EXCLUDED.city, profiles.city),
    state_province = COALESCE(EXCLUDED.state_province, profiles.state_province),
    updated_at = NOW()
  RETURNING json_build_object(
    'id', id,
    'birth_date', birth_date,
    'age_range', age_range,
    'country', country,
    'city', city,
    'state_province', state_province
  ) INTO result_data;
  
  RETURN result_data;
END;
$$;

-- Function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'email', u.email,
    'name', COALESCE(
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1)
    ),
    'birth_date', p.birth_date,
    'age_range', p.age_range,
    'country', p.country,
    'city', p.city,
    'state_province', p.state_province,
    'created_at', COALESCE(p.created_at, u.created_at)
  ) INTO profile_data
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = auth.uid();
  
  RETURN COALESCE(profile_data, '{}'::JSON);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_age_demographics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_age_demographics() TO anon;
GRANT EXECUTE ON FUNCTION public.get_geographic_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_geographic_distribution() TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(DATE, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile() TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;