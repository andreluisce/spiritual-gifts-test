-- =========================================================
-- ADICIONAR CONTEÚDO EDUCATIVO DO PDF
-- Baseado em "Dons Espirituais - As Três Categorias"
-- =========================================================

-- 1. Criar tabela para conteúdo educativo
CREATE TABLE IF NOT EXISTS public.educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN (
    'IMPORTANT_INTRO',           -- "IMPORTANTE" antes de cada dom
    'OBSTACLES',                 -- "O que impede descobrir seu dom"
    'THREE_CATEGORIES',          -- Explicação das 3 categorias
    'BIBLICAL_CONTEXT',          -- 7 atividades que todos devem fazer
    'MINISTRIES',                -- 12 Ministérios (informativo)
    'MANIFESTATIONS',            -- 9 Manifestações (informativo)
    'MANIFESTATION_PRINCIPLES'   -- Princípios para exercer manifestações
  )),
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  biblical_reference TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela de traduções para conteúdo educativo
CREATE TABLE IF NOT EXISTS public.educational_content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.educational_content(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('pt', 'en', 'es')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  biblical_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, locale)
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_educational_content_section ON public.educational_content(section_type);
CREATE INDEX IF NOT EXISTS idx_educational_content_order ON public.educational_content(order_index);
CREATE INDEX IF NOT EXISTS idx_educational_translations_locale ON public.educational_content_translations(locale);

-- 4. RLS Policies (conteúdo educativo é público)
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Educational content is viewable by everyone"
  ON public.educational_content FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Educational translations are viewable by everyone"
  ON public.educational_content_translations FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can modify educational content"
  ON public.educational_content FOR ALL
  USING (public.is_user_admin_safe());

CREATE POLICY "Only admins can modify educational translations"
  ON public.educational_content_translations FOR ALL
  USING (public.is_user_admin_safe());

-- =========================================================
-- INSERIR CONTEÚDO EDUCATIVO (PORTUGUÊS)
-- =========================================================

-- 1. IMPORTANTE - Introdução sobre caráter
INSERT INTO public.educational_content (section_type, order_index, title, content) VALUES
('IMPORTANT_INTRO', 1, 'Princípio Fundamental',
'O que você é, é mais importante do que o que você faz. Sua primeira preocupação deve ser o desempenho do caráter, o qual será a base para a manifestação do seu dom.

Este princípio bíblico fundamental nos lembra que Deus se importa primeiro com quem somos, antes de como servimos. O caráter cristão maduro é o alicerce sobre o qual nossos dons espirituais podem florescer de maneira saudável e glorificar a Deus.');

-- 2. OS 5 OBSTÁCULOS PARA DESCOBRIR SEU DOM
INSERT INTO public.educational_content (section_type, order_index, title, content) VALUES
('OBSTACLES', 1, 'Problemas básicos não resolvidos',
'Problemas básicos não resolvidos na vida pessoal podem impedir a descoberta do seu dom. Questões não tratadas de pecado, amargura, falta de perdão ou feridas emocionais profundas criam barreiras espirituais que obscurecem a percepção clara de como Deus nos criou para servir.'),

('OBSTACLES', 2, 'Falta de interesse nas necessidades de outros',
'Os nossos dons se descobrem e se desenvolvem quando o nosso interesse se focaliza nas necessidades de outros, e não em nosso ministério. É essencial que se tenha um coração de servo para descobrir-se o dom de motivação. Quando estamos centrados em nós mesmos, perdemos a sensibilidade para perceber como Deus deseja usar-nos para abençoar outros.'),

('OBSTACLES', 3, 'Imitação da motivação de outros',
'Se um crente vive tentando imitar a motivação ou o ministério de outros crentes, estará impedido de descobrir a sua própria motivação. Deus criou cada pessoa de forma única, e tentar ser uma cópia de outro cristão – por mais admirável que seja – nos afasta de descobrir nossa identidade autêntica em Cristo.'),

('OBSTACLES', 4, 'Não compreender porque certas atividades nos são atraentes',
'É importante entendermos o motivo das nossas atividades cristãs atuais. Muitas atividades são o meio de dar vasão a nossa motivação. Quando não refletimos sobre POR QUE gostamos de fazer certas coisas no Reino de Deus, perdemos pistas valiosas sobre nossos dons.'),

('OBSTACLES', 5, 'Confusão entre Dom de Motivação e Dom de Ministério',
'A pessoa que tem a motivação de ensino poderá ter, por exemplo, o ministério de profecia e sentir muito prazer no desempenho do mesmo. Mas isto talvez o faça duvidar se a sua motivação é ensino ou profecia. É importante distinguir entre a motivação interior (como Deus nos criou) e o ministério específico (o que Deus nos chama a fazer em determinado tempo).');

-- 3. AS TRÊS CATEGORIAS - Explicação completa
INSERT INTO public.educational_content (section_type, order_index, title, content, biblical_reference) VALUES
('THREE_CATEGORIES', 1, 'Motivações (Karismation)',
'Impulso básico implantado no interior de cada cristão para que Deus expresse Seu amor. Para cada indivíduo ter e segurar.

As MOTIVAÇÕES são sete dons fundamentais dados por Deus a cada crente no momento da conversão. São permanentes e definem a forma única como você expressa o amor de Cristo. Este teste avalia especificamente estas sete motivações.',
'Romanos 12:3-8; 1 Pedro 4:10; 1 Coríntios 12:4'),

('THREE_CATEGORIES', 2, 'Ministérios (Diakonion)',
'O serviço cristão que Deus determina para cada um, para poder exercer a sua motivação. Para a Igreja.

Os MINISTÉRIOS são funções específicas que Deus chama pessoas a exercer na igreja local ou no corpo de Cristo. Uma pessoa com motivação de ensino pode ter o ministério de pastor, evangelista ou mestre, por exemplo. Os ministérios podem mudar ao longo da vida conforme Deus direciona.',
'1 Coríntios 12:27-28; Efésios 4:11; 1 Timóteo; Tito'),

('THREE_CATEGORIES', 3, 'Manifestações (Energias Planerosis)',
'Manifestações determinadas pelo Espírito Santo, necessárias para capacitar a pessoa a ser bem sucedida em seu ministério. Para indivíduos momentaneamente, enquanto ministram conforme a vontade de Deus.

As MANIFESTAÇÕES são capacitações sobrenaturais temporárias dadas pelo Espírito Santo em momentos específicos de ministério. Não são permanentes como as motivações, mas são dadas conforme a necessidade do momento.',
'1 Coríntios 12:7-11; 1 Coríntios 12:6');

-- 4. CONTEXTO BÍBLICO - Todos devem fazer todas as 7 atividades
INSERT INTO public.educational_content (section_type, order_index, title, content, biblical_reference) VALUES
('BIBLICAL_CONTEXT', 1, 'Declaração da verdade',
'A Bíblia ordena que CADA crente profetize: "Segui o amor, e procurai com zelo os dons espirituais, mas principalmente que profetizeis"',
'1 Coríntios 14:1; 2 Timóteo 4:2'),

('BIBLICAL_CONTEXT', 2, 'Serviços',
'Todos devem servir: "Sede, antes, servos uns dos outros, pelo amor" e "Tudo quanto fizerdes, fazei-o de todo coração, como para o Senhor... A Cristo, o Senhor, é que estais servindo"',
'Gálatas 5:13; Colossenses 3:23-24'),

('BIBLICAL_CONTEXT', 3, 'Ensino',
'Todos devem ensinar: "Instruí-vos e aconselhai-vos mutuamente em toda a sabedoria..."',
'Colossenses 3:16'),

('BIBLICAL_CONTEXT', 4, 'Exortação',
'Todos devem exortar: "Exortai-vos mutuamente cada dia..."',
'Hebreus 3:13'),

('BIBLICAL_CONTEXT', 5, 'Contribuição',
'Todos devem contribuir: "De graça recebeste, de graça daí" e "Daí, e dar-se-vos-á..." e "Compartilhai as necessidades dos santos..."',
'Mateus 10:8; Lucas 6:38; Romanos 12:13'),

('BIBLICAL_CONTEXT', 6, 'Administração',
'Todos devem administrar bem: "E que governe bem a sua própria casa..."',
'1 Timóteo 3:4; Provérbios 17:2; 16:32; Efésios 6:4'),

('BIBLICAL_CONTEXT', 7, 'Misericórdia',
'Todos devem mostrar misericórdia: Jesus ilustrou a misericórdia na história do bom samaritano depois disse: "Vai, procede tu de igual modo". Também: "Revesti-vos... de afetos da misericórdia..." e "Levai as cargas uns dos outros, e assim cumprireis a Lei de Cristo"',
'Lucas 10:33-37; Colossenses 3:12; Gálatas 6:2');

-- Adicionar explicação sobre como cada um faz através de sua motivação
INSERT INTO public.educational_content (section_type, order_index, title, content) VALUES
('BIBLICAL_CONTEXT', 8, 'Cada um através de sua motivação',
'Cada crente poderá desempenhar as sete atividades, mas através da sua própria motivação básica.

Por exemplo:
• Se o seu dom da motivação for ENSINO, você mostrará misericórdia a um enfermo com o propósito de esclarecer-lhe a verdade.
• Se for CONTRIBUIÇÃO, poderá usar a atividade de administração para ajudar aos outros a organizarem seus negócios.
• Se for EXORTAÇÃO poderá usar a atividade de pregação para falar a um grupo como falaria a uma só pessoa.

Há um mínimo de cansaço e um máximo de eficiência em todas as sete atividades quando as fazemos através da nossa motivação. O contrário acontece quando procuramos imitar a motivação dos outros.');

-- 5. OS 12 MINISTÉRIOS (Informativo)
INSERT INTO public.educational_content (section_type, order_index, title, content, biblical_reference) VALUES
('MINISTRIES', 1, 'Apóstolo',
'Alguém enviado pela igreja para um serviço cristão específico.',
'1 Coríntios 12:28; Efésios 4:11'),

('MINISTRIES', 2, 'Profeta',
'Alguém que proclama a mensagem de Deus principalmente aos crentes.',
'1 Coríntios 12:28; Efésios 4:11'),

('MINISTRIES', 3, 'Evangelista',
'Alguém que proclama a mensagem de Deus aos inconversos.',
'Efésios 4:11'),

('MINISTRIES', 4, 'Pastor',
'Alguém que supervisiona um grupo de crentes e cuida das suas necessidades.',
'Efésios 4:11'),

('MINISTRIES', 5, 'Mestre',
'Alguém que esclarece e preserva a Verdade.',
'Efésios 4:11; 1 Coríntios 12:28'),

('MINISTRIES', 6, 'Operadores de Milagres',
'Alguém que opera sinais e prodígios.',
'1 Coríntios 12:28'),

('MINISTRIES', 7, 'Dons de Curar',
'Alguém que opera curas.',
'1 Coríntios 12:28'),

('MINISTRIES', 8, 'Socorros',
'Alguém que assiste a liderança no ministério aos necessitados.',
'1 Coríntios 12:28'),

('MINISTRIES', 9, 'Governos',
'Alguém que guia e dirige a Igreja Local, ou outra obra.',
'1 Coríntios 12:28'),

('MINISTRIES', 10, 'Variedade de Línguas',
'Alguém que fala várias línguas pelo Espírito (Interpretação implícita).',
'1 Coríntios 12:28'),

('MINISTRIES', 11, 'Presbítero',
'Alguém que cuida da parte espiritual da igreja.',
'1 Timóteo; Tito'),

('MINISTRIES', 12, 'Diácono',
'Alguém separado para servir.',
'1 Timóteo; Tito');

-- 6. AS 9 MANIFESTAÇÕES (Informativo)
INSERT INTO public.educational_content (section_type, order_index, title, content, biblical_reference) VALUES
('MANIFESTATIONS', 1, 'Palavra de Sabedoria',
'Uma revelação do Espírito mostrando como agir em determinada situação. Não é sabedoria adquirida, acumulada naturalmente. Muitas vezes é dado junto com a palavra de conhecimento.

A palavra de sabedoria refere-se à aplicação sobrenatural do conhecimento. Faz a pergunta: "O que fazer com o problema?"',
'1 Coríntios 12:7-10; 2 Samuel 12:1-26'),

('MANIFESTATIONS', 2, 'Palavra de Conhecimento',
'Revelação sobrenatural de fatos passados, futuros ou presentes não aprendidos através de recursos naturais de mente. Pode ser descrita como a mente de Cristo manifesta à mente do crente. Vem pela revelação, não pelo poder ou obediência.

Faz a pergunta: "Qual é o problema?"',
'1 Coríntios 12:7-10; Atos 5:9-11'),

('MANIFESTATIONS', 3, 'Discernimento de Espíritos',
'Capacidade sobrenatural de discernir se as atitudes e manifestações são de Deus, do homem ou do diabo. O crente é capacitado a saber instantaneamente o que está motivando a pessoa ou situação.',
'1 Coríntios 12:7-10; Atos 16:16'),

('MANIFESTATIONS', 4, 'Fé',
'O poder de visualizar algo que Deus quer operar, e crer para que aconteça. Muitas vezes está ligada intimamente com operações de milagres. Capacita o crente a crer em Deus para resultados poderosos.',
'1 Coríntios 12:9; 1 Reis 17:1; Tiago 5:17'),

('MANIFESTATIONS', 5, 'Dons de Curar',
'O poder do Espírito curando e trazendo saúde pela aplicação da verdade. Muitas vezes, pessoas não são curadas instantaneamente porque Deus tem um propósito mais alto. Restauração de saúde.

Deus opera a cura de 5 maneiras:
1. Instantaneamente
2. Gradualmente através do processo da natureza
3. Através da ciência medicinal
4. Capacitando-nos a sofrer pela cura de nossas atitudes
5. Na ressurreição',
'1 Coríntios 12:9'),

('MANIFESTATIONS', 6, 'Operação de Milagres',
'Prodígios e maravilhas operadas pelo poder do Espírito Santo.',
'1 Coríntios 12:10; Êxodo 14:21-31'),

('MANIFESTATIONS', 7, 'Profecia',
'O Espírito falando através de alguém para a edificação de outros (consolação). Profecia capacita o crente para transmitir a mensagem de Deus aos homens. É a palavra certa no tempo certo. É o ministério mais importante na igreja, porque edifica o corpo. Profecia é a proclamação direta da mente de Deus pela inspiração do Espírito Santo.

Regras para avaliar profecias:
1. A profecia deve edificar a Igreja
2. A profecia deve encorajar e dar vida
3. A profecia deve consolar os outros, consolar os crentes, levando-os para mais perto de Deus e produzir visão cristã',
'1 Coríntios 12:10; 1 Coríntios 14'),

('MANIFESTATIONS', 8, 'Variedade de Línguas',
'Capacidade sobrenatural de adorar a Deus, em línguas desconhecidas. Nosso espírito sente-se livre para comunicar-se com Deus.

Línguas têm três propósitos específicos:
1. Oração (v14)
2. Adoração (v15)
3. Agradecimento (v16)

Todos esses indicam oração a Deus, por isso este dom normalmente deveria ser exercido sozinho. Deus não manda mensagens através do dom de línguas, mas através de profecia e ensino.',
'1 Coríntios 12:10; 1 Coríntios 14:14-16'),

('MANIFESTATIONS', 9, 'Interpretação de Línguas',
'A interpretação de variedades faladas em Línguas desconhecidas.',
'1 Coríntios 12:10');

-- 7. PRINCÍPIOS PARA EXERCER AS MANIFESTAÇÕES
INSERT INTO public.educational_content (section_type, order_index, title, content) VALUES
('MANIFESTATION_PRINCIPLES', 1, 'Exercer fé',
'As manifestações operam através da fé. É necessário crer que Deus pode e quer manifestar Seu poder através de você.'),

('MANIFESTATION_PRINCIPLES', 2, 'Aumentar à medida do ministério',
'Quanto mais você ministra, mais as manifestações se tornam evidentes. Elas crescem com a experiência e fidelidade.'),

('MANIFESTATION_PRINCIPLES', 3, 'Falar ao ministério responsável',
'As manifestações devem ser exercidas sob orientação e cobertura espiritual apropriada.'),

('MANIFESTATION_PRINCIPLES', 4, 'Sob a autoridade do corpo',
'Todas as manifestações devem ser exercidas em submissão à liderança da igreja local e em harmonia com o corpo de Cristo.');

-- =========================================================
-- FUNÇÃO PARA BUSCAR CONTEÚDO EDUCATIVO
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_educational_content(
  p_section_type TEXT DEFAULT NULL,
  p_locale TEXT DEFAULT 'pt'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', ec.id,
      'section_type', ec.section_type,
      'order_index', ec.order_index,
      'title', COALESCE(ect.title, ec.title),
      'content', COALESCE(ect.content, ec.content),
      'biblical_reference', COALESCE(ect.biblical_reference, ec.biblical_reference)
    ) ORDER BY ec.order_index
  )
  INTO result
  FROM public.educational_content ec
  LEFT JOIN public.educational_content_translations ect
    ON ec.id = ect.content_id AND ect.locale = p_locale
  WHERE ec.is_active = TRUE
    AND (p_section_type IS NULL OR ec.section_type = p_section_type);

  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_educational_content TO anon, authenticated;

-- Log
DO $$
BEGIN
  RAISE NOTICE 'Educational content system created successfully';
  RAISE NOTICE 'Total sections added: 44';
  RAISE NOTICE '  - IMPORTANT_INTRO: 1';
  RAISE NOTICE '  - OBSTACLES: 5';
  RAISE NOTICE '  - THREE_CATEGORIES: 3';
  RAISE NOTICE '  - BIBLICAL_CONTEXT: 8';
  RAISE NOTICE '  - MINISTRIES: 12';
  RAISE NOTICE '  - MANIFESTATIONS: 9';
  RAISE NOTICE '  - MANIFESTATION_PRINCIPLES: 4';
END $$;
