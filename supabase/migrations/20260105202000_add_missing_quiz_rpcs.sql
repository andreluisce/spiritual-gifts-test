-- =========================================================
-- ADD: get_user_results_data and get_latest_result_data
-- Fixed to handle empty result sets properly
-- =========================================================

-- Drop previous versions to clean up
DROP FUNCTION IF EXISTS public.get_user_results_with_scores(uuid);
DROP FUNCTION IF EXISTS public.get_user_results_with_scores(text);
DROP FUNCTION IF EXISTS public.get_latest_user_result(uuid);
DROP FUNCTION IF EXISTS public.get_latest_user_result(text);
DROP FUNCTION IF EXISTS public.get_user_results_data(text);
DROP FUNCTION IF EXISTS public.get_latest_result_data(text);

-- get_user_results_data (fixed aggregation)
CREATE OR REPLACE FUNCTION public.get_user_results_data(p_user_id text)
RETURNS TABLE (
  session_id uuid,
  created_at timestamptz,
  total_scores jsonb,
  top_gifts_keys text[],
  top_gifts_names text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_uuid uuid;
BEGIN
  -- Safe cast text to uuid
  BEGIN
    v_user_uuid := p_user_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If invalid UUID, return empty result
    RETURN;
  END;

  RETURN QUERY
  SELECT
    qs.id as session_id,
    qs.created_at,
    COALESCE(jsonb_object_agg(r.gift_key, r.total_weighted) FILTER (WHERE r.gift_key IS NOT NULL), '{}'::jsonb) as total_scores,
    COALESCE(array_agg(r.gift_key ORDER BY r.total_weighted DESC) FILTER (WHERE r.gift_key IS NOT NULL), ARRAY[]::text[])::text[] as top_gifts_keys,
    COALESCE(array_agg(COALESCE(sg.name, r.gift_key) ORDER BY r.total_weighted DESC) FILTER (WHERE r.gift_key IS NOT NULL), ARRAY[]::text[])::text[] as top_gifts_names
  FROM public.quiz_sessions qs
  LEFT JOIN LATERAL (
    SELECT
      res.gift::text as gift_key,
      res.total_weighted
    FROM public.calculate_quiz_result(qs.id) res
  ) r ON true
  LEFT JOIN public.spiritual_gifts sg ON sg.gift_key = r.gift_key::public.gift_key AND sg.locale = 'pt'
  WHERE qs.user_id = v_user_uuid
    AND qs.is_completed = true
  GROUP BY qs.id, qs.created_at
  ORDER BY qs.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_results_data(text) IS 'Fetches all completed quiz results for a user with computed scores and top gifts.';

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION public.get_user_results_data(text) TO anon, authenticated, service_role;

-- get_latest_result_data
CREATE OR REPLACE FUNCTION public.get_latest_result_data(p_user_id text)
RETURNS TABLE (
  session_id uuid,
  created_at timestamptz,
  total_scores jsonb,
  top_gifts_keys text[],
  top_gifts_names text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.get_user_results_data(p_user_id)
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.get_latest_result_data(text) IS 'Fetches the most recent completed quiz result for a user.';

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION public.get_latest_result_data(text) TO anon, authenticated, service_role;
