-- Ensure permission functions exist
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role_type
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_user_id UUID;
  v_role user_role_type;
  v_meta_role text;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN 'user'::user_role_type;
  END IF;

  -- 1. Try profiles
  SELECT role INTO v_role
  FROM profiles
  WHERE id = v_user_id;

  -- 2. If not found or user, check auth.users metadata for upgrade
  IF v_role IS NULL OR v_role = 'user' THEN
      SELECT raw_user_meta_data->>'role' INTO v_meta_role
      FROM auth.users
      WHERE id = v_user_id;

      IF v_meta_role = 'manager' THEN
          v_role := 'manager'::user_role_type;
      ELSIF v_meta_role = 'admin' THEN
          v_role := 'admin'::user_role_type;
      END IF;
  END IF;

  RETURN COALESCE(v_role, 'user'::user_role_type);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_role user_role_type;
BEGIN
  v_role := get_user_role();
  RETURN v_role IN ('manager', 'admin');
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_manager() TO authenticated;

-- Update get_user_quiz_results to use is_user_manager
CREATE OR REPLACE FUNCTION public.get_user_quiz_results(p_user_id UUID)
RETURNS TABLE (
    session_id uuid,
    started_at timestamptz,
    completed_at timestamptz,
    is_completed boolean,
    total_score numeric,
    gift_results jsonb,
    top_gifts jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Check if user is manager or admin
    IF NOT public.is_user_manager() THEN
        RAISE EXCEPTION 'Access denied: Manager or Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
      qs.id as session_id,
      qs.created_at as started_at,
      qs.completed_at,
      qs.is_completed,
      COALESCE(
        (SELECT SUM(a.score::numeric)
         FROM answers a
         WHERE a.session_id = qs.id),
        0
      ) as total_score,
      COALESCE(
        (SELECT jsonb_object_agg(gift_key, jsonb_build_object('score', total_gift_score))
         FROM (
           SELECT
             qp.gift::text as gift_key,
             SUM(a.score * qp.default_weight) as total_gift_score
           FROM answers a
           INNER JOIN question_pool qp ON qp.id = a.pool_question_id
           WHERE a.session_id = qs.id
           GROUP BY qp.gift
         ) gift_scores
        ),
        '{}'::jsonb
      ) as gift_results,
      COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
              'gift_id', ROW_NUMBER() OVER (ORDER BY total_weighted DESC),
              'gift_name', gift_name,
              'score', total_weighted
            )
          )
          FROM (
            SELECT
              qrw.gift,
              qrw.total_weighted,
              CASE qrw.gift
                WHEN 'A_PROPHECY' THEN 'Profecia'
                WHEN 'B_SERVICE' THEN 'Ministério'
                WHEN 'C_TEACHING' THEN 'Ensino'
                WHEN 'D_EXHORTATION' THEN 'Exortação'
                WHEN 'E_GIVING' THEN 'Contribuição'
                WHEN 'F_LEADERSHIP' THEN 'Liderança'
                WHEN 'G_MERCY' THEN 'Misericórdia'
                ELSE qrw.gift::text
              END as gift_name
            FROM quiz_results_weighted qrw
            WHERE qrw.session_id = qs.id
            ORDER BY qrw.total_weighted DESC
            LIMIT 3
          ) top_3_gifts
        ),
        '[]'::jsonb
      ) as top_gifts
    FROM quiz_sessions qs
    WHERE qs.user_id = p_user_id
    ORDER BY qs.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_quiz_results(UUID) TO authenticated;
