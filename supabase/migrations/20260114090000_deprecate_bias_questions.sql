-- Deprecate biased/reverse-scored questions and add neutral replacements
-- Keeps old questions for history and stops them from appearing in new quizzes

BEGIN;

WITH problem_questions AS (
  SELECT * FROM (VALUES
    (12, 'Quando prego, dependo do Espírito Santo em vez de confiar apenas em minha eloquência.'),
    (13, 'Equilibro preparação cuidadosa com oração humilde antes de ministrar a Palavra.'),
    (14, 'Vejo cada pessoa como indivíduo com necessidades específicas, não apenas como plateia.'),
    (15, 'Busco falar em público para edificar o corpo de Cristo, não para ser reconhecido.'),
    (16, 'Ao estabelecer padrões bíblicos, busco sensibilidade para fortalecer relacionamentos.'),
    (17, 'Reconheço nuances legítimas enquanto mantenho firmeza em princípios essenciais.'),

    (31, 'Comunico limites claros e assumo apenas o que posso cumprir com excelência.'),
    (32, 'Mantenho serenidade quando surgem imprevistos que afetam meu serviço.'),
    (33, 'Equilibro a execução de tarefas com atenção aos sentimentos das pessoas.'),
    (34, 'Sirvo com motivação genuína, sem expectativa de reconhecimento ou agradecimento.'),
    (35, 'Permito que outros me sirvam também, reconhecendo a importância da reciprocidade.'),
    (36, 'Avalio o timing de Deus antes de suprir uma necessidade rapidamente.'),

    (50, 'Compartilho conhecimento com humildade, valorizando igualmente quem está aprendendo.'),
    (51, 'Tomo decisões oportunas baseando-me nas informações disponíveis e em sabedoria.'),
    (52, 'Adapto meu ensino considerando as necessidades e o contexto dos alunos.'),
    (53, 'Comunico verdades profundas de forma acessível e envolvente.'),
    (54, 'Uno precisão teológica com aplicação prática e calorosa.'),
    (55, 'Ao defender a verdade, mantenho humildade e gentileza no diálogo.'),

    (69, 'Faço perguntas que ajudam a pessoa a pensar e decidir por si mesma.'),
    (70, 'Mantenho paciência com o ritmo de mudança de cada pessoa, celebrando pequenos avanços.'),
    (71, 'Uso textos bíblicos em seu contexto adequado, respeitando a integridade da Escritura.'),
    (72, 'Celebro o progresso do aconselhando dando glória a Deus, não buscando mérito próprio.'),
    (73, 'Equilibro ênfase em ação prática com exploração cuidadosa das raízes do problema.'),
    (74, 'Ao estruturar planos, reconheço explicitamente a dependência do Espírito Santo.'),

    (88, 'Contribuo generosamente sem usar isso para influenciar decisões ministeriais.'),
    (89, 'Mantenho minhas ofertas em privacidade, evitando revelar valores para impressionar.'),
    (90, 'Avalio cuidadosamente se minha ajuda imediata realmente beneficia a pessoa a longo prazo.'),
    (91, 'Dou com alegria, independentemente de reconhecimento ou gratidão.'),
    (92, 'Comunico à família minha motivação espiritual para um estilo de vida simples.'),
    (93, 'Inspiro generosidade pelo exemplo, sem criar pressão ou constrangimento.'),

    (107, 'Delego decisões importantes confiando nas capacidades da equipe.'),
    (108, 'Equilibro o cumprimento de metas com atenção às necessidades pessoais da equipe.'),
    (109, 'Busco persuadir e servir a equipe em vez de impor minhas preferências unilateralmente.'),
    (110, 'Valorizo e agradeço colaboradores de forma consistente e específica.'),
    (111, 'Comunico claramente minha contribuição estratégica quando delego tarefas operacionais.'),
    (112, 'Ajusto o ritmo dos objetivos considerando os limites e capacidades reais da equipe.'),

    (126, 'Equilibro compaixão com sabedoria ao tomar decisões importantes.'),
    (127, 'Confronto com amor quando é necessário, mesmo sabendo que pode causar desconforto inicial.'),
    (128, 'Empatizo com pessoas em dificuldade, mas encorajo mudanças necessárias para a cura.'),
    (129, 'Libero perdão e mantenho abertura relacional mesmo quando outros agem com insensibilidade.'),
    (130, 'Expresso sensibilidade apropriada ao contexto, equilibrando emoção com discernimento.'),
    (131, 'Defendo terceiros de forma sábia, respeitando os limites de responsabilidade de cada um.')
  ) AS t(id, new_text)
),
archived AS (
  INSERT INTO question_history (
    question_id,
    version,
    gift,
    source,
    pclass,
    reverse_scored,
    default_weight,
    text,
    reason_for_change,
    changed_by
  )
  SELECT
    qp.id,
    qp.version,
    qp.gift,
    qp.source,
    qp.pclass,
    qp.reverse_scored,
    qp.default_weight,
    qp.text,
    'Deprecated due to cognitive load/bias; replaced with neutral wording',
    'migration_20260114'
  FROM question_pool qp
  JOIN problem_questions pq ON pq.id = qp.id
  ON CONFLICT (question_id, version) DO NOTHING
  RETURNING question_id
),
deactivated AS (
  UPDATE question_pool qp
  SET is_active = false, updated_at = timezone('utc', now())
  FROM problem_questions pq
  WHERE qp.id = pq.id
  RETURNING qp.id, qp.gift, qp.source, qp.pclass, qp.default_weight
)
INSERT INTO question_pool (
  gift,
  source,
  pclass,
  reverse_scored,
  default_weight,
  text,
  is_active,
  version
)
SELECT
  d.gift,
  d.source,
  d.pclass,
  false,
  d.default_weight,
  pq.new_text,
  true,
  1
FROM deactivated d
JOIN problem_questions pq ON pq.id = d.id;

COMMIT;
