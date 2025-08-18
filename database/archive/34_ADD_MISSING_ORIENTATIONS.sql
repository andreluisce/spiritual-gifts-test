-- ================================================
-- ADD MISSING GIFT ORIENTATIONS (GIVING & LEADERSHIP)
-- ================================================

-- ================================================
-- GIVING ORIENTATIONS
-- ================================================

-- Portuguese
INSERT INTO gift_orientations (gift_key, locale, orientation, category, order_sequence) VALUES
('E_GIVING', 'pt', 'Busque a direção de Deus antes de fazer doações importantes', 'spiritual', 1),
('E_GIVING', 'pt', 'Pratique a generosidade sistemática, não apenas impulsiva', 'practical', 2),
('E_GIVING', 'pt', 'Invista tempo conhecendo necessidades reais antes de doar', 'development', 3),
('E_GIVING', 'pt', 'Mantenha sua vida financeira organizada para dar com sabedoria', 'practical', 4),
('E_GIVING', 'pt', 'Dê discretamente, evitando chamar atenção para si mesmo', 'spiritual', 5),
('E_GIVING', 'pt', 'Ensine outros sobre generosidade através do seu exemplo', 'development', 6);

-- English
INSERT INTO gift_orientations (gift_key, locale, orientation, category, order_sequence) VALUES
('E_GIVING', 'en', 'Seek God''s direction before making important donations', 'spiritual', 1),
('E_GIVING', 'en', 'Practice systematic generosity, not just impulsive giving', 'practical', 2),
('E_GIVING', 'en', 'Invest time understanding real needs before donating', 'development', 3),
('E_GIVING', 'en', 'Keep your financial life organized to give with wisdom', 'practical', 4),
('E_GIVING', 'en', 'Give discretely, avoiding drawing attention to yourself', 'spiritual', 5),
('E_GIVING', 'en', 'Teach others about generosity through your example', 'development', 6);

-- Spanish
INSERT INTO gift_orientations (gift_key, locale, orientation, category, order_sequence) VALUES
('E_GIVING', 'es', 'Busca la dirección de Dios antes de hacer donaciones importantes', 'spiritual', 1),
('E_GIVING', 'es', 'Practica la generosidad sistemática, no solo impulsiva', 'practical', 2),
('E_GIVING', 'es', 'Invierte tiempo conociendo necesidades reales antes de donar', 'development', 3),
('E_GIVING', 'es', 'Mantén tu vida financiera organizada para dar con sabiduría', 'practical', 4),
('E_GIVING', 'es', 'Da discretamente, evitando llamar la atención sobre ti mismo', 'spiritual', 5),
('E_GIVING', 'es', 'Enseña a otros sobre generosidad a través de tu ejemplo', 'development', 6);

-- ================================================
-- LEADERSHIP ORIENTATIONS
-- ================================================

-- Portuguese
INSERT INTO gift_orientations (gift_key, locale, orientation, category, order_sequence) VALUES
('F_LEADERSHIP', 'pt', 'Desenvolva uma visão clara e comunique-a efetivamente', 'practical', 1),
('F_LEADERSHIP', 'pt', 'Aprenda a delegar responsabilidades e empoderar outros', 'development', 2),
('F_LEADERSHIP', 'pt', 'Mantenha-se responsável perante outros líderes maduros', 'spiritual', 3),
('F_LEADERSHIP', 'pt', 'Equilibre decisões firmes com humildade e escuta', 'development', 4),
('F_LEADERSHIP', 'pt', 'Invista no desenvolvimento de futuros líderes', 'practical', 5),
('F_LEADERSHIP', 'pt', 'Lidere pelo exemplo, não apenas por autoridade', 'spiritual', 6),
('F_LEADERSHIP', 'pt', 'Busque constantemente crescimento em sabedoria e caráter', 'spiritual', 7);

-- English
INSERT INTO gift_orientations (gift_key, locale, orientation, category, order_sequence) VALUES
('F_LEADERSHIP', 'en', 'Develop a clear vision and communicate it effectively', 'practical', 1),
('F_LEADERSHIP', 'en', 'Learn to delegate responsibilities and empower others', 'development', 2),
('F_LEADERSHIP', 'en', 'Stay accountable to other mature leaders', 'spiritual', 3),
('F_LEADERSHIP', 'en', 'Balance firm decisions with humility and listening', 'development', 4),
('F_LEADERSHIP', 'en', 'Invest in developing future leaders', 'practical', 5),
('F_LEADERSHIP', 'en', 'Lead by example, not just by authority', 'spiritual', 6),
('F_LEADERSHIP', 'en', 'Constantly seek growth in wisdom and character', 'spiritual', 7);

-- Spanish
INSERT INTO gift_orientations (gift_key, locale, orientation, category, order_sequence) VALUES
('F_LEADERSHIP', 'es', 'Desarrolla una visión clara y comunícala efectivamente', 'practical', 1),
('F_LEADERSHIP', 'es', 'Aprende a delegar responsabilidades y empoderar a otros', 'development', 2),
('F_LEADERSHIP', 'es', 'Mantente responsable ante otros líderes maduros', 'spiritual', 3),
('F_LEADERSHIP', 'es', 'Equilibra decisiones firmes con humildad y escucha', 'development', 4),
('F_LEADERSHIP', 'es', 'Invierte en el desarrollo de futuros líderes', 'practical', 5),
('F_LEADERSHIP', 'es', 'Lidera con el ejemplo, no solo por autoridad', 'spiritual', 6),
('F_LEADERSHIP', 'es', 'Busca constantemente crecimiento en sabiduría y carácter', 'spiritual', 7);