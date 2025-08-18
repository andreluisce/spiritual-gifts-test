-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================================
-- This file creates the system_settings table for storing global application
-- configuration including quiz settings, general settings, and advanced options.

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- Create system_settings table
CREATE TABLE public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL DEFAULT '{
        "quiz": {
            "questionsPerGift": {
                "prophecy": 5,
                "ministry": 5,
                "teaching": 5,
                "exhortation": 5,
                "giving": 5,
                "administration": 5,
                "mercy": 5,
                "apostle": 3,
                "prophet": 3,
                "evangelist": 3,
                "pastor": 3,
                "teacher": 3,
                "wisdom": 3,
                "knowledge": 3,
                "faith": 3,
                "healing": 3,
                "miracles": 3,
                "discernment": 3,
                "tongues": 3,
                "interpretation": 3
            },
            "timeLimit": 30,
            "shuffleQuestions": true,
            "showProgress": true,
            "allowRetake": true
        },
        "general": {
            "siteName": "Spiritual Gifts Test",
            "siteDescription": "Discover your spiritual gifts through biblical assessment",
            "enableRegistration": true,
            "enableGuestQuiz": false,
            "maintenanceMode": false,
            "contactEmail": "admin@spiritualgifts.app"
        },
        "advanced": {
            "analyticsEnabled": true,
            "cacheTimeout": 300,
            "maxConcurrentUsers": 1000,
            "backupInterval": 24,
            "debugMode": false
        }
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint to ensure only one settings record exists
ALTER TABLE public.system_settings 
ADD CONSTRAINT single_settings_record CHECK (id = 1);

-- Create index on settings JSONB column for better query performance
CREATE INDEX IF NOT EXISTS idx_system_settings_quiz_config 
ON public.system_settings USING GIN ((settings->'quiz'));

CREATE INDEX IF NOT EXISTS idx_system_settings_general_config 
ON public.system_settings USING GIN ((settings->'general'));

-- Insert default settings
INSERT INTO public.system_settings (id, settings) 
VALUES (1, DEFAULT)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_settings
-- Allow all authenticated users to read settings
CREATE POLICY "Allow authenticated users to read system settings" 
ON public.system_settings FOR SELECT 
TO authenticated 
USING (true);

-- Only allow admins to update settings
CREATE POLICY "Allow admins to update system settings" 
ON public.system_settings FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
);

-- Only allow admins to insert settings (shouldn't be needed due to constraint)
CREATE POLICY "Allow admins to insert system settings" 
ON public.system_settings FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the timestamp
DROP TRIGGER IF EXISTS update_system_settings_timestamp_trigger ON public.system_settings;
CREATE TRIGGER update_system_settings_timestamp_trigger
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_timestamp();

-- Helper function to get system settings
CREATE OR REPLACE FUNCTION public.get_system_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT settings 
        FROM public.system_settings 
        WHERE id = 1
    );
END;
$$;

-- Helper function to update system settings (admin only)
CREATE OR REPLACE FUNCTION public.update_system_settings(new_settings JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    ) THEN
        RAISE EXCEPTION 'Only administrators can update system settings';
    END IF;

    -- Update settings
    UPDATE public.system_settings 
    SET settings = new_settings 
    WHERE id = 1;

    RETURN TRUE;
END;
$$;

-- Grant necessary permissions
GRANT SELECT ON public.system_settings TO authenticated;
GRANT UPDATE ON public.system_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_system_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_system_settings(JSONB) TO authenticated;

-- Print completion message
SELECT 'System settings table created successfully with default configuration' AS status;