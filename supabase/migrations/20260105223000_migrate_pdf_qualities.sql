-- =========================================================
-- MIGRATE QUALITIES FROM PDFs (7 per gift)
-- Exact content from source PDFs
-- =========================================================

-- PROFECIA - 7 Qualidades (PDF página 2)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('A_PROPHECY', 'Um relacionamento certo com Deus', 'pt'),
('A_PROPHECY', 'Honestidade', 'pt'),
('A_PROPHECY', 'Humildade', 'pt'),
('A_PROPHECY', 'Obediência', 'pt'),
('A_PROPHECY', 'Fé', 'pt'),
('A_PROPHECY', 'Amor', 'pt'),
('A_PROPHECY', 'Autocontrole', 'pt')
ON CONFLICT DO NOTHING;

-- SERVIÇO - 7 Qualidades (PDF página 4)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('B_SERVICE', 'Disponibilidade', 'pt'),
('B_SERVICE', 'Fidelidade', 'pt'),
('B_SERVICE', 'Humildade', 'pt'),
('B_SERVICE', 'Alegria', 'pt'),
('B_SERVICE', 'Lealdade', 'pt'),
('B_SERVICE', 'Obediência', 'pt'),
('B_SERVICE', 'Pontualidade', 'pt')
ON CONFLICT DO NOTHING;

-- ENSINO - 7 Qualidades (PDF página 6)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('C_TEACHING', 'Humildade', 'pt'),
('C_TEACHING', 'Sinceridade e honestidade', 'pt'),
('C_TEACHING', 'Conscientização e escrupulosidade', 'pt'),
('C_TEACHING', 'Fé', 'pt'),
('C_TEACHING', 'Amor', 'pt'),
('C_TEACHING', 'Paciência', 'pt'),
('C_TEACHING', 'Sabedoria', 'pt')
ON CONFLICT DO NOTHING;

-- EXORTAÇÃO - 7 Qualidades (PDF página 8)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('D_EXHORTATION', 'Humildade', 'pt'),
('D_EXHORTATION', 'Disponibilidade', 'pt'),
('D_EXHORTATION', 'Relação certa com Deus e um andar no Espírito', 'pt'),
('D_EXHORTATION', 'Amor', 'pt'),
('D_EXHORTATION', 'Sabedoria', 'pt'),
('D_EXHORTATION', 'Paciência', 'pt'),
('D_EXHORTATION', 'Discernimento', 'pt')
ON CONFLICT DO NOTHING;

-- CONTRIBUIÇÃO - 7 Qualidades (PDF página 10)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('E_GIVING', 'Amor verdadeiro pelos outros', 'pt'),
('E_GIVING', 'Interesse na obra de Deus', 'pt'),
('E_GIVING', 'Discernimento', 'pt'),
('E_GIVING', 'Sabedoria', 'pt'),
('E_GIVING', 'Fé', 'pt'),
('E_GIVING', 'Generosidade', 'pt'),
('E_GIVING', 'Alegria', 'pt')
ON CONFLICT DO NOTHING;

-- LIDERANÇA - 7 Qualidades (PDF página 12)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('F_LEADERSHIP', 'Sabedoria (compreensão das áreas chaves da vida)', 'pt'),
('F_LEADERSHIP', 'Integridade (pureza de coração e honestidade exterior)', 'pt'),
('F_LEADERSHIP', 'Humildade (visão exata e correta de si mesmo e de seu ministério)', 'pt'),
('F_LEADERSHIP', 'Fé', 'pt'),
('F_LEADERSHIP', 'Amor', 'pt'),
('F_LEADERSHIP', 'Paciência', 'pt'),
('F_LEADERSHIP', 'Discernimento', 'pt')
ON CONFLICT DO NOTHING;

-- MISERICÓRDIA - 7 Qualidades (PDF página 13)
INSERT INTO public.qualities (gift_key, quality_name, locale) VALUES
('G_MERCY', 'Interesse e aceitação pelos outros', 'pt'),
('G_MERCY', 'Humildade', 'pt'),
('G_MERCY', 'Sinceridade', 'pt'),
('G_MERCY', 'Paciência', 'pt'),
('G_MERCY', 'Sensibilidade', 'pt'),
('G_MERCY', 'Empatia', 'pt'),
('G_MERCY', 'Alegria', 'pt')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.qualities IS 'Qualidades a desenvolver por dom espiritual - 7 por dom conforme PDFs';
