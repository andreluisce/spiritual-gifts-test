-- Create comprehensive quiz report function
-- Returns detailed report with questions, answers, gifts analysis, and AI insights

CREATE OR REPLACE FUNCTION public.get_quiz_report(p_session_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    report_data JSON;
    v_user_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Get user_id from session
    SELECT user_id INTO v_user_id
    FROM quiz_sessions
    WHERE id = p_session_id;

    -- Check if requester is admin or the session owner
    v_is_admin := public.is_user_admin_safe();

    IF NOT v_is_admin AND v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: You can only view your own quiz reports';
    END IF;

    -- Build comprehensive report
    SELECT json_build_object(
        'session_info', (
            SELECT json_build_object(
                'session_id', qs.id,
                'user_id', qs.user_id,
                'user_email', u.email,
                'user_name', COALESCE(
                    u.raw_user_meta_data->>'name',
                    u.raw_user_meta_data->>'full_name',
                    split_part(u.email, '@', 1)
                ),
                'started_at', qs.created_at,
                'completed_at', qs.completed_at,
                'is_completed', qs.is_completed,
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
                    CASE qrw.gift
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
            SELECT json_agg(
                json_build_object(
                    'rank', rank,
                    'gift_key', gift,
                    'gift_name', gift_name,
                    'strength', CASE
                        WHEN rank = 1 THEN 'Primário'
                        WHEN rank <= 3 THEN 'Secundário'
                        ELSE 'Presente'
                    END
                ) ORDER BY rank
            )
            FROM ranked_gifts
        ),
        'questions_and_answers', (
            SELECT json_agg(
                json_build_object(
                    'question_number', a.question_id,
                    'question_text', qp.text,
                    'gift_category', CASE qp.gift
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
            )
            FROM answers a
            INNER JOIN question_pool qp ON qp.id = a.pool_question_id
            WHERE a.session_id = p_session_id
        ),
        'ai_insights', (
            -- Get AI-generated content for top 3 gifts
            SELECT json_agg(
                json_build_object(
                    'gift_name', rg.gift_name,
                    'description', gc.description,
                    'biblical_foundation', gc.biblical_foundation,
                    'practical_applications', gc.practical_applications
                ) ORDER BY rg.rank
            )
            FROM (
                SELECT
                    qrw.gift,
                    CASE qrw.gift
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
                LIMIT 3
            ) rg
            LEFT JOIN gift_content gc ON gc.gift_key = rg.gift AND gc.locale = 'pt'
        )
    ) INTO report_data;

    RETURN COALESCE(report_data, '{}'::JSON);
END;
$$;

COMMENT ON FUNCTION public.get_quiz_report IS 'Returns comprehensive quiz report with questions, answers, spiritual gifts analysis, and AI insights';
