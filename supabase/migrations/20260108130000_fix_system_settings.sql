-- Ensure table exists and has correct structure
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.system_settings;

-- Create Policies
CREATE POLICY "Public read settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (is_admin());

-- Fix schema drift if table existed but without 'key' column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'key') THEN
        ALTER TABLE public.system_settings ADD COLUMN key TEXT;
        ALTER TABLE public.system_settings ADD CONSTRAINT system_settings_key_unique UNIQUE (key);
    END IF;

    -- Ensure unique constraint exists even if column existed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage ccu
        JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
        WHERE ccu.table_name = 'system_settings' AND ccu.column_name = 'key'
        AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
    ) THEN
        BEGIN
            ALTER TABLE public.system_settings ADD CONSTRAINT system_settings_key_unique UNIQUE (key);
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'value') THEN
        ALTER TABLE public.system_settings ADD COLUMN value JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'description') THEN
        ALTER TABLE public.system_settings ADD COLUMN description TEXT;
    END IF;
END $$;

-- Fix data: if there's a row with NULL key, assume it's the settings and set key
UPDATE public.system_settings
SET key = 'APP_SETTINGS'
WHERE key IS NULL
AND id = (SELECT min(id) FROM public.system_settings);

-- Sync sequence if exists to prevent ID collision
DO $$
BEGIN
    -- Only if id column exists (it likely does based on error)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'id') THEN
        -- Try to reset sequence. Might fail if not serial, so we wrap in block
        BEGIN
            PERFORM setval(pg_get_serial_sequence('public.system_settings', 'id'), COALESCE((SELECT max(id) FROM public.system_settings), 0) + 1, false);
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Ignore if no sequence or other error
        END;
    END IF;
END $$;

-- Insert default if not exists
INSERT INTO public.system_settings (key, value, description)
VALUES (
    'APP_SETTINGS',
    '{
        "quiz": {
            "debugMode": false,
            "allowRetake": true,
            "showProgress": true,
            "questionsPerGift": 5,
            "shuffleQuestions": true
        },
        "general": {
            "siteName": "Spiritual Gifts Test",
            "contactEmail": "admin@spiritualgifts.app",
            "defaultLanguage": "pt",
            "enableGuestQuiz": false,
            "maintenanceMode": false,
            "siteDescription": "Discover your spiritual gifts through biblical assessment",
            "enableRegistration": true,
            "requireApproval": false
        },
        "ai": {
            "model": "gpt-3.5-turbo",
            "maxTokens": 1000,
            "autoGenerate": false,
            "showAIButton": false,
            "temperature": 0.7,
            "cacheStrategy": "gift_scores",
            "analysisLanguage": "auto",
            "enableAIAnalysis": false,
            "aiAnalysisDescription": "AI generated analysis of your spiritual gifts",
            "includeBiblicalReferences": true,
            "includeMinistryOpportunities": true,
            "includePersonalDevelopment": true
        }
    }'::jsonb,
    'Main application settings'
) ON CONFLICT (key) DO NOTHING;

-- RPC: get_system_settings
DROP FUNCTION IF EXISTS public.get_system_settings();
CREATE OR REPLACE FUNCTION public.get_system_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    settings_data JSONB;
BEGIN
    -- Check if table has 'key' column to avoid runtime errors if migration failed to fix structure fully
    -- But we assume the DO block above fixed it.
    SELECT value INTO settings_data
    FROM public.system_settings
    WHERE key = 'APP_SETTINGS';

    RETURN settings_data;
END;
$$;

-- RPC: update_system_settings
DROP FUNCTION IF EXISTS public.update_system_settings(JSONB);
CREATE OR REPLACE FUNCTION public.update_system_settings(new_settings JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_value JSONB;
BEGIN
    -- Permission check
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    UPDATE public.system_settings
    SET
        value = new_settings,
        updated_at = now(),
        updated_by = auth.uid()
    WHERE key = 'APP_SETTINGS'
    RETURNING value INTO updated_value;

    RETURN updated_value;
END;
$$;
