-- =========================================================
-- DYNAMIC GIFT CONTENT SYSTEM
-- AI-powered content generation with database caching
-- =========================================================

-- Create gift_bible_verses table
CREATE TABLE IF NOT EXISTS public.gift_bible_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_key public.gift_key NOT NULL,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  locale text NOT NULL DEFAULT 'pt',
  relevance_score numeric(3,1) DEFAULT 5.0,
  context_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gift_key, verse_reference, locale)
);

CREATE INDEX IF NOT EXISTS idx_gift_bible_verses_gift ON public.gift_bible_verses(gift_key);
CREATE INDEX IF NOT EXISTS idx_gift_bible_verses_locale ON public.gift_bible_verses(locale);

-- Create gift_content_cache table
CREATE TABLE IF NOT EXISTS public.gift_content_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_key public.gift_key NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('characteristics', 'responsibilities', 'growth_areas', 'qualities', 'dangers', 'misunderstandings')),
  content_data jsonb NOT NULL,
  locale text NOT NULL DEFAULT 'pt',
  ai_generated boolean DEFAULT true,
  ai_model text DEFAULT 'gemini-pro',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gift_key, content_type, locale)
);

CREATE INDEX IF NOT EXISTS idx_gift_content_cache_gift ON public.gift_content_cache(gift_key);
CREATE INDEX IF NOT EXISTS idx_gift_content_cache_type ON public.gift_content_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_gift_content_cache_locale ON public.gift_content_cache(locale);

-- Enable RLS
ALTER TABLE public.gift_bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_content_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read)
CREATE POLICY "Allow all read on gift_bible_verses"
  ON public.gift_bible_verses FOR SELECT
  USING (true);

CREATE POLICY "Allow all read on gift_content_cache"
  ON public.gift_content_cache FOR SELECT
  USING (true);

-- Grant permissions
GRANT SELECT ON public.gift_bible_verses TO anon, authenticated;
GRANT SELECT ON public.gift_content_cache TO anon, authenticated;

-- =========================================================
-- POPULATE INITIAL BIBLE VERSES (Gift-Specific)
-- =========================================================

-- PROPHECY - Specific verses about speaking truth and discernment
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('A_PROPHECY', 'Romanos 12:6', 'Se é profecia, seja segundo a proporção da fé', 'pt', 10.0, 'Verso principal sobre o dom de profecia'),
('A_PROPHECY', '1 Coríntios 14:3', 'Mas o que profetiza fala aos homens para edificação, exortação e consolação', 'pt', 9.5, 'Propósito da profecia'),
('A_PROPHECY', 'Amós 3:7', 'Certamente o Senhor Deus não fará coisa alguma, sem ter revelado o seu segredo aos seus servos, os profetas', 'pt', 9.0, 'Papel do profeta'),
('A_PROPHECY', '1 Tessalonicenses 5:20-21', 'Não desprezeis as profecias; julgai todas as coisas, retende o que é bom', 'pt', 8.5, 'Discernimento profético')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- SERVICE - Specific verses about practical help
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('B_SERVICE', 'Romanos 12:7', 'Se é ministério, seja em ministrar', 'pt', 10.0, 'Verso principal sobre serviço'),
('B_SERVICE', 'Gálatas 5:13', 'Servi uns aos outros pelo amor', 'pt', 9.5, 'Motivação do serviço'),
('B_SERVICE', 'Marcos 10:45', 'O Filho do homem não veio para ser servido, mas para servir', 'pt', 9.0, 'Exemplo de Cristo'),
('B_SERVICE', '1 Pedro 4:10', 'Cada um administre aos outros o dom como recebeu', 'pt', 8.5, 'Administração dos dons')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- TEACHING - Specific verses about instruction
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('C_TEACHING', 'Romanos 12:7', 'Se é ensinar, haja dedicação ao ensino', 'pt', 10.0, 'Verso principal sobre ensino'),
('C_TEACHING', '2 Timóteo 2:2', 'O que de mim ouviste, confia-o a homens fiéis, que sejam idôneos para também ensinarem os outros', 'pt', 9.5, 'Multiplicação do ensino'),
('C_TEACHING', 'Tiago 3:1', 'Meus irmãos, muitos de vós não sejam mestres, sabendo que receberemos mais duro juízo', 'pt', 9.0, 'Responsabilidade do mestre'),
('C_TEACHING', 'Esdras 7:10', 'Esdras tinha preparado o seu coração para buscar a lei do Senhor e para a cumprir e para ensinar', 'pt', 8.5, 'Preparação para ensinar')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- EXHORTATION - Specific verses about encouragement
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('D_EXHORTATION', 'Romanos 12:8', 'O que exorta, use esse dom em exortar', 'pt', 10.0, 'Verso principal sobre exortação'),
('D_EXHORTATION', 'Hebreus 3:13', 'Exortai-vos uns aos outros todos os dias', 'pt', 9.5, 'Frequência da exortação'),
('D_EXHORTATION', 'Atos 11:23', 'Exortava a todos a que permanecessem no Senhor com propósito de coração', 'pt', 9.0, 'Propósito da exortação'),
('D_EXHORTATION', '1 Tessalonicenses 5:11', 'Consolai-vos uns aos outros, e edificai-vos uns aos outros', 'pt', 8.5, 'Edificação mútua')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- GIVING - Specific verses about generosity
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('E_GIVING', 'Romanos 12:8', 'O que reparte, faça-o com liberalidade', 'pt', 10.0, 'Verso principal sobre contribuição'),
('E_GIVING', '2 Coríntios 9:7', 'Deus ama ao que dá com alegria', 'pt', 9.5, 'Atitude na doação'),
('E_GIVING', 'Provérbios 11:25', 'A alma generosa prosperará', 'pt', 9.0, 'Bênção da generosidade'),
('E_GIVING', 'Lucas 6:38', 'Dai, e ser-vos-á dado; boa medida, recalcada, sacudida e transbordando', 'pt', 8.5, 'Princípio da semeadura')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- LEADERSHIP - Specific verses about leading
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('F_LEADERSHIP', 'Romanos 12:8', 'O que preside, com cuidado', 'pt', 10.0, 'Verso principal sobre liderança'),
('F_LEADERSHIP', '1 Timóteo 3:4-5', 'Que governe bem a sua própria casa', 'pt', 9.5, 'Qualificação do líder'),
('F_LEADERSHIP', 'Hebreus 13:17', 'Obedecei a vossos pastores, pois velam por vossas almas', 'pt', 9.0, 'Responsabilidade pastoral'),
('F_LEADERSHIP', 'Provérbios 29:18', 'Não havendo profecia, o povo se corrompe', 'pt', 8.5, 'Importância da visão')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- MERCY - Specific verses about compassion
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('G_MERCY', 'Romanos 12:8', 'O que exercita misericórdia, com alegria', 'pt', 10.0, 'Verso principal sobre misericórdia'),
('G_MERCY', 'Mateus 5:7', 'Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia', 'pt', 9.5, 'Bem-aventurança'),
('G_MERCY', 'Lucas 10:33-34', 'Um samaritano, que ia de viagem, chegou ao pé dele e, vendo-o, moveu-se de íntima compaixão', 'pt', 9.0, 'Exemplo do bom samaritano'),
('G_MERCY', 'Colossenses 3:12', 'Revesti-vos de entranhas de misericórdia', 'pt', 8.5, 'Caráter compassivo')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

COMMENT ON TABLE public.gift_bible_verses IS 'Gift-specific Bible verses with relevance scores';
COMMENT ON TABLE public.gift_content_cache IS 'AI-generated content cache for spiritual gifts';
