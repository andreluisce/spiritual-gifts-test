-- Add Spanish translations for gift_pair_insights
-- This migration adds Spanish language support for gift compatibility analysis

-- Insert Spanish translations for gift pair insights
-- Using the correct column names: gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples

-- SERVIÇO (B_SERVICE) + EXORTAÇÃO (D_EXHORTATION)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('B_SERVICE', 'D_EXHORTATION', 72, 'Combinación de dones complementaria',
  '["Diversidad de perspectivas", "Capacidad ministerial integral"]'::jsonb,
  '["Necesidad de integrar diferentes enfoques"]'::jsonb,
  '["Equilibrar el servicio práctico con el aliento espiritual", "Crear espacios para ambos dones"]'::jsonb,
  '["Servir en ministerios de cuidado pastoral", "Liderar grupos de apoyo"]'::jsonb,
  'es', 'active');

-- SERVIÇO (B_SERVICE) + ENSINO (C_TEACHING)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('B_SERVICE', 'C_TEACHING', 75, 'Combinación práctica y educativa',
  '["Servicio con fundamento bíblico", "Enseñanza aplicada"]'::jsonb,
  '["Equilibrar teoría y práctica"]'::jsonb,
  '["Crear programas de capacitación práctica", "Desarrollar materiales didácticos aplicados"]'::jsonb,
  '["Escuelas bíblicas con enfoque práctico", "Talleres de formación ministerial"]'::jsonb,
  'es', 'active');

-- PROFECIA (A_PROPHECY) + EXORTAÇÃO (D_EXHORTATION)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('A_PROPHECY', 'D_EXHORTATION', 78, 'Combinación poderosa de verdad y ánimo',
  '["Mensaje profético con aplicación práctica", "Balance entre corrección y edificación"]'::jsonb,
  '["Riesgo de ser muy directo sin sensibilidad"]'::jsonb,
  '["Templar la verdad con amor", "Buscar el momento apropiado para hablar"]'::jsonb,
  '["Predicación profética que edifica", "Consejería espiritual directa pero amorosa"]'::jsonb,
  'es', 'active');

-- PROFECIA (A_PROPHECY) + ENSINO (C_TEACHING)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('A_PROPHECY', 'C_TEACHING', 80, 'Verdad revelada con fundamento sólido',
  '["Enseñanza profunda basada en revelación", "Capacidad de exponer verdades complejas"]'::jsonb,
  '["Puede ser demasiado intenso para algunos"]'::jsonb,
  '["Adaptar el mensaje a la audiencia", "Incluir aplicaciones prácticas"]'::jsonb,
  '["Enseñanza bíblica profética", "Exposición de las Escrituras con revelación"]'::jsonb,
  'es', 'active');

-- ENSINO (C_TEACHING) + EXORTAÇÃO (D_EXHORTATION)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('C_TEACHING', 'D_EXHORTATION', 82, 'Educación que transforma vidas',
  '["Enseñanza que motiva al cambio", "Contenido aplicado a la vida diaria"]'::jsonb,
  '["Equilibrar contenido y aplicación"]'::jsonb,
  '["Incluir testimonios y ejemplos prácticos", "Crear espacios para aplicación personal"]'::jsonb,
  '["Clases bíblicas transformadoras", "Grupos de discipulado"]'::jsonb,
  'es', 'active');

-- ENSINO (C_TEACHING) + LIDERANÇA (F_LEADERSHIP)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('C_TEACHING', 'F_LEADERSHIP', 85, 'Liderazgo con fundamento doctrinal',
  '["Dirección basada en principios bíblicos", "Capacidad de formar líderes"]'::jsonb,
  '["Puede enfocarse demasiado en teoría"]'::jsonb,
  '["Balancear enseñanza con acción", "Delegar responsabilidades prácticas"]'::jsonb,
  '["Escuelas de liderazgo", "Mentoría de líderes"]'::jsonb,
  'es', 'active');

-- EXORTAÇÃO (D_EXHORTATION) + CONTRIBUIÇÃO (E_GIVING)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('D_EXHORTATION', 'E_GIVING', 77, 'Ánimo generoso y práctico',
  '["Apoyo integral (emocional y material)", "Ministerio de ayuda efectivo"]'::jsonb,
  '["Puede descuidar límites personales"]'::jsonb,
  '["Establecer límites saludables", "Discernir necesidades reales"]'::jsonb,
  '["Ministerio de benevolencia", "Apoyo a familias necesitadas"]'::jsonb,
  'es', 'active');

-- EXORTAÇÃO (D_EXHORTATION) + MISERICÓRDIA (G_MERCY)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('D_EXHORTATION', 'G_MERCY', 88, 'Compasión que restaura',
  '["Empatía profunda con acción", "Ministerio de restauración poderoso"]'::jsonb,
  '["Riesgo de agotamiento emocional"]'::jsonb,
  '["Practicar autocuidado", "Establecer límites emocionales"]'::jsonb,
  '["Consejería pastoral", "Ministerio de restauración"]'::jsonb,
  'es', 'active');

-- CONTRIBUIÇÃO (E_GIVING) + LIDERANÇA (F_LEADERSHIP)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('E_GIVING', 'F_LEADERSHIP', 79, 'Liderazgo generoso y visionario',
  '["Capacidad de movilizar recursos", "Visión para proyectos grandes"]'::jsonb,
  '["Puede enfocarse demasiado en resultados"]'::jsonb,
  '["Recordar el valor de las personas sobre proyectos", "Celebrar pequeñas victorias"]'::jsonb,
  '["Liderazgo de proyectos misioneros", "Desarrollo de infraestructura ministerial"]'::jsonb,
  'es', 'active');

-- CONTRIBUIÇÃO (E_GIVING) + MISERICÓRDIA (G_MERCY)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('E_GIVING', 'G_MERCY', 76, 'Generosidad compasiva',
  '["Ayuda práctica con sensibilidad", "Ministerio de compasión efectivo"]'::jsonb,
  '["Puede ser manipulado por necesidades falsas"]'::jsonb,
  '["Desarrollar discernimiento", "Buscar consejo antes de grandes donaciones"]'::jsonb,
  '["Ministerio social de la iglesia", "Apoyo a poblaciones vulnerables"]'::jsonb,
  'es', 'active');

-- LIDERANÇA (F_LEADERSHIP) + MISERICÓRDIA (G_MERCY)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('F_LEADERSHIP', 'G_MERCY', 74, 'Liderazgo con corazón pastoral',
  '["Dirección con sensibilidad", "Cuidado por el equipo"]'::jsonb,
  '["Puede tener dificultad en decisiones difíciles"]'::jsonb,
  '["Equilibrar compasión con firmeza", "Tomar decisiones basadas en principios"]'::jsonb,
  '["Liderazgo pastoral", "Gestión de equipos ministeriales"]'::jsonb,
  'es', 'active');

-- LIDERANÇA (F_LEADERSHIP) + PROFECIA (A_PROPHECY)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('A_PROPHECY', 'F_LEADERSHIP', 81, 'Liderazgo profético y visionario',
  '["Visión clara del propósito divino", "Capacidad de guiar con convicción"]'::jsonb,
  '["Puede ser percibido como inflexible"]'::jsonb,
  '["Comunicar la visión con claridad", "Escuchar otras perspectivas"]'::jsonb,
  '["Liderazgo de movimientos espirituales", "Plantación de iglesias"]'::jsonb,
  'es', 'active');

-- MISERICÓRDIA (G_MERCY) + PROFECIA (A_PROPHECY)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('A_PROPHECY', 'G_MERCY', 70, 'Compasión con verdad',
  '["Balance entre gracia y verdad", "Ministerio de restauración con fundamento"]'::jsonb,
  '["Tensión entre compasión y confrontación"]'::jsonb,
  '["Buscar el tiempo de Dios para cada acción", "Orar por sabiduría"]'::jsonb,
  '["Ministerio de restauración", "Consejería con fundamento bíblico"]'::jsonb,
  'es', 'active');

-- MISERICÓRDIA (G_MERCY) + SERVIÇO (B_SERVICE)
INSERT INTO gift_pair_insights (gift_a, gift_b, synergy_score, summary, strengths, risks, mitigations, examples, language, status)
VALUES ('B_SERVICE', 'G_MERCY', 83, 'Servicio compasivo',
  '["Ayuda práctica con empatía", "Ministerio de cuidado integral"]'::jsonb,
  '["Puede agotarse emocionalmente"]'::jsonb,
  '["Establecer límites saludables", "Trabajar en equipo"]'::jsonb,
  '["Ministerio de salud", "Cuidado de enfermos y ancianos"]'::jsonb,
  'es', 'active');

-- Add comment
COMMENT ON TABLE gift_pair_insights IS 'Insights about gift compatibility in multiple languages (pt, en, es)';
