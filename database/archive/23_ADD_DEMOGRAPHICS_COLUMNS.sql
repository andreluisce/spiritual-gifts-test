-- =========================================================
-- ADD DEMOGRAPHICS COLUMNS TO EXISTING PROFILES TABLE
-- =========================================================

-- Add new columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS age_range TEXT CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_province TEXT;

-- Update the existing demographics functions to work with the correct table structure
DROP FUNCTION IF EXISTS public.get_age_demographics();
DROP FUNCTION IF EXISTS public.get_geographic_distribution();

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_age_demographics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_age_demographics() TO anon;
GRANT EXECUTE ON FUNCTION public.get_geographic_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_geographic_distribution() TO anon;