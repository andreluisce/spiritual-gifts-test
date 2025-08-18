-- =========================================================
-- CREATE GIFT COMPATIBILITY AND MINISTRY TABLES
-- =========================================================

-- 1. Gift Synergies Table (Compatibilidade entre dons)
CREATE TABLE IF NOT EXISTS public.gift_synergies (
    id SERIAL PRIMARY KEY,
    primary_gift_key gift_key NOT NULL,
    secondary_gift_key gift_key NOT NULL,
    synergy_level VARCHAR(20) CHECK (synergy_level IN ('strong', 'moderate', 'challenge')),
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    description TEXT,
    compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(primary_gift_key, secondary_gift_key, locale)
);

-- 2. Synergy Strength Areas (Áreas de força da combinação)
CREATE TABLE IF NOT EXISTS public.synergy_strengths (
    id SERIAL PRIMARY KEY,
    primary_gift_key gift_key NOT NULL,
    secondary_gift_key gift_key NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    strength_area TEXT NOT NULL,
    order_sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (primary_gift_key, secondary_gift_key, locale) 
        REFERENCES gift_synergies(primary_gift_key, secondary_gift_key, locale) ON DELETE CASCADE
);

-- 3. Synergy Challenges (Desafios da combinação)
CREATE TABLE IF NOT EXISTS public.synergy_challenges (
    id SERIAL PRIMARY KEY,
    primary_gift_key gift_key NOT NULL,
    secondary_gift_key gift_key NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    challenge TEXT NOT NULL,
    solution_hint TEXT,
    order_sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (primary_gift_key, secondary_gift_key, locale) 
        REFERENCES gift_synergies(primary_gift_key, secondary_gift_key, locale) ON DELETE CASCADE
);

-- 4. Ministry Recommendations Table (Recomendações de ministérios)
CREATE TABLE IF NOT EXISTS public.ministry_recommendations (
    id SERIAL PRIMARY KEY,
    ministry_key VARCHAR(50) UNIQUE NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    ministry_name VARCHAR(100) NOT NULL,
    description TEXT,
    min_participants INTEGER DEFAULT 1,
    max_participants INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ministry_key, locale)
);

-- 5. Ministry Required Gifts (Dons necessários para o ministério)
CREATE TABLE IF NOT EXISTS public.ministry_required_gifts (
    id SERIAL PRIMARY KEY,
    ministry_key VARCHAR(50) NOT NULL,
    gift_key gift_key NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    is_primary BOOLEAN DEFAULT false,
    importance_level INTEGER CHECK (importance_level >= 1 AND importance_level <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ministry_key, locale) REFERENCES ministry_recommendations(ministry_key, locale) ON DELETE CASCADE,
    UNIQUE(ministry_key, gift_key, locale)
);

-- 6. Ministry Responsibilities (Responsabilidades do ministério)
CREATE TABLE IF NOT EXISTS public.ministry_responsibilities (
    id SERIAL PRIMARY KEY,
    ministry_key VARCHAR(50) NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    responsibility TEXT NOT NULL,
    order_sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ministry_key, locale) REFERENCES ministry_recommendations(ministry_key, locale) ON DELETE CASCADE
);

-- 7. Ministry Growth Areas (Áreas de crescimento)
CREATE TABLE IF NOT EXISTS public.ministry_growth_areas (
    id SERIAL PRIMARY KEY,
    ministry_key VARCHAR(50) NOT NULL,
    locale VARCHAR(10) NOT NULL DEFAULT 'pt',
    growth_area TEXT NOT NULL,
    resources TEXT,
    order_sequence INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ministry_key, locale) REFERENCES ministry_recommendations(ministry_key, locale) ON DELETE CASCADE
);

-- 8. Gift Compatibility Analysis (Análise de compatibilidade personalizada)
CREATE TABLE IF NOT EXISTS public.gift_compatibility_analysis (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_gift_key gift_key NOT NULL,
    secondary_gift_key gift_key NOT NULL,
    compatibility_score DECIMAL(5,2),
    analysis_text TEXT,
    recommendations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gift_synergies_primary ON gift_synergies(primary_gift_key, locale);
CREATE INDEX IF NOT EXISTS idx_gift_synergies_secondary ON gift_synergies(secondary_gift_key, locale);
CREATE INDEX IF NOT EXISTS idx_ministry_required_gifts ON ministry_required_gifts(gift_key, locale);
CREATE INDEX IF NOT EXISTS idx_compatibility_analysis_user ON gift_compatibility_analysis(user_id);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON gift_compatibility_analysis TO authenticated;

-- Add RLS policies
ALTER TABLE gift_compatibility_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compatibility analysis" ON gift_compatibility_analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own compatibility analysis" ON gift_compatibility_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- FUNCTION TO GET GIFT COMPATIBILITY
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_gift_compatibility(
    p_primary_gift gift_key,
    p_secondary_gift gift_key,
    p_locale VARCHAR DEFAULT 'pt'
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    result JSON;
BEGIN
    WITH synergy_data AS (
        SELECT 
            gs.synergy_level,
            gs.description,
            gs.compatibility_score,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'strength', ss.strength_area,
                        'order', ss.order_sequence
                    )
                ) FILTER (WHERE ss.strength_area IS NOT NULL),
                '[]'::json
            ) as strengths,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'challenge', sc.challenge,
                        'solution', sc.solution_hint,
                        'order', sc.order_sequence
                    )
                ) FILTER (WHERE sc.challenge IS NOT NULL),
                '[]'::json
            ) as challenges
        FROM gift_synergies gs
        LEFT JOIN synergy_strengths ss 
            ON gs.primary_gift_key = ss.primary_gift_key 
            AND gs.secondary_gift_key = ss.secondary_gift_key
            AND gs.locale = ss.locale
        LEFT JOIN synergy_challenges sc 
            ON gs.primary_gift_key = sc.primary_gift_key 
            AND gs.secondary_gift_key = sc.secondary_gift_key
            AND gs.locale = sc.locale
        WHERE gs.primary_gift_key = p_primary_gift
            AND gs.secondary_gift_key = p_secondary_gift
            AND gs.locale = p_locale
        GROUP BY gs.synergy_level, gs.description, gs.compatibility_score
    )
    SELECT json_build_object(
        'synergy_level', synergy_level,
        'description', description,
        'compatibility_score', compatibility_score,
        'strengths', strengths,
        'challenges', challenges
    ) INTO result
    FROM synergy_data;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$;

-- =========================================================
-- FUNCTION TO GET MINISTRY RECOMMENDATIONS
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_ministry_recommendations(
    p_user_gifts gift_key[],
    p_locale VARCHAR DEFAULT 'pt'
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    result JSON;
BEGIN
    WITH ministry_scores AS (
        SELECT 
            mr.ministry_key,
            mr.ministry_name,
            mr.description,
            COUNT(DISTINCT mrg.gift_key) FILTER (WHERE mrg.gift_key = ANY(p_user_gifts)) as matched_gifts,
            COUNT(DISTINCT mrg.gift_key) as total_required,
            AVG(mrg.importance_level) FILTER (WHERE mrg.gift_key = ANY(p_user_gifts)) as avg_importance,
            json_agg(
                DISTINCT jsonb_build_object(
                    'responsibility', resp.responsibility,
                    'order', resp.order_sequence
                )
            ) as responsibilities,
            json_agg(
                DISTINCT jsonb_build_object(
                    'area', ga.growth_area,
                    'resources', ga.resources,
                    'order', ga.order_sequence
                )
            ) as growth_areas
        FROM ministry_recommendations mr
        LEFT JOIN ministry_required_gifts mrg 
            ON mr.ministry_key = mrg.ministry_key 
            AND mr.locale = mrg.locale
        LEFT JOIN ministry_responsibilities resp 
            ON mr.ministry_key = resp.ministry_key 
            AND mr.locale = resp.locale
        LEFT JOIN ministry_growth_areas ga 
            ON mr.ministry_key = ga.ministry_key 
            AND mr.locale = ga.locale
        WHERE mr.locale = p_locale
        GROUP BY mr.ministry_key, mr.ministry_name, mr.description
    ),
    scored_ministries AS (
        SELECT 
            ministry_key,
            ministry_name,
            description,
            matched_gifts,
            total_required,
            responsibilities,
            growth_areas,
            CASE 
                WHEN total_required > 0 THEN 
                    (matched_gifts::DECIMAL / total_required * 100)
                ELSE 0 
            END as compatibility_score
        FROM ministry_scores
        ORDER BY compatibility_score DESC
    )
    SELECT json_agg(
        json_build_object(
            'ministry_key', ministry_key,
            'ministry_name', ministry_name,
            'description', description,
            'compatibility_score', compatibility_score,
            'matched_gifts', matched_gifts,
            'total_required', total_required,
            'responsibilities', responsibilities,
            'growth_areas', growth_areas
        )
    ) INTO result
    FROM scored_ministries;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;