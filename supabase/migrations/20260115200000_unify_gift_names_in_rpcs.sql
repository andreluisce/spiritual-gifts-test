-- Unify spiritual gift names in RPC functions by joining with localized spiritual_gifts table
-- instead of hardcoded CASE statements.

-- 1. Fix get_user_quiz_results to use localized names
CREATE OR REPLACE FUNCTION public.get_user_quiz_results(p_user_id UUID, p_locale TEXT DEFAULT 'pt')
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
              'gift_id', rank_num,
              'gift_name', gift_localized_name,
              'gift_key', gift_key_text,
              'score', total_weighted
            )
          )
          FROM (
            SELECT
              qrw.gift,
              qrw.gift::text as gift_key_text,
              qrw.total_weighted,
              ROW_NUMBER() OVER (ORDER BY qrw.total_weighted DESC) as rank_num,
              COALESCE(sg.name, qrw.gift::text) as gift_localized_name
            FROM quiz_results_weighted qrw
            LEFT JOIN public.spiritual_gifts sg ON sg.gift_key = qrw.gift AND sg.locale = p_locale
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

-- 2. Fix get_gift_distribution to use localized names
CREATE OR REPLACE FUNCTION public.get_gift_distribution(p_locale TEXT DEFAULT 'pt')
RETURNS TABLE (
    gift_id INTEGER,
    gift_name TEXT,
    gift_key TEXT,
    count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_users BIGINT;
BEGIN
    -- Count total users with completed quizzes
    SELECT COUNT(DISTINCT qs.user_id) INTO total_users
    FROM quiz_sessions qs
    WHERE qs.is_completed = true;

    -- For each completed session, find the TOP GIFT (highest score)
    -- Then count how many times each gift is the top gift
    RETURN QUERY
    WITH user_top_gifts AS (
        -- For each completed session, get the gift with highest score
        SELECT DISTINCT ON (qrw.session_id)
            qs.user_id,
            qrw.gift,
            qrw.total_weighted as score
        FROM quiz_results_weighted qrw
        INNER JOIN quiz_sessions qs ON qs.id = qrw.session_id
        WHERE qs.is_completed = true
        ORDER BY qrw.session_id, qrw.total_weighted DESC
    ),
    gift_counts AS (
        -- Count how many users have each gift as their top gift
        SELECT
            utg.gift as gift_key,
            COUNT(*) as gift_count
        FROM user_top_gifts utg
        GROUP BY utg.gift
    )
    SELECT
        ROW_NUMBER() OVER (ORDER BY gc.gift_count DESC)::INTEGER as gift_id,
        COALESCE(sg.name, gc.gift_key::TEXT) as gift_name,
        gc.gift_key::TEXT as gift_key,
        gc.gift_count as count,
        CASE
            WHEN total_users > 0 THEN ROUND((gc.gift_count::NUMERIC / total_users) * 100, 1)
            ELSE 0
        END as percentage
    FROM gift_counts gc
    LEFT JOIN public.spiritual_gifts sg ON sg.gift_key = gc.gift_key AND sg.locale = p_locale
    ORDER BY gc.gift_count DESC;
END;
$$;

-- 3. Update get_comprehensive_analytics_data to pass locale
CREATE OR REPLACE FUNCTION public.get_comprehensive_analytics_data(p_date_range TEXT, p_locale TEXT DEFAULT 'pt')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_overview jsonb;
    v_demographics jsonb;
    v_spiritual_gifts jsonb;
    v_ai_analytics jsonb;
    v_total_users bigint;
    v_active_users bigint;
    v_total_quizzes bigint;
    v_avg_score numeric;
BEGIN
    -- 1. Overview metrics
    SELECT count(*) INTO v_total_users FROM auth.users;

    -- Active users (last 30 days)
    SELECT count(*) INTO v_active_users
    FROM auth.users
    WHERE last_sign_in_at > now() - interval '30 days';

    -- Total quizzes
    SELECT count(*) INTO v_total_quizzes FROM quiz_sessions WHERE is_completed = true;

    v_avg_score := 0;

    v_overview := jsonb_build_object(
        'totalUsers', v_total_users,
        'totalQuizzes', v_total_quizzes,
        'activeUsers', v_active_users,
        'averageScore', v_avg_score
    );

    -- 2. Demographics (Reuse existing function)
    v_demographics := get_demographics_analytics();

    -- 3. Spiritual Gifts (Pass locale)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'giftKey', g.gift_key,
            'giftName', g.gift_name,
            'count', g.count,
            'percentage', g.percentage
        )
    ), '[]'::jsonb)
    INTO v_spiritual_gifts
    FROM get_gift_distribution(p_locale) g;

    -- 4. AI Analytics (Stub)
    v_ai_analytics := jsonb_build_object(
        'totalAnalyses', 0,
        'averageConfidence', 0
    );

    RETURN jsonb_build_object(
        'overview', v_overview,
        'demographics', v_demographics,
        'spiritualGifts', v_spiritual_gifts,
        'aiAnalytics', v_ai_analytics,
        'metadata', jsonb_build_object(
            'generatedAt', now(),
            'dateRange', p_date_range,
            'locale', p_locale
        )
    );
END;
$$;

-- 4. Fix get_quiz_report to use localized gift names and labels
CREATE OR REPLACE FUNCTION public.get_quiz_report(p_session_id UUID, p_locale TEXT DEFAULT 'pt')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    report_data JSON;
    v_user_id UUID;
    v_has_access BOOLEAN := FALSE;
    v_current_user_id UUID;
BEGIN
    -- Get current user safely
    BEGIN
        v_current_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_current_user_id := NULL;
    END;

    -- Check if session exists
    IF NOT EXISTS (SELECT 1 FROM quiz_sessions WHERE id = p_session_id) THEN
        RAISE EXCEPTION 'Quiz session not found: %', p_session_id;
    END IF;

    -- Get user_id from session
    SELECT user_id INTO v_user_id
    FROM quiz_sessions
    WHERE id = p_session_id;

    -- Check if requester is manager or admin (privileged)
    BEGIN
        v_has_access := public.is_user_manager();
    EXCEPTION WHEN OTHERS THEN
        v_has_access := FALSE;
    END;

    -- Check access permissions (Manager/Admin OR Own Report)
    IF NOT v_has_access AND (v_current_user_id IS NULL OR v_user_id != v_current_user_id) THEN
        RAISE EXCEPTION 'Access denied: You can only view your own quiz reports';
    END IF;

    -- Build comprehensive report
    SELECT json_build_object(
        'session_info', (
            SELECT json_build_object(
                'session_id', qs.id,
                'user_id', qs.user_id,
                'user_email', COALESCE(u.email, 'Unknown'),
                'user_name', COALESCE(
                    u.raw_user_meta_data->>'name',
                    u.raw_user_meta_data->>'full_name',
                    split_part(u.email, '@', 1),
                    'Unknown User'
                ),
                'started_at', qs.created_at,
                'completed_at', qs.completed_at,
                'is_completed', COALESCE(qs.is_completed, FALSE),
                'duration_minutes', CASE
                    WHEN qs.completed_at IS NOT NULL AND qs.created_at IS NOT NULL
                    THEN ROUND(EXTRACT(EPOCH FROM (qs.completed_at - qs.created_at)) / 60, 1)
                    ELSE NULL
                END
            )
            FROM quiz_sessions qs
            LEFT JOIN auth.users u ON u.id = qs.user_id
            WHERE qs.id = p_session_id
        ),
        'spiritual_gifts', (
            WITH ranked_gifts AS (
                SELECT
                    qrw.gift,
                    qrw.total_weighted,
                    COALESCE(sg.name, qrw.gift::text) as gift_localized_name,
                    ROW_NUMBER() OVER (ORDER BY qrw.total_weighted DESC) as rank
                FROM quiz_results_weighted qrw
                LEFT JOIN spiritual_gifts sg ON sg.gift_key = qrw.gift AND sg.locale = p_locale
                WHERE qrw.session_id = p_session_id
                ORDER BY qrw.total_weighted DESC
            )
            SELECT COALESCE(json_agg(
                json_build_object(
                    'rank', rank,
                    'gift_key', gift::text,
                    'gift_name', gift_localized_name,
                    'score', total_weighted,
                    'strength', CASE p_locale
                        WHEN 'en' THEN
                            CASE
                                WHEN rank = 1 THEN 'Primary'
                                WHEN rank <= 3 THEN 'Secondary'
                                ELSE 'Present'
                            END
                        WHEN 'es' THEN
                            CASE
                                WHEN rank = 1 THEN 'Primario'
                                WHEN rank <= 3 THEN 'Secundario'
                                ELSE 'Presente'
                            END
                        ELSE
                            CASE
                                WHEN rank = 1 THEN 'Primário'
                                WHEN rank <= 3 THEN 'Secundário'
                                ELSE 'Presente'
                            END
                    END
                ) ORDER BY rank
            ), '[]'::json)
            FROM ranked_gifts
        ),
        'questions_and_answers', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'question_number', a.question_id,
                    'question_text', COALESCE(qp.text, 'Question text not available'),
                    'question_weight', qp.default_weight,
                    'gift_category', COALESCE(sg.name, qp.gift::text),
                    'answer_value', a.score,
                    'answer_label', CASE p_locale
                        WHEN 'en' THEN
                            CASE a.score
                                WHEN 0 THEN 'Never'
                                WHEN 1 THEN 'Rarely'
                                WHEN 2 THEN 'Sometimes'
                                WHEN 3 THEN 'Frequently'
                                WHEN 4 THEN 'Always'
                                ELSE 'N/A'
                            END
                        WHEN 'es' THEN
                            CASE a.score
                                WHEN 0 THEN 'Nunca'
                                WHEN 1 THEN 'Raramente'
                                WHEN 2 THEN 'A veces'
                                WHEN 3 THEN 'Frecuentemente'
                                WHEN 4 THEN 'Siempre'
                                ELSE 'N/A'
                            END
                        ELSE
                            CASE a.score
                                WHEN 0 THEN 'Nunca'
                                WHEN 1 THEN 'Raramente'
                                WHEN 2 THEN 'Às vezes'
                                WHEN 3 THEN 'Frequentemente'
                                WHEN 4 THEN 'Sempre'
                                ELSE 'N/A'
                            END
                    END
                ) ORDER BY a.question_id
            ), '[]'::json)
            FROM answers a
            LEFT JOIN question_pool qp ON qp.id = a.pool_question_id
            LEFT JOIN spiritual_gifts sg ON sg.gift_key = qp.gift AND sg.locale = p_locale
            WHERE a.session_id = p_session_id
        ),
        'ai_insights', '[]'::json
    ) INTO report_data;

    RETURN COALESCE(report_data, '{}'::JSON);
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error generating quiz report: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;
