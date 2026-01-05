-- Fix confidence_score field overflow issue
-- Change from numeric(3,2) to numeric(5,2) to allow values 0-100

ALTER TABLE public.ai_analysis_cache
  ALTER COLUMN confidence_score TYPE numeric(5,2);

-- Update default value to be more reasonable
ALTER TABLE public.ai_analysis_cache
  ALTER COLUMN confidence_score SET DEFAULT 85.00;

COMMENT ON COLUMN public.ai_analysis_cache.confidence_score IS 'Confidence score from 0 to 100';
