-- =========================================================
-- ENHANCED QUALITIES - Theological/Pastoral Psychology Approach
-- Qualidades específicas e profundas para cada dom espiritual
-- Baseadas em teologia bíblica e psicologia pastoral
-- =========================================================

-- Limpar qualidades antigas (genéricas)
DELETE FROM public.qualities WHERE locale = 'pt';

-- =========================================================
-- PROFECIA (A_PROPHECY)
-- Foco: Discernimento espiritual e coragem profética
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('A_PROPHECY', 'Intimidade profunda com Deus através da oração contemplativa', 'pt'),
('A_PROPHECY', 'Coragem para confrontar o pecado sem comprometer a verdade', 'pt'),
('A_PROPHECY', 'Discernimento espiritual para distinguir a voz de Deus', 'pt'),
('A_PROPHECY', 'Compaixão pastoral que equilibra verdade e graça', 'pt'),
('A_PROPHECY', 'Submissão à autoridade bíblica acima das emoções', 'pt'),
('A_PROPHECY', 'Paciência para aguardar o tempo de Deus na revelação', 'pt'),
('A_PROPHECY', 'Humildade para reconhecer limitações no conhecimento profético', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- SERVIÇO (B_SERVICE)
-- Foco: Amor prático e disponibilidade sacrificial
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('B_SERVICE', 'Coração de servo moldado à imagem de Cristo', 'pt'),
('B_SERVICE', 'Discernimento para identificar necessidades não verbalizadas', 'pt'),
('B_SERVICE', 'Alegria genuína em trabalhar nos bastidores sem reconhecimento', 'pt'),
('B_SERVICE', 'Fidelidade nas pequenas tarefas como preparação para maiores', 'pt'),
('B_SERVICE', 'Equilíbrio saudável entre servir e cuidar de si mesmo', 'pt'),
('B_SERVICE', 'Sabedoria para dizer "não" quando necessário sem culpa', 'pt'),
('B_SERVICE', 'Motivação pura focada em glorificar a Deus, não buscar aprovação', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- ENSINO (C_TEACHING)
-- Foco: Clareza doutrinária e transformação de vidas
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('C_TEACHING', 'Paixão por estudar as Escrituras com rigor hermenêutico', 'pt'),
('C_TEACHING', 'Habilidade de contextualizar verdades eternas para hoje', 'pt'),
('C_TEACHING', 'Paciência pedagógica com diferentes ritmos de aprendizado', 'pt'),
('C_TEACHING', 'Integridade entre o que ensina e como vive', 'pt'),
('C_TEACHING', 'Sensibilidade ao Espírito Santo durante o ensino', 'pt'),
('C_TEACHING', 'Compromisso com a ortodoxia sem cair no legalismo', 'pt'),
('C_TEACHING', 'Amor genuíno pelos alunos além da transmissão de conhecimento', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- EXORTAÇÃO (D_EXHORTATION)
-- Foco: Encorajamento terapêutico e restauração emocional
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('D_EXHORTATION', 'Empatia profunda que valida a dor antes de oferecer soluções', 'pt'),
('D_EXHORTATION', 'Sabedoria para discernir entre consolo e confrontação necessária', 'pt'),
('D_EXHORTATION', 'Esperança contagiante fundamentada nas promessas de Deus', 'pt'),
('D_EXHORTATION', 'Escuta ativa que ouve além das palavras ditas', 'pt'),
('D_EXHORTATION', 'Equilíbrio entre verdade bíblica e sensibilidade emocional', 'pt'),
('D_EXHORTATION', 'Paciência com processos de cura que levam tempo', 'pt'),
('D_EXHORTATION', 'Autenticidade vulnerável que inspira confiança', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- CONTRIBUIÇÃO (E_GIVING)
-- Foco: Generosidade sacrificial e mordomia fiel
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('E_GIVING', 'Desprendimento material que reflete confiança em Deus', 'pt'),
('E_GIVING', 'Discernimento espiritual para investir no Reino estrategicamente', 'pt'),
('E_GIVING', 'Alegria sacrificial que dá além do confortável', 'pt'),
('E_GIVING', 'Sabedoria financeira para multiplicar recursos para o Reino', 'pt'),
('E_GIVING', 'Humildade para dar anonimamente sem buscar reconhecimento', 'pt'),
('E_GIVING', 'Sensibilidade às necessidades reais versus aparentes', 'pt'),
('E_GIVING', 'Visão de longo prazo para investimentos eternos', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- LIDERANÇA (F_LEADERSHIP)
-- Foco: Liderança servidora e visão estratégica
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('F_LEADERSHIP', 'Visão profética alinhada com os propósitos de Deus', 'pt'),
('F_LEADERSHIP', 'Integridade de caráter que inspira confiança e lealdade', 'pt'),
('F_LEADERSHIP', 'Humildade para liderar servindo, não dominando', 'pt'),
('F_LEADERSHIP', 'Coragem para tomar decisões difíceis com sabedoria', 'pt'),
('F_LEADERSHIP', 'Capacidade de desenvolver e empoderar outros líderes', 'pt'),
('F_LEADERSHIP', 'Equilíbrio entre firmeza e compaixão pastoral', 'pt'),
('F_LEADERSHIP', 'Resiliência emocional para suportar críticas e pressões', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- MISERICÓRDIA (G_MERCY)
-- Foco: Compaixão terapêutica e cura emocional
-- =========================================================
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('G_MERCY', 'Empatia profunda que sente a dor alheia como própria', 'pt'),
('G_MERCY', 'Presença terapêutica que traz conforto pela simples proximidade', 'pt'),
('G_MERCY', 'Sabedoria para oferecer ajuda que capacita, não cria dependência', 'pt'),
('G_MERCY', 'Equilíbrio emocional para não absorver a dor dos outros', 'pt'),
('G_MERCY', 'Discernimento para identificar manipulação emocional', 'pt'),
('G_MERCY', 'Paciência com processos de restauração que levam tempo', 'pt'),
('G_MERCY', 'Firmeza amorosa para confrontar quando necessário', 'pt')
ON CONFLICT DO NOTHING;

-- =========================================================
-- Adicionar traduções em Inglês
-- =========================================================

-- PROFECIA (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('A_PROPHECY', 'Deep intimacy with God through contemplative prayer', 'en'),
('A_PROPHECY', 'Courage to confront sin without compromising truth', 'en'),
('A_PROPHECY', 'Spiritual discernment to distinguish God''s voice', 'en'),
('A_PROPHECY', 'Pastoral compassion that balances truth and grace', 'en'),
('A_PROPHECY', 'Submission to biblical authority above emotions', 'en'),
('A_PROPHECY', 'Patience to await God''s timing in revelation', 'en'),
('A_PROPHECY', 'Humility to recognize limitations in prophetic knowledge', 'en')
ON CONFLICT DO NOTHING;

-- SERVIÇO (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('B_SERVICE', 'Servant heart molded in Christ''s image', 'en'),
('B_SERVICE', 'Discernment to identify unspoken needs', 'en'),
('B_SERVICE', 'Genuine joy in working behind the scenes without recognition', 'en'),
('B_SERVICE', 'Faithfulness in small tasks as preparation for greater ones', 'en'),
('B_SERVICE', 'Healthy balance between serving and self-care', 'en'),
('B_SERVICE', 'Wisdom to say "no" when necessary without guilt', 'en'),
('B_SERVICE', 'Pure motivation focused on glorifying God, not seeking approval', 'en')
ON CONFLICT DO NOTHING;

-- ENSINO (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('C_TEACHING', 'Passion for studying Scripture with hermeneutical rigor', 'en'),
('C_TEACHING', 'Ability to contextualize eternal truths for today', 'en'),
('C_TEACHING', 'Pedagogical patience with different learning paces', 'en'),
('C_TEACHING', 'Integrity between what is taught and how one lives', 'en'),
('C_TEACHING', 'Sensitivity to the Holy Spirit during teaching', 'en'),
('C_TEACHING', 'Commitment to orthodoxy without falling into legalism', 'en'),
('C_TEACHING', 'Genuine love for students beyond knowledge transmission', 'en')
ON CONFLICT DO NOTHING;

-- EXORTAÇÃO (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('D_EXHORTATION', 'Deep empathy that validates pain before offering solutions', 'en'),
('D_EXHORTATION', 'Wisdom to discern between comfort and necessary confrontation', 'en'),
('D_EXHORTATION', 'Contagious hope grounded in God''s promises', 'en'),
('D_EXHORTATION', 'Active listening that hears beyond spoken words', 'en'),
('D_EXHORTATION', 'Balance between biblical truth and emotional sensitivity', 'en'),
('D_EXHORTATION', 'Patience with healing processes that take time', 'en'),
('D_EXHORTATION', 'Vulnerable authenticity that inspires trust', 'en')
ON CONFLICT DO NOTHING;

-- CONTRIBUIÇÃO (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('E_GIVING', 'Material detachment that reflects trust in God', 'en'),
('E_GIVING', 'Spiritual discernment to invest strategically in the Kingdom', 'en'),
('E_GIVING', 'Sacrificial joy that gives beyond comfort', 'en'),
('E_GIVING', 'Financial wisdom to multiply resources for the Kingdom', 'en'),
('E_GIVING', 'Humility to give anonymously without seeking recognition', 'en'),
('E_GIVING', 'Sensitivity to real versus apparent needs', 'en'),
('E_GIVING', 'Long-term vision for eternal investments', 'en')
ON CONFLICT DO NOTHING;

-- LIDERANÇA (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('F_LEADERSHIP', 'Prophetic vision aligned with God''s purposes', 'en'),
('F_LEADERSHIP', 'Character integrity that inspires trust and loyalty', 'en'),
('F_LEADERSHIP', 'Humility to lead by serving, not dominating', 'en'),
('F_LEADERSHIP', 'Courage to make difficult decisions with wisdom', 'en'),
('F_LEADERSHIP', 'Capacity to develop and empower other leaders', 'en'),
('F_LEADERSHIP', 'Balance between firmness and pastoral compassion', 'en'),
('F_LEADERSHIP', 'Emotional resilience to endure criticism and pressure', 'en')
ON CONFLICT DO NOTHING;

-- MISERICÓRDIA (EN)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('G_MERCY', 'Deep empathy that feels others'' pain as one''s own', 'en'),
('G_MERCY', 'Therapeutic presence that brings comfort through proximity', 'en'),
('G_MERCY', 'Wisdom to offer help that empowers, not creates dependency', 'en'),
('G_MERCY', 'Emotional balance to not absorb others'' pain', 'en'),
('G_MERCY', 'Discernment to identify emotional manipulation', 'en'),
('G_MERCY', 'Patience with restoration processes that take time', 'en'),
('G_MERCY', 'Loving firmness to confront when necessary', 'en')
ON CONFLICT DO NOTHING;

-- =========================================================
-- Adicionar traduções em Espanhol
-- =========================================================

-- PROFECIA (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('A_PROPHECY', 'Intimidad profunda con Dios a través de la oración contemplativa', 'es'),
('A_PROPHECY', 'Valentía para confrontar el pecado sin comprometer la verdad', 'es'),
('A_PROPHECY', 'Discernimiento espiritual para distinguir la voz de Dios', 'es'),
('A_PROPHECY', 'Compasión pastoral que equilibra verdad y gracia', 'es'),
('A_PROPHECY', 'Sumisión a la autoridad bíblica por encima de las emociones', 'es'),
('A_PROPHECY', 'Paciencia para esperar el tiempo de Dios en la revelación', 'es'),
('A_PROPHECY', 'Humildad para reconocer limitaciones en el conocimiento profético', 'es')
ON CONFLICT DO NOTHING;

-- SERVIÇO (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('B_SERVICE', 'Corazón de siervo moldeado a la imagen de Cristo', 'es'),
('B_SERVICE', 'Discernimiento para identificar necesidades no verbalizadas', 'es'),
('B_SERVICE', 'Alegría genuina en trabajar tras bambalinas sin reconocimiento', 'es'),
('B_SERVICE', 'Fidelidad en las tareas pequeñas como preparación para mayores', 'es'),
('B_SERVICE', 'Equilibrio saludable entre servir y cuidarse a sí mismo', 'es'),
('B_SERVICE', 'Sabiduría para decir "no" cuando sea necesario sin culpa', 'es'),
('B_SERVICE', 'Motivación pura enfocada en glorificar a Dios, no buscar aprobación', 'es')
ON CONFLICT DO NOTHING;

-- ENSINO (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('C_TEACHING', 'Pasión por estudiar las Escrituras con rigor hermenéutico', 'es'),
('C_TEACHING', 'Habilidad para contextualizar verdades eternas para hoy', 'es'),
('C_TEACHING', 'Paciencia pedagógica con diferentes ritmos de aprendizaje', 'es'),
('C_TEACHING', 'Integridad entre lo que enseña y cómo vive', 'es'),
('C_TEACHING', 'Sensibilidad al Espíritu Santo durante la enseñanza', 'es'),
('C_TEACHING', 'Compromiso con la ortodoxia sin caer en el legalismo', 'es'),
('C_TEACHING', 'Amor genuino por los estudiantes más allá de la transmisión de conocimiento', 'es')
ON CONFLICT DO NOTHING;

-- EXORTAÇÃO (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('D_EXHORTATION', 'Empatía profunda que valida el dolor antes de ofrecer soluciones', 'es'),
('D_EXHORTATION', 'Sabiduría para discernir entre consuelo y confrontación necesaria', 'es'),
('D_EXHORTATION', 'Esperanza contagiosa fundamentada en las promesas de Dios', 'es'),
('D_EXHORTATION', 'Escucha activa que oye más allá de las palabras dichas', 'es'),
('D_EXHORTATION', 'Equilibrio entre verdad bíblica y sensibilidad emocional', 'es'),
('D_EXHORTATION', 'Paciencia con procesos de sanación que llevan tiempo', 'es'),
('D_EXHORTATION', 'Autenticidad vulnerable que inspira confianza', 'es')
ON CONFLICT DO NOTHING;

-- CONTRIBUIÇÃO (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('E_GIVING', 'Desprendimiento material que refleja confianza en Dios', 'es'),
('E_GIVING', 'Discernimiento espiritual para invertir estratégicamente en el Reino', 'es'),
('E_GIVING', 'Alegría sacrificial que da más allá de lo cómodo', 'es'),
('E_GIVING', 'Sabiduría financiera para multiplicar recursos para el Reino', 'es'),
('E_GIVING', 'Humildad para dar anónimamente sin buscar reconocimiento', 'es'),
('E_GIVING', 'Sensibilidad a las necesidades reales versus aparentes', 'es'),
('E_GIVING', 'Visión a largo plazo para inversiones eternas', 'es')
ON CONFLICT DO NOTHING;

-- LIDERANÇA (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('F_LEADERSHIP', 'Visión profética alineada con los propósitos de Dios', 'es'),
('F_LEADERSHIP', 'Integridad de carácter que inspira confianza y lealtad', 'es'),
('F_LEADERSHIP', 'Humildad para liderar sirviendo, no dominando', 'es'),
('F_LEADERSHIP', 'Valentía para tomar decisiones difíciles con sabiduría', 'es'),
('F_LEADERSHIP', 'Capacidad de desarrollar y empoderar a otros líderes', 'es'),
('F_LEADERSHIP', 'Equilibrio entre firmeza y compasión pastoral', 'es'),
('F_LEADERSHIP', 'Resiliencia emocional para soportar críticas y presiones', 'es')
ON CONFLICT DO NOTHING;

-- MISERICÓRDIA (ES)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('G_MERCY', 'Empatía profunda que siente el dolor ajeno como propio', 'es'),
('G_MERCY', 'Presencia terapéutica que trae consuelo por la simple proximidad', 'es'),
('G_MERCY', 'Sabiduría para ofrecer ayuda que capacita, no crea dependencia', 'es'),
('G_MERCY', 'Equilibrio emocional para no absorber el dolor de otros', 'es'),
('G_MERCY', 'Discernimiento para identificar manipulación emocional', 'es'),
('G_MERCY', 'Paciencia con procesos de restauración que llevan tiempo', 'es'),
('G_MERCY', 'Firmeza amorosa para confrontar cuando sea necesario', 'es')
ON CONFLICT DO NOTHING;

-- Comentário final
COMMENT ON TABLE public.qualities IS 'Qualidades teológicas/pastorais específicas para cada dom espiritual - 7 por dom com abordagem profunda';
