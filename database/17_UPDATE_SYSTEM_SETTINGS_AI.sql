-- ============================================================================
-- UPDATE SYSTEM SETTINGS - EXPANDED AI CONFIGURATION
-- ============================================================================
-- This file updates the system_settings table to include comprehensive AI settings

-- Update the default settings to include expanded AI configuration
UPDATE public.system_settings 
SET settings = jsonb_set(
  settings,
  '{ai}',
  '{
    "enableAIAnalysis": true,
    "aiAnalysisDescription": "AI-powered analysis for spiritual gifts compatibility",
    "showAIButton": true,
    "autoGenerate": false,
    "cacheStrategy": "gift_scores",
    "model": "gpt-3.5-turbo",
    "maxTokens": 1000,
    "temperature": 0.7,
    "includePersonalDevelopment": true,
    "includeMinistryOpportunities": true,
    "includeBiblicalReferences": true,
    "analysisLanguage": "auto"
  }'::jsonb
)
WHERE id = 1;

-- Create function to get default AI settings for new installations
CREATE OR REPLACE FUNCTION public.get_default_ai_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN '{
    "enableAIAnalysis": true,
    "aiAnalysisDescription": "AI-powered analysis for spiritual gifts compatibility",
    "showAIButton": true,
    "autoGenerate": false,
    "cacheStrategy": "gift_scores",
    "model": "gpt-3.5-turbo",
    "maxTokens": 1000,
    "temperature": 0.7,
    "includePersonalDevelopment": true,
    "includeMinistryOpportunities": true,
    "includeBiblicalReferences": true,
    "analysisLanguage": "auto"
  }'::jsonb;
END;
$$;

-- Function to ensure AI settings exist and are properly formatted
CREATE OR REPLACE FUNCTION public.ensure_ai_settings_complete()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_settings JSONB;
  default_ai_settings JSONB;
  updated_ai_settings JSONB;
BEGIN
  -- Get current settings
  SELECT settings INTO current_settings 
  FROM public.system_settings 
  WHERE id = 1;

  -- Get default AI settings
  SELECT public.get_default_ai_settings() INTO default_ai_settings;

  -- Merge with existing AI settings (preserve any existing values)
  updated_ai_settings := COALESCE(current_settings->'ai', '{}'::jsonb) || default_ai_settings;

  -- Update the settings
  UPDATE public.system_settings 
  SET settings = jsonb_set(settings, '{ai}', updated_ai_settings)
  WHERE id = 1;

  RETURN TRUE;
END;
$$;

-- Ensure AI settings are complete
SELECT public.ensure_ai_settings_complete();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_default_ai_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_ai_settings_complete() TO authenticated;

-- Verify the update
SELECT 
  'AI settings updated successfully' AS status,
  (settings->'ai') AS ai_settings
FROM public.system_settings 
WHERE id = 1;