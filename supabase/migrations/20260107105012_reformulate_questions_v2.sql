-- Reformulacao de perguntas DANGER e MISUNDERSTANDING
-- Eliminar reverse scoring e vies de desejabilidade social

BEGIN;

-- A_PROPHECY
UPDATE question_pool SET text = 'Quando prego, dependo do Espírito Santo em vez de confiar apenas em minha eloquência.', reverse_scored = false WHERE id = 12;
UPDATE question_pool SET text = 'Equilibro preparação cuidadosa com oração humilde antes de ministrar a Palavra.', reverse_scored = false WHERE id = 13;
UPDATE question_pool SET text = 'Vejo cada pessoa como indivíduo com necessidades específicas, não apenas como plateia.', reverse_scored = false WHERE id = 14;
UPDATE question_pool SET text = 'Busco falar em público para edificar o corpo de Cristo, não para ser reconhecido.', reverse_scored = false WHERE id = 15;
UPDATE question_pool SET text = 'Ao estabelecer padrões bíblicos, busco sensibilidade para fortalecer relacionamentos.', reverse_scored = false WHERE id = 16;
UPDATE question_pool SET text = 'Reconheço nuances legítimas enquanto mantenho firmeza em princípios essenciais.', reverse_scored = false WHERE id = 17;

-- B_SERVICE
UPDATE question_pool SET text = 'Comunico limites claros e assumo apenas o que posso cumprir com excelência.', reverse_scored = false WHERE id = 31;
UPDATE question_pool SET text = 'Mantenho serenidade quando surgem imprevistos que afetam meu serviço.', reverse_scored = false WHERE id = 32;
UPDATE question_pool SET text = 'Equilibro a execução de tarefas com atenção aos sentimentos das pessoas.', reverse_scored = false WHERE id = 33;
UPDATE question_pool SET text = 'Sirvo com motivação genuína, sem expectativa de reconhecimento ou agradecimento.', reverse_scored = false WHERE id = 34;
UPDATE question_pool SET text = 'Permito que outros me sirvam também, reconhecendo a importância da reciprocidade.', reverse_scored = false WHERE id = 35;
UPDATE question_pool SET text = 'Avalio o timing de Deus antes de suprir uma necessidade rapidamente.', reverse_scored = false WHERE id = 36;

-- C_TEACHING
UPDATE question_pool SET text = 'Compartilho conhecimento com humildade, valorizando igualmente quem está aprendendo.', reverse_scored = false WHERE id = 50;
UPDATE question_pool SET text = 'Tomo decisões oportunas baseando-me nas informações disponíveis e em sabedoria.', reverse_scored = false WHERE id = 51;
UPDATE question_pool SET text = 'Adapto meu ensino considerando as necessidades e o contexto dos alunos.', reverse_scored = false WHERE id = 52;
UPDATE question_pool SET text = 'Comunico verdades profundas de forma acessível e envolvente.', reverse_scored = false WHERE id = 53;
UPDATE question_pool SET text = 'Uno precisão teológica com aplicação prática e calorosa.', reverse_scored = false WHERE id = 54;
UPDATE question_pool SET text = 'Ao defender a verdade, mantenho humildade e gentileza no diálogo.', reverse_scored = false WHERE id = 55;

-- D_EXHORTATION
UPDATE question_pool SET text = 'Faço perguntas que ajudam a pessoa a pensar e decidir por si mesma.', reverse_scored = false WHERE id = 69;
UPDATE question_pool SET text = 'Mantenho paciência com o ritmo de mudança de cada pessoa, celebrando pequenos avanços.', reverse_scored = false WHERE id = 70;
UPDATE question_pool SET text = 'Uso textos bíblicos em seu contexto adequado, respeitando a integridade da Escritura.', reverse_scored = false WHERE id = 71;
UPDATE question_pool SET text = 'Celebro o progresso do aconselhando dando glória a Deus, não buscando mérito próprio.', reverse_scored = false WHERE id = 72;
UPDATE question_pool SET text = 'Equilibro ênfase em ação prática com exploração cuidadosa das raízes do problema.', reverse_scored = false WHERE id = 73;
UPDATE question_pool SET text = 'Ao estruturar planos, reconheço explicitamente a dependência do Espírito Santo.', reverse_scored = false WHERE id = 74;

-- E_GIVING
UPDATE question_pool SET text = 'Contribuo generosamente sem usar isso para influenciar decisões ministeriais.', reverse_scored = false WHERE id = 88;
UPDATE question_pool SET text = 'Mantenho minhas ofertas em privacidade, evitando revelar valores para impressionar.', reverse_scored = false WHERE id = 89;
UPDATE question_pool SET text = 'Avalio cuidadosamente se minha ajuda imediata realmente beneficia a pessoa a longo prazo.', reverse_scored = false WHERE id = 90;
UPDATE question_pool SET text = 'Dou com alegria, independentemente de reconhecimento ou gratidão.', reverse_scored = false WHERE id = 91;
UPDATE question_pool SET text = 'Comunico à família minha motivação espiritual para um estilo de vida simples.', reverse_scored = false WHERE id = 92;
UPDATE question_pool SET text = 'Inspiro generosidade pelo exemplo, sem criar pressão ou constrangimento.', reverse_scored = false WHERE id = 93;

-- F_LEADERSHIP
UPDATE question_pool SET text = 'Delego decisões importantes confiando nas capacidades da equipe.', reverse_scored = false WHERE id = 107;
UPDATE question_pool SET text = 'Equilibro o cumprimento de metas com atenção às necessidades pessoais da equipe.', reverse_scored = false WHERE id = 108;
UPDATE question_pool SET text = 'Busco persuadir e servir a equipe em vez de impor minhas preferências unilateralmente.', reverse_scored = false WHERE id = 109;
UPDATE question_pool SET text = 'Valorizo e agradeço colaboradores de forma consistente e específica.', reverse_scored = false WHERE id = 110;
UPDATE question_pool SET text = 'Comunico claramente minha contribuição estratégica quando delego tarefas operacionais.', reverse_scored = false WHERE id = 111;
UPDATE question_pool SET text = 'Ajusto o ritmo dos objetivos considerando os limites e capacidades reais da equipe.', reverse_scored = false WHERE id = 112;

-- G_MERCY
UPDATE question_pool SET text = 'Equilibro compaixão com sabedoria ao tomar decisões importantes.', reverse_scored = false WHERE id = 126;
UPDATE question_pool SET text = 'Confronto com amor quando é necessário, mesmo sabendo que pode causar desconforto inicial.', reverse_scored = false WHERE id = 127;
UPDATE question_pool SET text = 'Empatizo com pessoas em dificuldade, mas encorajo mudanças necessárias para a cura.', reverse_scored = false WHERE id = 128;
UPDATE question_pool SET text = 'Libero perdão e mantenho abertura relacional mesmo quando outros agem com insensibilidade.', reverse_scored = false WHERE id = 129;
UPDATE question_pool SET text = 'Expresso sensibilidade apropriada ao contexto, equilibrando emoção com discernimento.', reverse_scored = false WHERE id = 130;
UPDATE question_pool SET text = 'Defendo terceiros de forma sábia, respeitando os limites de responsabilidade de cada um.', reverse_scored = false WHERE id = 131;

COMMIT;
