-- i18n Helper Functions
-- These functions make it easier to query multilingual content with proper fallback

-- 1. Get spiritual gifts with translations
CREATE OR REPLACE FUNCTION public.get_spiritual_gifts_i18n(p_locale TEXT DEFAULT 'pt')
RETURNS TABLE (
    gift_key TEXT,
    name TEXT,
    definition TEXT,
    biblical_references TEXT,
    category_key TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sg.gift_key::TEXT,
        COALESCE(
            (SELECT name FROM spiritual_gifts WHERE gift_key = sg.gift_key AND locale = p_locale LIMIT 1),
            (SELECT name FROM spiritual_gifts WHERE gift_key = sg.gift_key AND locale = 'pt' LIMIT 1),
            sg.name
        ) as name,
        COALESCE(
            (SELECT definition FROM spiritual_gifts WHERE gift_key = sg.gift_key AND locale = p_locale LIMIT 1),
            (SELECT definition FROM spiritual_gifts WHERE gift_key = sg.gift_key AND locale = 'pt' LIMIT 1),
            sg.definition
        ) as definition,
        COALESCE(
            (SELECT biblical_references FROM spiritual_gifts WHERE gift_key = sg.gift_key AND locale = p_locale LIMIT 1),
            (SELECT biblical_references FROM spiritual_gifts WHERE gift_key = sg.gift_key AND locale = 'pt' LIMIT 1),
            sg.biblical_references
        ) as biblical_references,
        sg.category_key
    FROM spiritual_gifts sg
    WHERE sg.locale = COALESCE(p_locale, 'pt')
    GROUP BY sg.gift_key, sg.name, sg.definition, sg.biblical_references, sg.category_key;
END;
$$;

-- 2. Get questions with translations
CREATE OR REPLACE FUNCTION public.get_questions_i18n(p_locale TEXT DEFAULT 'pt')
RETURNS TABLE (
    question_id INTEGER,
    text TEXT,
    gift TEXT,
    default_weight NUMERIC,
    pclass TEXT,
    reverse_scored BOOLEAN,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        qp.id as question_id,
        COALESCE(
            (SELECT qt.text FROM question_translations qt WHERE qt.question_id = qp.id AND qt.locale = p_locale LIMIT 1),
            (SELECT qt.text FROM question_translations qt WHERE qt.question_id = qp.id AND qt.locale = 'pt' LIMIT 1),
            qp.text
        ) as text,
        qp.gift::TEXT,
        qp.default_weight,
        qp.pclass::TEXT,
        qp.reverse_scored,
        qp.is_active
    FROM question_pool qp
    WHERE qp.is_active = true
    ORDER BY qp.id;
END;
$$;

-- 3. Get educational content with translations
CREATE OR REPLACE FUNCTION public.get_educational_content_i18n(p_locale TEXT DEFAULT 'pt')
RETURNS TABLE (
    content_id TEXT,
    section_type TEXT,
    title TEXT,
    content TEXT,
    biblical_reference TEXT,
    order_index INTEGER,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ec.id as content_id,
        ec.section_type,
        COALESCE(
            (SELECT ect.title FROM educational_content_translations ect WHERE ect.content_id = ec.id AND ect.locale = p_locale LIMIT 1),
            (SELECT ect.title FROM educational_content_translations ect WHERE ect.content_id = ec.id AND ect.locale = 'pt' LIMIT 1),
            ec.title
        ) as title,
        COALESCE(
            (SELECT ect.content FROM educational_content_translations ect WHERE ect.content_id = ec.id AND ect.locale = p_locale LIMIT 1),
            (SELECT ect.content FROM educational_content_translations ect WHERE ect.content_id = ec.id AND ect.locale = 'pt' LIMIT 1),
            ec.content
        ) as content,
        COALESCE(
            (SELECT ect.biblical_reference FROM educational_content_translations ect WHERE ect.content_id = ec.id AND ect.locale = p_locale LIMIT 1),
            (SELECT ect.biblical_reference FROM educational_content_translations ect WHERE ect.content_id = ec.id AND ect.locale = 'pt' LIMIT 1),
            ec.biblical_reference
        ) as biblical_reference,
        ec.order_index,
        COALESCE(ec.is_active, true) as is_active
    FROM educational_content ec
    WHERE COALESCE(ec.is_active, true) = true
    ORDER BY ec.order_index;
END;
$$;

-- 4. Get characteristics with translations
CREATE OR REPLACE FUNCTION public.get_characteristics_i18n(
    p_gift_key TEXT,
    p_locale TEXT DEFAULT 'pt'
)
RETURNS TABLE (
    characteristic_name TEXT,
    description TEXT,
    order_sequence INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.characteristic_name,
        c.description,
        c.order_sequence
    FROM characteristics c
    WHERE c.gift_key::TEXT = p_gift_key
      AND c.locale = COALESCE(p_locale, 'pt')
    ORDER BY c.order_sequence NULLS LAST, c.id;
END;
$$;

-- 5. Get bible verses for a gift with translations
CREATE OR REPLACE FUNCTION public.get_gift_bible_verses_i18n(
    p_gift_key TEXT,
    p_locale TEXT DEFAULT 'pt'
)
RETURNS TABLE (
    verse_reference TEXT,
    verse_text TEXT,
    context_note TEXT,
    relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        gbv.verse_reference,
        gbv.verse_text,
        gbv.context_note,
        gbv.relevance_score
    FROM gift_bible_verses gbv
    WHERE gbv.gift_key::TEXT = p_gift_key
      AND gbv.locale = COALESCE(p_locale, 'pt')
    ORDER BY gbv.relevance_score DESC NULLS LAST, gbv.verse_reference;
END;
$$;

-- 6. Generic helper to validate locale
CREATE OR REPLACE FUNCTION public.validate_locale(p_locale TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- List of supported locales
    IF p_locale IN ('pt', 'en', 'es') THEN
        RETURN p_locale;
    ELSE
        RETURN 'pt'; -- Default fallback
    END IF;
END;
$$;

-- 7. Get all content for a gift (comprehensive)
CREATE OR REPLACE FUNCTION public.get_gift_complete_i18n(
    p_gift_key TEXT,
    p_locale TEXT DEFAULT 'pt'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_locale TEXT;
    result JSON;
BEGIN
    v_locale := validate_locale(p_locale);

    SELECT json_build_object(
        'gift_info', (
            SELECT json_build_object(
                'gift_key', sg.gift_key::TEXT,
                'name', sg.name,
                'definition', sg.definition,
                'biblical_references', sg.biblical_references,
                'category_key', sg.category_key
            )
            FROM spiritual_gifts sg
            WHERE sg.gift_key::TEXT = p_gift_key
              AND sg.locale = v_locale
            LIMIT 1
        ),
        'characteristics', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'name', characteristic_name,
                    'description', description
                )
                ORDER BY order_sequence
            ), '[]'::json)
            FROM get_characteristics_i18n(p_gift_key, v_locale)
        ),
        'bible_verses', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'reference', verse_reference,
                    'text', verse_text,
                    'context', context_note
                )
                ORDER BY relevance_score DESC
            ), '[]'::json)
            FROM get_gift_bible_verses_i18n(p_gift_key, v_locale)
        ),
        'dangers', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'danger', danger
                )
                ORDER BY order_sequence
            ), '[]'::json)
            FROM dangers
            WHERE gift_key::TEXT = p_gift_key
              AND locale = v_locale
        ),
        'qualities', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'name', quality_name,
                    'description', description
                )
                ORDER BY order_sequence
            ), '[]'::json)
            FROM qualities
            WHERE gift_key::TEXT = p_gift_key
              AND locale = v_locale
        ),
        'misunderstandings', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'misunderstanding', misunderstanding
                )
                ORDER BY order_sequence
            ), '[]'::json)
            FROM misunderstandings
            WHERE gift_key::TEXT = p_gift_key
              AND locale = v_locale
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Add comments
COMMENT ON FUNCTION public.get_spiritual_gifts_i18n IS 'Get spiritual gifts with locale fallback (locale → pt)';
COMMENT ON FUNCTION public.get_questions_i18n IS 'Get quiz questions with translations and locale fallback';
COMMENT ON FUNCTION public.get_educational_content_i18n IS 'Get educational content with translations and locale fallback';
COMMENT ON FUNCTION public.get_characteristics_i18n IS 'Get gift characteristics for a specific locale';
COMMENT ON FUNCTION public.get_gift_bible_verses_i18n IS 'Get bible verses for a gift in a specific locale';
COMMENT ON FUNCTION public.validate_locale IS 'Validates locale and returns fallback if invalid';
COMMENT ON FUNCTION public.get_gift_complete_i18n IS 'Get complete gift data (all related tables) for a specific locale';
