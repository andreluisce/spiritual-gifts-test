-- record_report_download
CREATE OR REPLACE FUNCTION public.record_report_download(p_report_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_activities (user_id, activity_type, details)
    VALUES (auth.uid(), 'report_download', jsonb_build_object('report_id', p_report_id));
END;
$$;
