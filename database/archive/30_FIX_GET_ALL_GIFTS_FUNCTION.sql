-- =========================================================
-- FIX GET_ALL_GIFTS_WITH_DATA FUNCTION
-- =========================================================
-- Recreate the function with correct table references
-- Ensures no reference to old 'orientacoes' table
-- =========================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_all_gifts_with_data(text);

-- Create corrected function
CREATE OR REPLACE FUNCTION public.get_all_gifts_with_data(p_locale text DEFAULT 'pt')
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(
      jsonb_build_object(
        'key', sg.gift_key,
        'name', sg.name,
        'definition', sg.definition,
        'biblical_references', sg.biblical_references,
        'category', jsonb_build_object(
          'key', c.key,
          'name', c.name,
          'greek_term', c.greek_term,
          'description', c.description,
          'purpose', c.purpose
        ),
        'characteristics', (
          SELECT jsonb_agg(ch.characteristic ORDER BY ch.order_sequence)
          FROM public.characteristics ch
          WHERE ch.gift_key = sg.gift_key AND ch.locale = p_locale
        ),
        'qualities', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', q.order_sequence,
              'quality_name', q.quality_name,
              'description', q.description
            ) ORDER BY q.order_sequence
          )
          FROM public.qualities q
          WHERE q.gift_key = sg.gift_key AND q.locale = p_locale
        ),
        'dangers', (
          SELECT jsonb_agg(d.danger ORDER BY d.order_sequence)
          FROM public.dangers d
          WHERE d.gift_key = sg.gift_key AND d.locale = p_locale
        ),
        'misunderstandings', (
          SELECT jsonb_agg(m.misunderstanding ORDER BY m.order_sequence)
          FROM public.misunderstandings m
          WHERE m.gift_key = sg.gift_key AND m.locale = p_locale
        ),
        'orientations', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', go.id,
              'orientation', go.orientation,
              'category', go.category
            ) ORDER BY go.id
          )
          FROM public.gift_orientations go
          WHERE go.gift_key = sg.gift_key AND go.locale = p_locale
        )
      ) ORDER BY sg.gift_key
    )
    FROM public.spiritual_gifts sg
    LEFT JOIN public.categories c ON c.key = sg.category_key AND c.locale = p_locale
    WHERE sg.locale = p_locale
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_gifts_with_data(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_gifts_with_data(text) TO anon;

-- Add comment
COMMENT ON FUNCTION public.get_all_gifts_with_data(text) IS 'Returns all spiritual gifts with complete data including characteristics, qualities, dangers, misunderstandings, and orientations for the specified locale';

-- Test the function
SELECT COUNT(*) as total_gifts FROM jsonb_array_elements(get_all_gifts_with_data('pt'));

\echo '✅ get_all_gifts_with_data function recreated successfully!'