-- ============================================================
-- CREATE MISSING upsert_user_demographics RPC FUNCTION
-- ============================================================
-- This migration creates the upsert_user_demographics function
-- that the demographics collection API is trying to call.
--
-- The function maps the API parameters to the profiles table columns.
-- ============================================================

-- Drop existing function if it exists (to allow return type change)
DROP FUNCTION IF EXISTS public.upsert_user_demographics(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION public.upsert_user_demographics(
  p_user_id UUID,
  p_country TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_birth_year INTEGER DEFAULT NULL,
  p_gender TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data JSON;
  calculated_age_range TEXT;
BEGIN
  -- Calculate age_range from birth_year if provided
  IF p_birth_year IS NOT NULL THEN
    calculated_age_range := CASE
      WHEN EXTRACT(YEAR FROM NOW()) - p_birth_year BETWEEN 18 AND 24 THEN '18-24'
      WHEN EXTRACT(YEAR FROM NOW()) - p_birth_year BETWEEN 25 AND 34 THEN '25-34'
      WHEN EXTRACT(YEAR FROM NOW()) - p_birth_year BETWEEN 35 AND 44 THEN '35-44'
      WHEN EXTRACT(YEAR FROM NOW()) - p_birth_year BETWEEN 45 AND 54 THEN '45-54'
      WHEN EXTRACT(YEAR FROM NOW()) - p_birth_year BETWEEN 55 AND 64 THEN '55-64'
      WHEN EXTRACT(YEAR FROM NOW()) - p_birth_year >= 65 THEN '65+'
      ELSE NULL
    END;
  END IF;

  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    age_range,
    country,
    city,
    state_province,
    updated_at
  ) VALUES (
    p_user_id,
    calculated_age_range,
    p_country,
    p_city,
    p_region,  -- region maps to state_province
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    age_range = COALESCE(EXCLUDED.age_range, profiles.age_range),
    country = COALESCE(EXCLUDED.country, profiles.country),
    city = COALESCE(EXCLUDED.city, profiles.city),
    state_province = COALESCE(EXCLUDED.state_province, profiles.state_province),
    updated_at = NOW()
  RETURNING json_build_object(
    'id', id,
    'age_range', age_range,
    'country', country,
    'city', city,
    'state_province', state_province
  ) INTO result_data;
  
  RETURN COALESCE(result_data, '{}'::JSON);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_demographics(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_demographics(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT) TO service_role;

COMMENT ON FUNCTION public.upsert_user_demographics IS 'Upsert user demographics data from the demographics collection API. Maps API parameters to profiles table columns.';
