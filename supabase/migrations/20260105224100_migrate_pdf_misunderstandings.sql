-- =========================================================
-- MIGRATE MISUNDERSTANDINGS FROM PDFs (4 per gift)
-- Exact content from source PDFs
-- =========================================================

-- PROFECIA - 4 Mal-entendidos (PDF página 3)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('A_PROPHECY', 'Ser direto pode ser visto como falta de amor', 'pt'),
('A_PROPHECY', 'Sua franqueza pode ser vista como insensibilidade', 'pt'),
('A_PROPHECY', 'Sua convicção pode ser vista como teimosia', 'pt'),
('A_PROPHECY', 'Seu zelo pode ser visto como fanatismo', 'pt')
ON CONFLICT DO NOTHING;

-- SERVIÇO - 4 Mal-entendidos (PDF página 5)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('B_SERVICE', 'Seu desejo de servir pode ser visto como busca de reconhecimento', 'pt'),
('B_SERVICE', 'Sua disponibilidade pode ser vista como falta de discernimento', 'pt'),
('B_SERVICE', 'Sua praticidade pode ser vista como falta de espiritualidade', 'pt'),
('B_SERVICE', 'Sua humildade pode ser vista como falta de ambição', 'pt')
ON CONFLICT DO NOTHING;

-- ENSINO - 4 Mal-entendidos (PDF página 7)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('C_TEACHING', 'Seu amor pela verdade pode ser visto como frieza', 'pt'),
('C_TEACHING', 'Sua precisão pode ser vista como perfeccionismo', 'pt'),
('C_TEACHING', 'Sua pesquisa pode ser vista como dúvida', 'pt'),
('C_TEACHING', 'Sua correção pode ser vista como crítica', 'pt')
ON CONFLICT DO NOTHING;

-- EXORTAÇÃO - 4 Mal-entendidos (PDF página 9)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('D_EXHORTATION', 'Seu otimismo pode ser visto como superficialidade', 'pt'),
('D_EXHORTATION', 'Seu encorajamento pode ser visto como minimizar problemas', 'pt'),
('D_EXHORTATION', 'Sua praticidade pode ser vista como falta de compaixão', 'pt'),
('D_EXHORTATION', 'Seu foco em soluções pode ser visto como impaciência', 'pt')
ON CONFLICT DO NOTHING;

-- CONTRIBUIÇÃO - 4 Mal-entendidos (PDF página 11)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('E_GIVING', 'Sua generosidade pode ser vista como ostentação', 'pt'),
('E_GIVING', 'Seu discernimento financeiro pode ser visto como avareza', 'pt'),
('E_GIVING', 'Sua sabedoria em dar pode ser vista como controle', 'pt'),
('E_GIVING', 'Seu interesse em projetos pode ser visto como falta de fé', 'pt')
ON CONFLICT DO NOTHING;

-- LIDERANÇA - 4 Mal-entendidos (PDF página 13)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('F_LEADERSHIP', 'Sua visão pode ser vista como ambição pessoal', 'pt'),
('F_LEADERSHIP', 'Sua organização pode ser vista como controle', 'pt'),
('F_LEADERSHIP', 'Sua delegação pode ser vista como preguiça', 'pt'),
('F_LEADERSHIP', 'Sua firmeza pode ser vista como insensibilidade', 'pt')
ON CONFLICT DO NOTHING;

-- MISERICÓRDIA - 4 Mal-entendidos (PDF página 14)
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('G_MERCY', 'Sua compaixão pode ser vista como fraqueza', 'pt'),
('G_MERCY', 'Sua sensibilidade pode ser vista como emocionalismo', 'pt'),
('G_MERCY', 'Sua empatia pode ser vista como falta de discernimento', 'pt'),
('G_MERCY', 'Sua paciência pode ser vista como permissividade', 'pt')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.misunderstandings IS 'Mal-entendidos comuns por dom espiritual - 4 por dom conforme PDFs';
