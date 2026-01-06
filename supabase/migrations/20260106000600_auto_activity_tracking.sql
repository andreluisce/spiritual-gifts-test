-- Create helper function to log user activities
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activities (
        user_id,
        activity_type,
        details,
        ip_address,
        user_agent,
        created_at
    ) VALUES (
        p_user_id,
        p_activity_type,
        jsonb_build_object(
            'description', COALESCE(p_description, p_activity_type)
        ) || p_metadata,
        p_ip_address,
        p_user_agent,
        now()
    )
    RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- Create trigger function to auto-log quiz completion
CREATE OR REPLACE FUNCTION public.trigger_log_quiz_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only log when quiz is marked as completed
    IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
        PERFORM log_user_activity(
            NEW.user_id,
            'quiz_complete',
            'Completed spiritual gifts quiz',
            NULL,
            NULL,
            jsonb_build_object('session_id', NEW.id::text)
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger on quiz_sessions
DROP TRIGGER IF EXISTS on_quiz_complete ON quiz_sessions;
CREATE TRIGGER on_quiz_complete
    AFTER UPDATE ON quiz_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_quiz_complete();

COMMENT ON FUNCTION log_user_activity IS 'Helper function to log user activities';
COMMENT ON FUNCTION trigger_log_quiz_complete IS 'Automatically logs quiz completion activities';
