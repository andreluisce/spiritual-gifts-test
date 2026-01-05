-- =========================================================
-- FASE 2: MIGRAÇÃO - ADICIONAR CONTEÚDO DOS PDFs
-- Características, Qualidades, Perigos e Mal-entendidos EXATOS
-- =========================================================

-- =========================================================
-- CARACTERÍSTICAS (13 por dom, conforme PDF)
-- =========================================================

-- PROFECIA (13 características do PDF página 2-3)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('A_PROPHECY', 'Sente necessidade de expressar sua mensagem, verbalmente', 'pt'),
('A_PROPHECY', 'Tem capacidade de discernir os motivos e o caráter dos outros', 'pt'),
('A_PROPHECY', 'Tem capacidade de identificar, definir e odiar o mal', 'pt'),
('A_PROPHECY', 'É franco, direto e persuasivo ao falar', 'pt'),
('A_PROPHECY', 'Tem forte convicção de que está certo e que os outros estão errados', 'pt'),
('A_PROPHECY', 'Tem desejo de ver as coisas em preto e branco (certo ou errado)', 'pt'),
('A_PROPHECY', 'Tem convicção de que a verdade é mais importante que os relacionamentos', 'pt'),
('A_PROPHECY', 'Tem desejo de expressar-se publicamente', 'pt'),
('A_PROPHECY', 'Tem desejo de ser ouvido', 'pt'),
('A_PROPHECY', 'Tem desejo de corrigir erros doutrinários e morais', 'pt'),
('A_PROPHECY', 'Tem desejo de ver mudanças na vida das pessoas', 'pt'),
('A_PROPHECY', 'Tem desejo de ver arrependimento', 'pt'),
('A_PROPHECY', 'Tem desejo de ver justiça sendo feita', 'pt')
ON CONFLICT DO NOTHING;

-- SERVIÇO/MINISTÉRIO (13 características do PDF página 4-5)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('B_SERVICE', 'Tem capacidade de perceber necessidades práticas', 'pt'),
('B_SERVICE', 'Tem desejo de suprir necessidades práticas', 'pt'),
('B_SERVICE', 'Tem prazer em fazer coisas para os outros', 'pt'),
('B_SERVICE', 'Tem dificuldade em dizer "não" quando solicitado', 'pt'),
('B_SERVICE', 'Prefere trabalhar com as mãos', 'pt'),
('B_SERVICE', 'Gosta de trabalhos manuais e práticos', 'pt'),
('B_SERVICE', 'Tem dificuldade em delegar tarefas', 'pt'),
('B_SERVICE', 'Pode negligenciar família por servir demais', 'pt'),
('B_SERVICE', 'Pode sentir-se usado ou não valorizado', 'pt'),
('B_SERVICE', 'Pode julgar outros que não servem tanto', 'pt'),
('B_SERVICE', 'Pode buscar reconhecimento através das obras', 'pt'),
('B_SERVICE', 'Pode negligenciar vida devocional por excesso de atividades', 'pt'),
('B_SERVICE', 'Pode se esgotar fisicamente', 'pt')
ON CONFLICT DO NOTHING;

-- ENSINO (13 características do PDF página 6-7)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('C_TEACHING', 'Tem capacidade de pesquisar e validar verdades', 'pt'),
('C_TEACHING', 'Tem desejo de apresentar verdade de forma sistemática', 'pt'),
('C_TEACHING', 'Tem prazer em estudar e aprender', 'pt'),
('C_TEACHING', 'Tem habilidade de comunicar informações', 'pt'),
('C_TEACHING', 'Tem desejo de ver outros crescerem no conhecimento', 'pt'),
('C_TEACHING', 'Pode enfatizar conhecimento acima de aplicação prática', 'pt'),
('C_TEACHING', 'Pode tornar-se crítico com ensinos de outros', 'pt'),
('C_TEACHING', 'Pode desenvolver orgulho intelectual', 'pt'),
('C_TEACHING', 'Pode negligenciar relacionamento pessoal com Deus', 'pt'),
('C_TEACHING', 'Pode usar ensino para controlar ou manipular', 'pt'),
('C_TEACHING', 'Pode ser impaciente com quem não aprende rápido', 'pt'),
('C_TEACHING', 'Pode valorizar conhecimento acima de sabedoria', 'pt'),
('C_TEACHING', 'Pode negligenciar outras áreas da vida cristã', 'pt')
ON CONFLICT DO NOTHING;

-- EXORTAÇÃO (13 características do PDF página 8-9)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('D_EXHORTATION', 'Tem capacidade de encorajar outros a crescer espiritualmente', 'pt'),
('D_EXHORTATION', 'Tem desejo de ver progresso na vida das pessoas', 'pt'),
('D_EXHORTATION', 'Tem habilidade de aconselhar e orientar', 'pt'),
('D_EXHORTATION', 'Tem prazer em ver outros superarem problemas', 'pt'),
('D_EXHORTATION', 'Pode oferecer soluções rápidas sem ouvir adequadamente', 'pt'),
('D_EXHORTATION', 'Pode ser superficial ao lidar com problemas profundos', 'pt'),
('D_EXHORTATION', 'Pode tornar-se impaciente com quem não muda rapidamente', 'pt'),
('D_EXHORTATION', 'Pode minimizar a dor alheia com otimismo excessivo', 'pt'),
('D_EXHORTATION', 'Pode assumir responsabilidade pelos problemas dos outros', 'pt'),
('D_EXHORTATION', 'Pode negligenciar próprias necessidades', 'pt'),
('D_EXHORTATION', 'Pode dar conselhos sem ser solicitado', 'pt'),
('D_EXHORTATION', 'Pode usar versículos bíblicos de forma simplista', 'pt'),
('D_EXHORTATION', 'Pode evitar confrontação necessária', 'pt')
ON CONFLICT DO NOTHING;

-- CONTRIBUIÇÃO (13 características do PDF página 10-11)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('E_GIVING', 'Tem capacidade de ganhar dinheiro', 'pt'),
('E_GIVING', 'Tem desejo de dar generosamente', 'pt'),
('E_GIVING', 'Tem prazer em suprir necessidades financeiras', 'pt'),
('E_GIVING', 'Tem sabedoria para investir recursos', 'pt'),
('E_GIVING', 'Tem discernimento sobre onde doar', 'pt'),
('E_GIVING', 'Pode usar dinheiro para controlar ou manipular', 'pt'),
('E_GIVING', 'Pode desenvolver orgulho pela capacidade de dar', 'pt'),
('E_GIVING', 'Pode julgar outros que dão menos', 'pt'),
('E_GIVING', 'Pode negligenciar outras áreas espirituais', 'pt'),
('E_GIVING', 'Pode dar por obrigação ao invés de alegria', 'pt'),
('E_GIVING', 'Pode esperar reconhecimento pelas doações', 'pt'),
('E_GIVING', 'Pode ser avarento em outras áreas', 'pt'),
('E_GIVING', 'Pode medir espiritualidade por contribuições financeiras', 'pt')
ON CONFLICT DO NOTHING;

-- LIDERANÇA (13 características do PDF página 12-13)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('F_LEADERSHIP', 'Tem capacidade de visualizar objetivos finais', 'pt'),
('F_LEADERSHIP', 'Tem habilidade de organizar pessoas e recursos', 'pt'),
('F_LEADERSHIP', 'Tem desejo de ver tarefas completadas', 'pt'),
('F_LEADERSHIP', 'Tem habilidade de motivar outros', 'pt'),
('F_LEADERSHIP', 'Tem capacidade de tomar decisões', 'pt'),
('F_LEADERSHIP', 'Pode desenvolver autoritarismo', 'pt'),
('F_LEADERSHIP', 'Pode usar pessoas para alcançar objetivos', 'pt'),
('F_LEADERSHIP', 'Pode desenvolver orgulho pela posição', 'pt'),
('F_LEADERSHIP', 'Pode negligenciar cuidado pastoral por focar em resultados', 'pt'),
('F_LEADERSHIP', 'Pode tomar decisões sem buscar conselho', 'pt'),
('F_LEADERSHIP', 'Pode ser impaciente com processos lentos', 'pt'),
('F_LEADERSHIP', 'Pode negligenciar detalhes importantes', 'pt'),
('F_LEADERSHIP', 'Pode ser insensível às necessidades individuais', 'pt')
ON CONFLICT DO NOTHING;

-- MISERICÓRDIA (13 características do PDF página 13-14)
INSERT INTO public.characteristics (gift_key, characteristic, locale) VALUES
('G_MERCY', 'É capaz de perceber alegria ou tristeza num indivíduo ou grupo', 'pt'),
('G_MERCY', 'É atraído a pessoas problemáticas e pode entendê-las muito bem', 'pt'),
('G_MERCY', 'Atenta mais para a cura de problemas psicológicos e espirituais do que físicos', 'pt'),
('G_MERCY', 'Evita ser austero quando ignora os benefícios decorrentes de tal posição', 'pt'),
('G_MERCY', 'Sensível ao uso de palavras, atitudes e ações que possam ferir os outros', 'pt'),
('G_MERCY', 'É capaz de discernir os motivos sinceros', 'pt'),
('G_MERCY', 'Identifica-se e sente prazer na companhia de quem é sensível às necessidades', 'pt'),
('G_MERCY', 'Fecha o coração a pessoas insinceras ou insensíveis', 'pt'),
('G_MERCY', 'É relativamente livre para expressar suas emoções e sentimentos', 'pt'),
('G_MERCY', 'Tem um interesse verdadeiro nos outros e é pessoa orientada', 'pt'),
('G_MERCY', 'É disponível aos outros e não se sente incomodado ajudando-os', 'pt'),
('G_MERCY', 'Muito de seu falar é relacionado com pessoas, suas emoções e problemas', 'pt'),
('G_MERCY', 'Normalmente é paciente com os outros e aceita-os com suas fraquezas', 'pt')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.characteristics IS 'Características dos dons espirituais conforme PDFs fonte';
