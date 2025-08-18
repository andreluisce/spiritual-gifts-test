-- =========================================================
-- POPULATE GIFT COMPATIBILITY DATA
-- =========================================================

-- Insert Gift Synergies
INSERT INTO public.gift_synergies (primary_gift_key, secondary_gift_key, synergy_level, locale, description, compatibility_score)
VALUES
-- PROPHECY Synergies
('A_PROPHECY', 'C_TEACHING', 'strong', 'pt', 'Profecia + Ensino: Capacidade única de revelar verdades bíblicas profundas e ensiná-las claramente', 90),
('A_PROPHECY', 'D_EXHORTATION', 'strong', 'pt', 'Profecia + Exortação: Poder para confrontar e encorajar com autoridade espiritual', 85),
('A_PROPHECY', 'F_LEADERSHIP', 'strong', 'pt', 'Profecia + Liderança: Visão profética combinada com capacidade de guiar outros', 88),
('A_PROPHECY', 'G_MERCY', 'moderate', 'pt', 'Profecia + Misericórdia: Equilibrio entre verdade e compaixão', 70),
('A_PROPHECY', 'B_SERVICE', 'moderate', 'pt', 'Profecia + Serviço: Revelação divina aplicada através do serviço prático', 65),
('A_PROPHECY', 'E_GIVING', 'challenge', 'pt', 'Profecia + Contribuição: Pode haver tensão entre confrontação profética e generosidade', 45),

-- SERVICE Synergies  
('B_SERVICE', 'G_MERCY', 'strong', 'pt', 'Serviço + Misericórdia: Combinação poderosa para ministérios de cuidado e assistência', 92),
('B_SERVICE', 'E_GIVING', 'strong', 'pt', 'Serviço + Contribuição: Capacidade de servir e prover recursos simultaneamente', 90),
('B_SERVICE', 'D_EXHORTATION', 'strong', 'pt', 'Serviço + Exortação: Servir enquanto encoraja e motiva outros', 85),
('B_SERVICE', 'C_TEACHING', 'moderate', 'pt', 'Serviço + Ensino: Ensino prático através do exemplo e ação', 75),
('B_SERVICE', 'F_LEADERSHIP', 'moderate', 'pt', 'Serviço + Liderança: Liderança servidora e exemplo prático', 72),
('B_SERVICE', 'A_PROPHECY', 'challenge', 'pt', 'Serviço + Profecia: Tensão entre ação prática e revelação espiritual', 50),

-- TEACHING Synergies
('C_TEACHING', 'A_PROPHECY', 'strong', 'pt', 'Ensino + Profecia: Revelação divina comunicada com clareza pedagógica', 90),
('C_TEACHING', 'F_LEADERSHIP', 'strong', 'pt', 'Ensino + Liderança: Capacidade de ensinar e guiar simultaneamente', 88),
('C_TEACHING', 'D_EXHORTATION', 'strong', 'pt', 'Ensino + Exortação: Educação que transforma e motiva', 86),
('C_TEACHING', 'B_SERVICE', 'moderate', 'pt', 'Ensino + Serviço: Ensino através do exemplo prático', 75),
('C_TEACHING', 'G_MERCY', 'moderate', 'pt', 'Ensino + Misericórdia: Ensino compassivo e paciente', 70),
('C_TEACHING', 'E_GIVING', 'challenge', 'pt', 'Ensino + Contribuição: Possível tensão entre teoria e generosidade prática', 48),

-- EXHORTATION Synergies
('D_EXHORTATION', 'G_MERCY', 'strong', 'pt', 'Exortação + Misericórdia: Encorajamento compassivo e cura emocional', 93),
('D_EXHORTATION', 'A_PROPHECY', 'strong', 'pt', 'Exortação + Profecia: Poder para exortar com autoridade profética', 85),
('D_EXHORTATION', 'C_TEACHING', 'strong', 'pt', 'Exortação + Ensino: Educação motivacional e transformadora', 86),
('D_EXHORTATION', 'B_SERVICE', 'moderate', 'pt', 'Exortação + Serviço: Encorajamento através de ações práticas', 78),
('D_EXHORTATION', 'F_LEADERSHIP', 'moderate', 'pt', 'Exortação + Liderança: Liderança motivacional e inspiradora', 80),
('D_EXHORTATION', 'E_GIVING', 'challenge', 'pt', 'Exortação + Contribuição: Desafio em equilibrar motivação com generosidade', 52),

-- GIVING Synergies
('E_GIVING', 'B_SERVICE', 'strong', 'pt', 'Contribuição + Serviço: Generosidade prática que supre necessidades diretamente', 90),
('E_GIVING', 'G_MERCY', 'strong', 'pt', 'Contribuição + Misericórdia: Compaixão expressa através de generosidade', 92),
('E_GIVING', 'F_LEADERSHIP', 'strong', 'pt', 'Contribuição + Liderança: Liderança que inspira generosidade e provisão', 85),
('E_GIVING', 'D_EXHORTATION', 'moderate', 'pt', 'Contribuição + Exortação: Generosidade que encoraja outros', 72),
('E_GIVING', 'A_PROPHECY', 'challenge', 'pt', 'Contribuição + Profecia: Tensão entre generosidade e confrontação', 45),
('E_GIVING', 'C_TEACHING', 'challenge', 'pt', 'Contribuição + Ensino: Desafio em equilibrar teoria com prática generosa', 48),

-- LEADERSHIP Synergies
('F_LEADERSHIP', 'A_PROPHECY', 'strong', 'pt', 'Liderança + Profecia: Liderança visionária guiada por revelação divina', 88),
('F_LEADERSHIP', 'C_TEACHING', 'strong', 'pt', 'Liderança + Ensino: Capacidade de liderar através do ensino e discipulado', 88),
('F_LEADERSHIP', 'E_GIVING', 'strong', 'pt', 'Liderança + Contribuição: Liderança que mobiliza recursos e generosidade', 85),
('F_LEADERSHIP', 'D_EXHORTATION', 'moderate', 'pt', 'Liderança + Exortação: Liderança motivacional e encorajadora', 80),
('F_LEADERSHIP', 'B_SERVICE', 'moderate', 'pt', 'Liderança + Serviço: Liderança servidora e humilde', 72),
('F_LEADERSHIP', 'G_MERCY', 'challenge', 'pt', 'Liderança + Misericórdia: Tensão entre decisões firmes e compaixão', 55),

-- MERCY Synergies
('G_MERCY', 'B_SERVICE', 'strong', 'pt', 'Misericórdia + Serviço: Compaixão ativa que se manifesta em ações concretas', 95),
('G_MERCY', 'D_EXHORTATION', 'strong', 'pt', 'Misericórdia + Exortação: Encorajamento profundamente compassivo', 93),
('G_MERCY', 'E_GIVING', 'strong', 'pt', 'Misericórdia + Contribuição: Generosidade motivada pela compaixão', 92),
('G_MERCY', 'C_TEACHING', 'moderate', 'pt', 'Misericórdia + Ensino: Ensino paciente e compassivo', 70),
('G_MERCY', 'A_PROPHECY', 'moderate', 'pt', 'Misericórdia + Profecia: Verdade comunicada com amor e compaixão', 70),
('G_MERCY', 'F_LEADERSHIP', 'challenge', 'pt', 'Misericórdia + Liderança: Dificuldade em tomar decisões difíceis mas necessárias', 55);

-- Insert Ministry Recommendations
INSERT INTO public.ministry_recommendations (ministry_key, locale, ministry_name, description)
VALUES
('teaching_preaching', 'pt', 'Ensino e Pregação', 'Ministério focado no ensino da Palavra e pregação expositiva'),
('leadership_admin', 'pt', 'Liderança', 'Coordenação de ministérios e liderança organizacional'),
('counseling_care', 'pt', 'Aconselhamento e Cuidado Pastoral', 'Ministério de cuidado, aconselhamento e restauração'),
('social_ministry', 'pt', 'Ministério Social e Diaconia', 'Serviço prático e assistência às necessidades da comunidade'),
('evangelism_missions', 'pt', 'Evangelismo e Missões', 'Compartilhamento do evangelho e expansão do Reino'),
('intercessory_prayer', 'pt', 'Ministério de Intercessão', 'Oração intercessória e guerra espiritual'),
('worship_music', 'pt', 'Louvor e Adoração', 'Ministério de música e expressão artística'),
('youth_ministry', 'pt', 'Ministério Jovem', 'Trabalho específico com adolescentes e jovens adultos'),
('childrens_ministry', 'pt', 'Ministério Infantil', 'Educação e cuidado de crianças'),
('discipleship', 'pt', 'Discipulado', 'Formação e acompanhamento de novos convertidos');

-- Insert Required Gifts for Ministries
INSERT INTO public.ministry_required_gifts (ministry_key, gift_key, locale, is_primary, importance_level)
VALUES
-- Teaching & Preaching
('teaching_preaching', 'C_TEACHING', 'pt', true, 5),
('teaching_preaching', 'A_PROPHECY', 'pt', false, 4),
('teaching_preaching', 'F_LEADERSHIP', 'pt', false, 3),

-- Leadership & Administration  
('leadership_admin', 'F_LEADERSHIP', 'pt', true, 5),
('leadership_admin', 'C_TEACHING', 'pt', false, 4),
('leadership_admin', 'A_PROPHECY', 'pt', false, 3),

-- Counseling & Care
('counseling_care', 'G_MERCY', 'pt', true, 5),
('counseling_care', 'D_EXHORTATION', 'pt', false, 4),
('counseling_care', 'B_SERVICE', 'pt', false, 3),

-- Social Ministry
('social_ministry', 'B_SERVICE', 'pt', true, 5),
('social_ministry', 'G_MERCY', 'pt', false, 4),
('social_ministry', 'E_GIVING', 'pt', false, 4),

-- Evangelism & Missions
('evangelism_missions', 'A_PROPHECY', 'pt', true, 5),
('evangelism_missions', 'D_EXHORTATION', 'pt', false, 4),
('evangelism_missions', 'F_LEADERSHIP', 'pt', false, 3),

-- Intercessory Prayer
('intercessory_prayer', 'A_PROPHECY', 'pt', true, 4),
('intercessory_prayer', 'G_MERCY', 'pt', false, 4),
('intercessory_prayer', 'D_EXHORTATION', 'pt', false, 3),

-- Youth Ministry
('youth_ministry', 'D_EXHORTATION', 'pt', true, 5),
('youth_ministry', 'C_TEACHING', 'pt', false, 4),
('youth_ministry', 'F_LEADERSHIP', 'pt', false, 3),

-- Children's Ministry
('childrens_ministry', 'C_TEACHING', 'pt', true, 5),
('childrens_ministry', 'G_MERCY', 'pt', false, 4),
('childrens_ministry', 'B_SERVICE', 'pt', false, 3),

-- Discipleship
('discipleship', 'C_TEACHING', 'pt', true, 5),
('discipleship', 'D_EXHORTATION', 'pt', false, 4),
('discipleship', 'G_MERCY', 'pt', false, 3);

-- Insert Ministry Responsibilities
INSERT INTO public.ministry_responsibilities (ministry_key, locale, responsibility, order_sequence)
VALUES
-- Teaching & Preaching
('teaching_preaching', 'pt', 'Preparar e ministrar estudos bíblicos', 1),
('teaching_preaching', 'pt', 'Pregar sermões expositivos', 2),
('teaching_preaching', 'pt', 'Desenvolver materiais didáticos', 3),
('teaching_preaching', 'pt', 'Discipular novos convertidos', 4),

-- Leadership & Administration
('leadership_admin', 'pt', 'Coordenar equipes ministeriais', 1),
('leadership_admin', 'pt', 'Planejar estratégias de crescimento', 2),
('leadership_admin', 'pt', 'Desenvolver líderes', 3),
('leadership_admin', 'pt', 'Tomar decisões administrativas', 4),

-- Counseling & Care
('counseling_care', 'pt', 'Oferecer aconselhamento bíblico', 1),
('counseling_care', 'pt', 'Visitação hospitalar e domiciliar', 2),
('counseling_care', 'pt', 'Cuidar de pessoas em crise', 3),
('counseling_care', 'pt', 'Ministrar cura emocional', 4),

-- Social Ministry
('social_ministry', 'pt', 'Organizar projetos sociais', 1),
('social_ministry', 'pt', 'Distribuir alimentos e recursos', 2),
('social_ministry', 'pt', 'Manutenção da igreja', 3),
('social_ministry', 'pt', 'Apoiar famílias necessitadas', 4);

-- Insert Growth Areas
INSERT INTO public.ministry_growth_areas (ministry_key, locale, growth_area, resources, order_sequence)
VALUES
-- Teaching & Preaching
('teaching_preaching', 'pt', 'Desenvolver habilidades de comunicação', 'Cursos de oratória e hermenêutica', 1),
('teaching_preaching', 'pt', 'Aprofundar conhecimento bíblico', 'Seminários teológicos e estudos avançados', 2),
('teaching_preaching', 'pt', 'Praticar hermenêutica', 'Livros de interpretação bíblica', 3),

-- Leadership & Administration
('leadership_admin', 'pt', 'Desenvolver habilidades de gestão', 'Cursos de liderança cristã', 1),
('leadership_admin', 'pt', 'Estudar princípios de liderança bíblica', 'Livros sobre liderança servidora', 2),
('leadership_admin', 'pt', 'Praticar delegação eficaz', 'Mentoria com líderes experientes', 3),

-- Counseling & Care
('counseling_care', 'pt', 'Estudar princípios de aconselhamento bíblico', 'Cursos de aconselhamento cristão', 1),
('counseling_care', 'pt', 'Desenvolver habilidades de escuta ativa', 'Treinamentos em comunicação', 2),
('counseling_care', 'pt', 'Aprender sobre psicologia bíblica', 'Literatura especializada', 3),

-- Social Ministry
('social_ministry', 'pt', 'Desenvolver habilidades práticas', 'Cursos técnicos e workshops', 1),
('social_ministry', 'pt', 'Estudar responsabilidade social cristã', 'Livros sobre missão integral', 2),
('social_ministry', 'pt', 'Aprender gestão de recursos', 'Cursos de administração de projetos', 3);

-- Insert Synergy Strengths
INSERT INTO public.synergy_strengths (primary_gift_key, secondary_gift_key, locale, strength_area, order_sequence)
VALUES
('A_PROPHECY', 'C_TEACHING', 'pt', 'Revelação profunda de verdades bíblicas', 1),
('A_PROPHECY', 'C_TEACHING', 'pt', 'Capacidade de ensinar com autoridade espiritual', 2),
('A_PROPHECY', 'C_TEACHING', 'pt', 'Clareza na comunicação de conceitos complexos', 3),

('B_SERVICE', 'G_MERCY', 'pt', 'Compaixão expressa através de ações concretas', 1),
('B_SERVICE', 'G_MERCY', 'pt', 'Capacidade de identificar e suprir necessidades', 2),
('B_SERVICE', 'G_MERCY', 'pt', 'Ministério eficaz de cuidado prático', 3),

('D_EXHORTATION', 'G_MERCY', 'pt', 'Encorajamento profundamente compassivo', 1),
('D_EXHORTATION', 'G_MERCY', 'pt', 'Habilidade de consolar e fortalecer simultaneamente', 2),
('D_EXHORTATION', 'G_MERCY', 'pt', 'Ministério eficaz de restauração emocional', 3);

-- Insert Synergy Challenges
INSERT INTO public.synergy_challenges (primary_gift_key, secondary_gift_key, locale, challenge, solution_hint, order_sequence)
VALUES
('A_PROPHECY', 'E_GIVING', 'pt', 'Tensão entre confrontação profética e generosidade', 'Equilibrar verdade com amor e timing apropriado', 1),
('A_PROPHECY', 'E_GIVING', 'pt', 'Dificuldade em ser compassivo ao confrontar', 'Desenvolver relacionamentos antes de corrigir', 2),

('F_LEADERSHIP', 'G_MERCY', 'pt', 'Dificuldade em tomar decisões firmes mas necessárias', 'Buscar sabedoria divina para decisões difíceis', 1),
('F_LEADERSHIP', 'G_MERCY', 'pt', 'Tendência a evitar confrontos necessários', 'Lembrar que liderança às vezes requer firmeza amorosa', 2);