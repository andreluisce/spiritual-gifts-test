-- =========================================================
-- POPULATE DANGERS AND MISUNDERSTANDINGS
-- Gift-specific warnings and common misconceptions
-- =========================================================

-- PROPHECY - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('A_PROPHECY', 'Tornar-se crítico e julgador em excesso', 'pt'),
('A_PROPHECY', 'Falta de compaixão ao confrontar o pecado', 'pt'),
('A_PROPHECY', 'Orgulho espiritual por ter discernimento', 'pt'),
('A_PROPHECY', 'Usar a verdade como arma ao invés de ferramenta de restauração', 'pt'),
('A_PROPHECY', 'Isolar-se por não tolerar imperfeições nos outros', 'pt')
ON CONFLICT DO NOTHING;

-- PROPHECY - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('A_PROPHECY', 'Confundir profecia com predição do futuro', 'pt'),
('A_PROPHECY', 'Achar que toda correção é profecia', 'pt'),
('A_PROPHECY', 'Pensar que profetas devem ser sempre duros e confrontadores', 'pt'),
('A_PROPHECY', 'Acreditar que discernimento dispensa sabedoria e amor', 'pt')
ON CONFLICT DO NOTHING;

-- SERVICE - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('B_SERVICE', 'Esgotamento por não saber dizer "não"', 'pt'),
('B_SERVICE', 'Negligenciar vida devocional por excesso de atividades', 'pt'),
('B_SERVICE', 'Sentir-se usado ou não valorizado', 'pt'),
('B_SERVICE', 'Julgar outros que não servem tanto quanto você', 'pt'),
('B_SERVICE', 'Buscar reconhecimento através das obras', 'pt')
ON CONFLICT DO NOTHING;

-- SERVICE - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('B_SERVICE', 'Achar que servir é apenas fazer tarefas práticas', 'pt'),
('B_SERVICE', 'Pensar que quem serve não pode liderar', 'pt'),
('B_SERVICE', 'Confundir serviço com servidão', 'pt'),
('B_SERVICE', 'Acreditar que servir dispensa planejamento', 'pt')
ON CONFLICT DO NOTHING;

-- TEACHING - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('C_TEACHING', 'Orgulho intelectual e arrogância', 'pt'),
('C_TEACHING', 'Enfatizar conhecimento acima de aplicação prática', 'pt'),
('C_TEACHING', 'Tornar-se crítico com ensinos de outros', 'pt'),
('C_TEACHING', 'Negligenciar o relacionamento pessoal com Deus', 'pt'),
('C_TEACHING', 'Usar o ensino para controlar ou manipular', 'pt')
ON CONFLICT DO NOTHING;

-- TEACHING - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('C_TEACHING', 'Confundir ensino com pregação', 'pt'),
('C_TEACHING', 'Achar que mestres devem saber tudo', 'pt'),
('C_TEACHING', 'Pensar que ensino é apenas transmissão de informação', 'pt'),
('C_TEACHING', 'Acreditar que ensino dispensa o Espírito Santo', 'pt')
ON CONFLICT DO NOTHING;

-- EXHORTATION - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('D_EXHORTATION', 'Superficialidade ao lidar com problemas profundos', 'pt'),
('D_EXHORTATION', 'Oferecer soluções rápidas sem ouvir adequadamente', 'pt'),
('D_EXHORTATION', 'Tornar-se impaciente com quem não muda rapidamente', 'pt'),
('D_EXHORTATION', 'Minimizar a dor alheia com otimismo excessivo', 'pt'),
('D_EXHORTATION', 'Assumir responsabilidade pelos problemas dos outros', 'pt')
ON CONFLICT DO NOTHING;

-- EXHORTATION - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('D_EXHORTATION', 'Confundir exortação com motivação emocional', 'pt'),
('D_EXHORTATION', 'Achar que exortar é sempre encorajar', 'pt'),
('D_EXHORTATION', 'Pensar que exortadores não podem confrontar', 'pt'),
('D_EXHORTATION', 'Acreditar que exortação dispensa verdade bíblica', 'pt')
ON CONFLICT DO NOTHING;

-- GIVING - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('E_GIVING', 'Usar dinheiro para controlar ou manipular', 'pt'),
('E_GIVING', 'Orgulho pela capacidade de dar', 'pt'),
('E_GIVING', 'Julgar outros que dão menos', 'pt'),
('E_GIVING', 'Negligenciar outras áreas espirituais', 'pt'),
('E_GIVING', 'Dar por obrigação ao invés de alegria', 'pt')
ON CONFLICT DO NOTHING;

-- GIVING - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('E_GIVING', 'Confundir dom de contribuir com riqueza material', 'pt'),
('E_GIVING', 'Achar que doar é apenas dar dinheiro', 'pt'),
('E_GIVING', 'Pensar que quem dá deve ser sempre rico', 'pt'),
('E_GIVING', 'Acreditar que generosidade garante prosperidade', 'pt')
ON CONFLICT DO NOTHING;

-- LEADERSHIP - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('F_LEADERSHIP', 'Autoritarismo e falta de prestação de contas', 'pt'),
('F_LEADERSHIP', 'Usar pessoas para alcançar objetivos', 'pt'),
('F_LEADERSHIP', 'Orgulho pela posição de liderança', 'pt'),
('F_LEADERSHIP', 'Negligenciar o cuidado pastoral por focar em resultados', 'pt'),
('F_LEADERSHIP', 'Tomar decisões sem buscar conselho', 'pt')
ON CONFLICT DO NOTHING;

-- LEADERSHIP - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('F_LEADERSHIP', 'Confundir liderança com autoridade posicional', 'pt'),
('F_LEADERSHIP', 'Achar que líderes não podem ser servos', 'pt'),
('F_LEADERSHIP', 'Pensar que liderar é mandar', 'pt'),
('F_LEADERSHIP', 'Acreditar que líderes devem ter todas as respostas', 'pt')
ON CONFLICT DO NOTHING;

-- MERCY - Dangers
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
('G_MERCY', 'Ser manipulado por pessoas que abusam da bondade', 'pt'),
('G_MERCY', 'Evitar confrontação necessária por medo de magoar', 'pt'),
('G_MERCY', 'Esgotamento emocional por absorver dor alheia', 'pt'),
('G_MERCY', 'Negligenciar justiça em favor da compaixão', 'pt'),
('G_MERCY', 'Tomar para si responsabilidades que são dos outros', 'pt')
ON CONFLICT DO NOTHING;

-- MERCY - Misunderstandings
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
('G_MERCY', 'Confundir misericórdia com permissividade', 'pt'),
('G_MERCY', 'Achar que pessoas misericordiosas são fracas', 'pt'),
('G_MERCY', 'Pensar que misericórdia dispensa verdade', 'pt'),
('G_MERCY', 'Acreditar que compaixão significa concordar com tudo', 'pt')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.dangers IS 'Gift-specific dangers and pitfalls to avoid';
COMMENT ON TABLE public.misunderstandings IS 'Common misconceptions about each spiritual gift';
