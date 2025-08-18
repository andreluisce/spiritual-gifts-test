-- ================================================
-- POPULATE MISSING MINISTRY DATA
-- ================================================

-- Clear existing incomplete data first (optional)
DELETE FROM ministry_responsibilities WHERE responsibility IS NULL;
DELETE FROM ministry_growth_areas WHERE growth_area IS NULL;

-- ================================================
-- 1. YOUTH MINISTRY (Ministério Jovem)
-- ================================================

-- Portuguese
INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('youth_ministry', 'pt', 'Liderar reuniões e estudos para jovens', 1),
('youth_ministry', 'pt', 'Organizar retiros e acampamentos', 2),
('youth_ministry', 'pt', 'Aconselhar jovens em suas decisões', 3),
('youth_ministry', 'pt', 'Desenvolver atividades de integração', 4);

INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('youth_ministry', 'pt', 'Entender a cultura jovem contemporânea', 'Livros sobre juventude e cultura', 1),
('youth_ministry', 'pt', 'Desenvolver habilidades de mentoria', 'Cursos de mentoria e discipulado', 2),
('youth_ministry', 'pt', 'Aprender dinâmicas e jogos cooperativos', 'Workshops práticos', 3);

-- ================================================
-- 2. EVANGELISM & MISSIONS
-- ================================================

INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('evangelism_missions', 'pt', 'Compartilhar o evangelho na comunidade', 1),
('evangelism_missions', 'pt', 'Organizar campanhas evangelísticas', 2),
('evangelism_missions', 'pt', 'Apoiar e participar de viagens missionárias', 3),
('evangelism_missions', 'pt', 'Treinar outros na evangelização', 4);

INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('evangelism_missions', 'pt', 'Aprender métodos de evangelização', 'Cursos de evangelismo pessoal', 1),
('evangelism_missions', 'pt', 'Estudar culturas e religiões', 'Livros de missiologia', 2),
('evangelism_missions', 'pt', 'Desenvolver sensibilidade cultural', 'Experiências interculturais', 3);

-- ================================================
-- 3. INTERCESSORY PRAYER
-- ================================================

INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('intercessory_prayer', 'pt', 'Liderar grupos de oração', 1),
('intercessory_prayer', 'pt', 'Interceder pelas necessidades da igreja', 2),
('intercessory_prayer', 'pt', 'Organizar vigílias e campanhas de oração', 3),
('intercessory_prayer', 'pt', 'Ensinar sobre vida de oração', 4);

INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('intercessory_prayer', 'pt', 'Aprofundar vida de oração pessoal', 'Livros sobre oração e intercessão', 1),
('intercessory_prayer', 'pt', 'Estudar guerra espiritual', 'Estudos sobre batalha espiritual', 2),
('intercessory_prayer', 'pt', 'Desenvolver sensibilidade ao Espírito', 'Retiros de oração e jejum', 3);

-- ================================================
-- 4. CHILDREN'S MINISTRY
-- ================================================

INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('childrens_ministry', 'pt', 'Ensinar histórias bíblicas para crianças', 1),
('childrens_ministry', 'pt', 'Organizar programas e eventos infantis', 2),
('childrens_ministry', 'pt', 'Cuidar da segurança e bem-estar das crianças', 3),
('childrens_ministry', 'pt', 'Desenvolver material didático apropriado', 4);

INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('childrens_ministry', 'pt', 'Estudar pedagogia infantil', 'Cursos de educação cristã infantil', 1),
('childrens_ministry', 'pt', 'Aprender técnicas de contação de histórias', 'Workshops de comunicação infantil', 2),
('childrens_ministry', 'pt', 'Desenvolver criatividade em atividades', 'Recursos de artes e recreação', 3);

-- ================================================
-- 5. WORSHIP & MUSIC
-- ================================================

INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('worship_music', 'pt', 'Liderar momentos de louvor e adoração', 1),
('worship_music', 'pt', 'Selecionar e preparar músicas apropriadas', 2),
('worship_music', 'pt', 'Ensaiar com a equipe de música', 3),
('worship_music', 'pt', 'Criar ambiente de adoração genuína', 4);

INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('worship_music', 'pt', 'Desenvolver habilidades musicais', 'Aulas de música e canto', 1),
('worship_music', 'pt', 'Estudar teologia da adoração', 'Livros sobre louvor e adoração', 2),
('worship_music', 'pt', 'Aprender liderança de equipe', 'Workshops de liderança ministerial', 3);

-- ================================================
-- 6. DISCIPLESHIP
-- ================================================

INSERT INTO ministry_responsibilities (ministry_key, locale, responsibility, order_sequence) VALUES
('discipleship', 'pt', 'Acompanhar novos convertidos', 1),
('discipleship', 'pt', 'Ensinar fundamentos da fé cristã', 2),
('discipleship', 'pt', 'Desenvolver relacionamentos de mentoria', 3),
('discipleship', 'pt', 'Preparar materiais de discipulado', 4);

INSERT INTO ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence) VALUES
('discipleship', 'pt', 'Aprofundar conhecimento bíblico', 'Cursos de teologia básica', 1),
('discipleship', 'pt', 'Desenvolver habilidades de mentoria', 'Treinamento em aconselhamento', 2),
('discipleship', 'pt', 'Aprender métodos de discipulado', 'Materiais de discipulado eficaz', 3);
