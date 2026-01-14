CREATE OR REPLACE FUNCTION public.get_quiz_report(p_session_id UUID)
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
                    CASE qrw.gift::text
                        WHEN 'A_PROPHECY' THEN 'Profecia'
                        WHEN 'B_SERVICE' THEN 'Ministério'
                        WHEN 'C_TEACHING' THEN 'Ensino'
                        WHEN 'D_EXHORTATION' THEN 'Exortação'
                        WHEN 'E_GIVING' THEN 'Contribuição'
                        WHEN 'F_LEADERSHIP' THEN 'Liderança'
                        WHEN 'G_MERCY' THEN 'Misericórdia'
                        ELSE qrw.gift::text
                    END as gift_name,
                    ROW_NUMBER() OVER (ORDER BY qrw.total_weighted DESC) as rank
                FROM quiz_results_weighted qrw
                WHERE qrw.session_id = p_session_id
                ORDER BY qrw.total_weighted DESC
            )
            SELECT COALESCE(json_agg(
                json_build_object(
                    'rank', rank,
                    'gift_key', gift::text,
                    'gift_name', gift_name,
                    'score', total_weighted,
                    'strength', CASE
                        WHEN rank = 1 THEN 'Primário'
                        WHEN rank <= 3 THEN 'Secundário'
                        ELSE 'Presente'
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
                    'gift_category', CASE qp.gift::text
                        WHEN 'A_PROPHECY' THEN 'Profecia'
                        WHEN 'B_SERVICE' THEN 'Ministério'
                        WHEN 'C_TEACHING' THEN 'Ensino'
                        WHEN 'D_EXHORTATION' THEN 'Exortação'
                        WHEN 'E_GIVING' THEN 'Contribuição'
                        WHEN 'F_LEADERSHIP' THEN 'Liderança'
                        WHEN 'G_MERCY' THEN 'Misericórdia'
                        ELSE qp.gift::text
                    END,
                    'answer_value', a.score,
                    'answer_label', CASE a.score
                        WHEN 0 THEN 'Nunca'
                        WHEN 1 THEN 'Raramente'
                        WHEN 2 THEN 'Às vezes'
                        WHEN 3 THEN 'Frequentemente'
                        WHEN 4 THEN 'Sempre'
                        ELSE 'N/A'
                    END
                ) ORDER BY a.question_id
            ), '[]'::json)
            FROM answers a
            LEFT JOIN question_pool qp ON qp.id = a.pool_question_id
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
