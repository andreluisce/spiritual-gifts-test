-- Make demographics parameters optional
DROP FUNCTION IF EXISTS public.upsert_user_demographics(UUID, TEXT, TEXT, TEXT, INTEGER, TEXT);
CREATE OR REPLACE FUNCTION public.upsert_user_demographics(
    p_user_id UUID,
    p_country TEXT DEFAULT NULL,
    p_region TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_birth_year INTEGER DEFAULT NULL,
    p_gender TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_demographics (user_id, country, region, city, birth_year, gender, updated_at)
    VALUES (p_user_id, p_country, p_region, p_city, p_birth_year, p_gender, now())
    ON CONFLICT (user_id) DO UPDATE
    SET country = COALESCE(EXCLUDED.country, user_demographics.country),
        region = COALESCE(EXCLUDED.region, user_demographics.region),
        city = COALESCE(EXCLUDED.city, user_demographics.city),
        birth_year = COALESCE(EXCLUDED.birth_year, user_demographics.birth_year),
        gender = COALESCE(EXCLUDED.gender, user_demographics.gender),
        updated_at = now();

    RETURN jsonb_build_object('success', true);
END;
$$;
