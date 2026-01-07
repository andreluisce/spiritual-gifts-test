-- Popular question_history com versoes antigas (v1) das 42 perguntas reformuladas

BEGIN;

INSERT INTO question_history (question_id, version, gift, source, pclass, reverse_scored, default_weight, text, reason_for_change, changed_by) VALUES

-- A_PROPHECY (IDs 12-17)
(12, 1, 'A_PROPHECY', 'DANGER', 'P1', true, 1.000, 'Tendo oportunidade de pregar, priorizo parecer brilhante em vez de depender do Espirito.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(13, 1, 'A_PROPHECY', 'DANGER', 'P2', true, 1.000, 'Confio tanto na minha logica e retorica que descuido da oracao e preparacao humilde.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(14, 1, 'A_PROPHECY', 'DANGER', 'P2', true, 1.000, 'Enxergo pessoas mais como plateia do que como individuos com necessidades reais.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(15, 1, 'A_PROPHECY', 'DANGER', 'P1', true, 1.000, 'Busco falar em publico para ser reconhecido, nao para edificar.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(16, 1, 'A_PROPHECY', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Costumo impor padroes sem sensibilidade, criando distancia nos relacionamentos.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(17, 1, 'A_PROPHECY', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Ajo de modo tao binario que pareco intolerante a nuances legitimas.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),

-- B_SERVICE (IDs 31-36)
(31, 1, 'B_SERVICE', 'DANGER', 'P1', true, 1.000, 'Assumo mais tarefas do que consigo cumprir, por dificuldade de dizer nao.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(32, 1, 'B_SERVICE', 'DANGER', 'P2', true, 1.000, 'Fico irritado quando meu servico e atrapalhado por complicacoes desnecessarias.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(33, 1, 'B_SERVICE', 'DANGER', 'P2', true, 1.000, 'Valorizo tanto o fazer que ignoro as pessoas e seus sentimentos.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(34, 1, 'B_SERVICE', 'DANGER', 'P1', true, 1.000, 'Sirvo esperando reconhecimento e fico magoado quando nao recebo agradecimento.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(35, 1, 'B_SERVICE', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Insisto tanto em ajudar que pareco nao aberto a tambem ser ajudado.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(36, 1, 'B_SERVICE', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Ao suprir rapido, posso impedir licoes que Deus quer ensinar a pessoa.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),

-- C_TEACHING (IDs 50-55)
(50, 1, 'C_TEACHING', 'DANGER', 'P1', true, 1.000, 'Sinto-me superior por meu conhecimento e desmereco quem sabe menos.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(51, 1, 'C_TEACHING', 'DANGER', 'P2', true, 1.000, 'Acumulo informacao e adio decisoes por esperar ter todos os dados.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(52, 1, 'C_TEACHING', 'DANGER', 'P2', true, 1.000, 'Concentro-me tanto em conteudo que esqueco necessidades dos alunos.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(53, 1, 'C_TEACHING', 'DANGER', 'P3', true, 1.000, 'Uso detalhes tecnicos desnecessarios que tornam a aula arida.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(54, 1, 'C_TEACHING', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Minha busca por precisao parece frieza ou pouca aplicacao pratica.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(55, 1, 'C_TEACHING', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Ao provar posicoes, pareco orgulhoso ou combativo demais.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),

-- D_EXHORTATION (IDs 69-74)
(69, 1, 'D_EXHORTATION', 'DANGER', 'P2', true, 1.000, 'Dou tantos conselhos que a pessoa nao pensa nem decide por si.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(70, 1, 'D_EXHORTATION', 'DANGER', 'P1', true, 1.000, 'Fico impaciente quando a pessoa muda devagar ou recai.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(71, 1, 'D_EXHORTATION', 'DANGER', 'P2', true, 1.000, 'Uso textos fora do contexto apenas para reforcar uma aplicacao pratica.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(72, 1, 'D_EXHORTATION', 'DANGER', 'P3', true, 1.000, 'Busco os meritos do progresso do aconselhando para mim.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(73, 1, 'D_EXHORTATION', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Minha enfase em acao faz parecer que nao aprofundo as raizes do problema.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(74, 1, 'D_EXHORTATION', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Ao estruturar planos, pareco confiar mais no metodo que no Espirito.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),

-- E_GIVING (IDs 88-93)
(88, 1, 'E_GIVING', 'DANGER', 'P1', true, 1.000, 'Uso a contribuicao para controlar decisoes de um ministerio.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(89, 1, 'E_GIVING', 'DANGER', 'P2', true, 1.000, 'Revelo valores ofertados para impressionar pessoas.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(90, 1, 'E_GIVING', 'DANGER', 'P2', true, 1.000, 'Atendo toda solicitacao imediata sem avaliar se e o melhor para o outro.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(91, 1, 'E_GIVING', 'DANGER', 'P3', true, 1.000, 'Sinto-me martir quando minha generosidade nao e reconhecida.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(92, 1, 'E_GIVING', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Minha frugalidade soa como avareza para familiares e amigos.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(93, 1, 'E_GIVING', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Ao tentar inspirar outros a dar, pareco exercer pressao indevida.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),

-- F_LEADERSHIP (IDs 107-112)
(107, 1, 'F_LEADERSHIP', 'DANGER', 'P1', true, 1.000, 'Centralizo decisoes por nao confiar suficientemente na equipe.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(108, 1, 'F_LEADERSHIP', 'DANGER', 'P2', true, 1.000, 'Trato pessoas como recursos e nao como irmaos com necessidades.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(109, 1, 'F_LEADERSHIP', 'DANGER', 'P2', true, 1.000, 'Imponho meu jeito em vez de servir e persuadir com humildade.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(110, 1, 'F_LEADERSHIP', 'DANGER', 'P3', true, 1.000, 'Deixo de valorizar e agradecer colaboradores de forma consistente.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(111, 1, 'F_LEADERSHIP', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Ao delegar muito, pareco ocioso para quem nao ve o trabalho invisivel.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(112, 1, 'F_LEADERSHIP', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Ao insistir no objetivo, pareco insensivel ao ritmo e limites das pessoas.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),

-- G_MERCY (IDs 126-131)
(126, 1, 'G_MERCY', 'DANGER', 'P1', true, 1.000, 'Tomo decisoes principalmente pelas emocoes, ignorando a sabedoria.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(127, 1, 'G_MERCY', 'DANGER', 'P2', true, 1.000, 'Evito confrontar quando e claramente necessario, com medo de ferir.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(128, 1, 'G_MERCY', 'DANGER', 'P2', true, 1.000, 'Empatizo com quem nao quer mudar e acabo reforcando vitimismo.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(129, 1, 'G_MERCY', 'DANGER', 'P3', true, 1.000, 'Carrego amarguras antigas e me retraio pela insensibilidade alheia.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(130, 1, 'G_MERCY', 'MISUNDERSTANDING', 'P3', true, 1.000, 'Minha sensibilidade parece drama ou falta de bom senso para alguns.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07'),
(131, 1, 'G_MERCY', 'MISUNDERSTANDING', 'P2', true, 1.000, 'Minha protecao de terceiros e interpretada como intromissao indevida.', 'Eliminacao de reverse scoring e reducao de vies de desejabilidade social', 'reformulation_2026-01-07');

COMMIT;
