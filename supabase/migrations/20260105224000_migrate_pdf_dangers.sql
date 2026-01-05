-- =========================================================
-- MIGRATE DANGERS FROM PDFs (10 per gift)
-- Exact content from source PDFs
-- =========================================================

-- PROFECIA - 10 Perigos (PDF página 3)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('A_PROPHECY', 'Orgulhar-se de sua capacidade de discernir', 'pt'),
('A_PROPHECY', 'Desenvolver uma atitude de superioridade espiritual', 'pt'),
('A_PROPHECY', 'Negligenciar outros aspectos da vida cristã', 'pt'),
('A_PROPHECY', 'Ser impaciente com aqueles que não estão crescendo espiritualmente', 'pt'),
('A_PROPHECY', 'Rejeitar aqueles que não aceitam sua mensagem', 'pt'),
('A_PROPHECY', 'Ser insensível ao tempo de Deus', 'pt'),
('A_PROPHECY', 'Usar a verdade como arma', 'pt'),
('A_PROPHECY', 'Tornar-se crítico e julgador em excesso', 'pt'),
('A_PROPHECY', 'Falta de compaixão pelos fracos', 'pt'),
('A_PROPHECY', 'Isolar-se dos outros crentes', 'pt')
ON CONFLICT DO NOTHING;

-- SERVIÇO - 5 Perigos (PDF página 5)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('B_SERVICE', 'Orgulhar-se de suas obras', 'pt'),
('B_SERVICE', 'Sentir-se usado ou não apreciado', 'pt'),
('B_SERVICE', 'Julgar outros que não servem tanto', 'pt'),
('B_SERVICE', 'Negligenciar família por servir demais', 'pt'),
('B_SERVICE', 'Negligenciar vida devocional por excesso de atividades', 'pt')
ON CONFLICT DO NOTHING;

-- ENSINO - 10 Perigos (PDF página 7)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('C_TEACHING', 'Orgulho intelectual', 'pt'),
('C_TEACHING', 'Enfatizar conhecimento acima de aplicação prática', 'pt'),
('C_TEACHING', 'Tornar-se crítico com ensinos de outros', 'pt'),
('C_TEACHING', 'Negligenciar relacionamento pessoal com Deus', 'pt'),
('C_TEACHING', 'Usar ensino para controlar ou manipular', 'pt'),
('C_TEACHING', 'Ser impaciente com quem não aprende rápido', 'pt'),
('C_TEACHING', 'Valorizar conhecimento acima de sabedoria', 'pt'),
('C_TEACHING', 'Negligenciar outras áreas da vida cristã', 'pt'),
('C_TEACHING', 'Tornar-se dogmático e inflexível', 'pt'),
('C_TEACHING', 'Desprezar experiências emocionais', 'pt')
ON CONFLICT DO NOTHING;

-- EXORTAÇÃO - 10 Perigos (PDF página 9)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('D_EXHORTATION', 'Oferecer soluções rápidas sem ouvir adequadamente', 'pt'),
('D_EXHORTATION', 'Ser superficial ao lidar com problemas profundos', 'pt'),
('D_EXHORTATION', 'Tornar-se impaciente com quem não muda rapidamente', 'pt'),
('D_EXHORTATION', 'Minimizar a dor alheia com otimismo excessivo', 'pt'),
('D_EXHORTATION', 'Assumir responsabilidade pelos problemas dos outros', 'pt'),
('D_EXHORTATION', 'Negligenciar próprias necessidades', 'pt'),
('D_EXHORTATION', 'Dar conselhos sem ser solicitado', 'pt'),
('D_EXHORTATION', 'Usar versículos bíblicos de forma simplista', 'pt'),
('D_EXHORTATION', 'Evitar confrontação necessária', 'pt'),
('D_EXHORTATION', 'Tornar-se dependente de ser necessário', 'pt')
ON CONFLICT DO NOTHING;

-- CONTRIBUIÇÃO - 10 Perigos (PDF página 11)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('E_GIVING', 'Usar dinheiro para controlar ou manipular', 'pt'),
('E_GIVING', 'Desenvolver orgulho pela capacidade de dar', 'pt'),
('E_GIVING', 'Julgar outros que dão menos', 'pt'),
('E_GIVING', 'Negligenciar outras áreas espirituais', 'pt'),
('E_GIVING', 'Dar por obrigação ao invés de alegria', 'pt'),
('E_GIVING', 'Esperar reconhecimento pelas doações', 'pt'),
('E_GIVING', 'Ser avarento em outras áreas', 'pt'),
('E_GIVING', 'Medir espiritualidade por contribuições financeiras', 'pt'),
('E_GIVING', 'Negligenciar tempo e talentos focando só em dinheiro', 'pt'),
('E_GIVING', 'Tornar-se materialista', 'pt')
ON CONFLICT DO NOTHING;

-- LIDERANÇA - 10 Perigos (PDF página 13)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('F_LEADERSHIP', 'Desenvolver autoritarismo', 'pt'),
('F_LEADERSHIP', 'Usar pessoas para alcançar objetivos', 'pt'),
('F_LEADERSHIP', 'Desenvolver orgulho pela posição', 'pt'),
('F_LEADERSHIP', 'Negligenciar cuidado pastoral por focar em resultados', 'pt'),
('F_LEADERSHIP', 'Tomar decisões sem buscar conselho', 'pt'),
('F_LEADERSHIP', 'Ser impaciente com processos lentos', 'pt'),
('F_LEADERSHIP', 'Negligenciar detalhes importantes', 'pt'),
('F_LEADERSHIP', 'Ser insensível às necessidades individuais', 'pt'),
('F_LEADERSHIP', 'Delegar responsabilidade sem autoridade', 'pt'),
('F_LEADERSHIP', 'Tornar-se workaholic', 'pt')
ON CONFLICT DO NOTHING;

-- MISERICÓRDIA - 10 Perigos (PDF página 14)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('G_MERCY', 'Orgulhar-se de sua capacidade de empatia', 'pt'),
('G_MERCY', 'Confiar plenamente em seus sentimentos', 'pt'),
('G_MERCY', 'Tomar decisões baseadas mais nas emoções do que na lógica', 'pt'),
('G_MERCY', 'Usar toda a sensibilidade em seus problemas e em si mesmo', 'pt'),
('G_MERCY', 'Ver pessoas com outros dons como insensíveis', 'pt'),
('G_MERCY', 'Não ter firmeza ao aconselhar ou confrontar', 'pt'),
('G_MERCY', 'Empatizar-se com quem não merece empatia', 'pt'),
('G_MERCY', 'Amargurar-se por sofrimentos passados', 'pt'),
('G_MERCY', 'Retirar-se facilmente sentido pela insensibilidade dos outros', 'pt'),
('G_MERCY', 'Ser manipulado por pessoas que abusam da bondade', 'pt')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.dangers IS 'Perigos específicos por dom espiritual - 10 por dom (5 para Serviço) conforme PDFs';
