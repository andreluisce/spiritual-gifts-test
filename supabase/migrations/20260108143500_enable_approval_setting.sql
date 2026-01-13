DO $$
DECLARE
    current_settings JSONB;
BEGIN
    SELECT value INTO current_settings
    FROM public.system_settings
    WHERE key = 'APP_SETTINGS';

    -- Update requireApproval to true
    current_settings := jsonb_set(current_settings, '{general, requireApproval}', 'true');

    UPDATE public.system_settings
    SET value = current_settings, updated_at = now()
    WHERE key = 'APP_SETTINGS';
END $$;
