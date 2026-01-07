-- ============================================================================
-- REFORMULAÇÃO COMPLETA DE PERGUNTAS DANGER E MISUNDERSTANDING
-- Data: 07/01/2026
-- Objetivo: Eliminar reverse scoring e viés de desejabilidade social
-- Total: 42 perguntas (7 dons × 6 perguntas cada)
-- ============================================================================

BEGIN;

-- ============================================================================
-- A_PROPHECY (Profecia) - 6 perguntas
-- ============================================================================

-- ID 12: DANGER P1
UPDATE question_pool
SET
  text = 'Quando prego, dependo do Espírito Santo em vez de confiar apenas em minha eloquência.',
  reverse_scored = false
WHERE id = 12;

-- ID 13: DANGER P2
UPDATE question_pool
SET
  text = 'Equilibro preparação cuidadosa com oração humilde antes de ministrar a Palavra.',
  reverse_scored = false
WHERE id = 13;

-- ID 14: DANGER P2
UPDATE question_pool
SET
  text = 'Vejo cada pessoa como indivíduo com necessidades específicas, não apenas como plateia.',
  reverse_scored = false
WHERE id = 14;

-- ID 15: DANGER P1
UPDATE question_pool
SET
  text = 'Busco falar em público para edificar o corpo de Cristo, não para ser reconhecido.',
  reverse_scored = false
WHERE id = 15;

-- ID 16: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Ao estabelecer padrões bíblicos, busco sensibilidade para fortalecer relacionamentos.',
  reverse_scored = false
WHERE id = 16;

-- ID 17: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Reconheço nuances legítimas enquanto mantenho firmeza em princípios essenciais.',
  reverse_scored = false
WHERE id = 17;

-- ============================================================================
-- B_SERVICE (Ministério/Serviço) - 6 perguntas
-- ============================================================================

-- ID 31: DANGER P1
UPDATE question_pool
SET
  text = 'Comunico limites claros e assumo apenas o que posso cumprir com excelência.',
  reverse_scored = false
WHERE id = 31;

-- ID 32: DANGER P2
UPDATE question_pool
SET
  text = 'Mantenho serenidade quando surgem imprevistos que afetam meu serviço.',
  reverse_scored = false
WHERE id = 32;

-- ID 33: DANGER P2
UPDATE question_pool
SET
  text = 'Equilibro a execução de tarefas com atenção aos sentimentos das pessoas.',
  reverse_scored = false
WHERE id = 33;

-- ID 34: DANGER P1
UPDATE question_pool
SET
  text = 'Sirvo com motivação genuína, sem expectativa de reconhecimento ou agradecimento.',
  reverse_scored = false
WHERE id = 34;

-- ID 35: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Permito que outros me sirvam também, reconhecendo a importância da reciprocidade.',
  reverse_scored = false
WHERE id = 35;

-- ID 36: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Avalio o timing de Deus antes de suprir uma necessidade rapidamente.',
  reverse_scored = false
WHERE id = 36;

-- ============================================================================
-- C_TEACHING (Ensino) - 6 perguntas
-- ============================================================================

-- ID 50: DANGER P1
UPDATE question_pool
SET
  text = 'Compartilho conhecimento com humildade, valorizando igualmente quem está aprendendo.',
  reverse_scored = false
WHERE id = 50;

-- ID 51: DANGER P2
UPDATE question_pool
SET
  text = 'Tomo decisões oportunas baseando-me nas informações disponíveis e em sabedoria.',
  reverse_scored = false
WHERE id = 51;

-- ID 52: DANGER P2
UPDATE question_pool
SET
  text = 'Adapto meu ensino considerando as necessidades e o contexto dos alunos.',
  reverse_scored = false
WHERE id = 52;

-- ID 53: DANGER P3
UPDATE question_pool
SET
  text = 'Comunico verdades profundas de forma acessível e envolvente.',
  reverse_scored = false
WHERE id = 53;

-- ID 54: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Uno precisão teológica com aplicação prática e calorosa.',
  reverse_scored = false
WHERE id = 54;

-- ID 55: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Ao defender a verdade, mantenho humildade e gentileza no diálogo.',
  reverse_scored = false
WHERE id = 55;

-- ============================================================================
-- D_EXHORTATION (Exortação/Aconselhamento) - 6 perguntas
-- ============================================================================

-- ID 69: DANGER P2
UPDATE question_pool
SET
  text = 'Faço perguntas que ajudam a pessoa a pensar e decidir por si mesma.',
  reverse_scored = false
WHERE id = 69;

-- ID 70: DANGER P1
UPDATE question_pool
SET
  text = 'Mantenho paciência com o ritmo de mudança de cada pessoa, celebrando pequenos avanços.',
  reverse_scored = false
WHERE id = 70;

-- ID 71: DANGER P2
UPDATE question_pool
SET
  text = 'Uso textos bíblicos em seu contexto adequado, respeitando a integridade da Escritura.',
  reverse_scored = false
WHERE id = 71;

-- ID 72: DANGER P3
UPDATE question_pool
SET
  text = 'Celebro o progresso do aconselhando dando glória a Deus, não buscando mérito próprio.',
  reverse_scored = false
WHERE id = 72;

-- ID 73: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Equilibro ênfase em ação prática com exploração cuidadosa das raízes do problema.',
  reverse_scored = false
WHERE id = 73;

-- ID 74: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Ao estruturar planos, reconheço explicitamente a dependência do Espírito Santo.',
  reverse_scored = false
WHERE id = 74;

-- ============================================================================
-- E_GIVING (Contribuição/Generosidade) - 6 perguntas
-- ============================================================================

-- ID 88: DANGER P1
UPDATE question_pool
SET
  text = 'Contribuo generosamente sem usar isso para influenciar decisões ministeriais.',
  reverse_scored = false
WHERE id = 88;

-- ID 89: DANGER P2
UPDATE question_pool
SET
  text = 'Mantenho minhas ofertas em privacidade, evitando revelar valores para impressionar.',
  reverse_scored = false
WHERE id = 89;

-- ID 90: DANGER P2
UPDATE question_pool
SET
  text = 'Avalio cuidadosamente se minha ajuda imediata realmente beneficia a pessoa a longo prazo.',
  reverse_scored = false
WHERE id = 90;

-- ID 91: DANGER P3
UPDATE question_pool
SET
  text = 'Dou com alegria, independentemente de reconhecimento ou gratidão.',
  reverse_scored = false
WHERE id = 91;

-- ID 92: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Comunico à família minha motivação espiritual para um estilo de vida simples.',
  reverse_scored = false
WHERE id = 92;

-- ID 93: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Inspiro generosidade pelo exemplo, sem criar pressão ou constrangimento.',
  reverse_scored = false
WHERE id = 93;

-- ============================================================================
-- F_LEADERSHIP (Liderança) - 6 perguntas
-- ============================================================================

-- ID 107: DANGER P1
UPDATE question_pool
SET
  text = 'Delego decisões importantes confiando nas capacidades da equipe.',
  reverse_scored = false
WHERE id = 107;

-- ID 108: DANGER P2
UPDATE question_pool
SET
  text = 'Equilibro o cumprimento de metas com atenção às necessidades pessoais da equipe.',
  reverse_scored = false
WHERE id = 108;

-- ID 109: DANGER P2
UPDATE question_pool
SET
  text = 'Busco persuadir e servir a equipe em vez de impor minhas preferências unilateralmente.',
  reverse_scored = false
WHERE id = 109;

-- ID 110: DANGER P3
UPDATE question_pool
SET
  text = 'Valorizo e agradeço colaboradores de forma consistente e específica.',
  reverse_scored = false
WHERE id = 110;

-- ID 111: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Comunico claramente minha contribuição estratégica quando delego tarefas operacionais.',
  reverse_scored = false
WHERE id = 111;

-- ID 112: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Ajusto o ritmo dos objetivos considerando os limites e capacidades reais da equipe.',
  reverse_scored = false
WHERE id = 112;

-- ============================================================================
-- G_MERCY (Misericórdia) - 6 perguntas
-- ============================================================================

-- ID 126: DANGER P1
UPDATE question_pool
SET
  text = 'Equilibro compaixão com sabedoria ao tomar decisões importantes.',
  reverse_scored = false
WHERE id = 126;

-- ID 127: DANGER P2
UPDATE question_pool
SET
  text = 'Confronto com amor quando é necessário, mesmo sabendo que pode causar desconforto inicial.',
  reverse_scored = false
WHERE id = 127;

-- ID 128: DANGER P2
UPDATE question_pool
SET
  text = 'Empatizo com pessoas em dificuldade, mas encorajo mudanças necessárias para a cura.',
  reverse_scored = false
WHERE id = 128;

-- ID 129: DANGER P3
UPDATE question_pool
SET
  text = 'Libero perdão e mantenho abertura relacional mesmo quando outros agem com insensibilidade.',
  reverse_scored = false
WHERE id = 129;

-- ID 130: MISUNDERSTANDING P3
UPDATE question_pool
SET
  text = 'Expresso sensibilidade apropriada ao contexto, equilibrando emoção com discernimento.',
  reverse_scored = false
WHERE id = 130;

-- ID 131: MISUNDERSTANDING P2
UPDATE question_pool
SET
  text = 'Defendo terceiros de forma sábia, respeitando os limites de responsabilidade de cada um.',
  reverse_scored = false
WHERE id = 131;

-- ============================================================================
-- Verificação
-- ============================================================================

-- Verifica quantas perguntas ainda têm reverse scoring (deve ser 0 nas DANGER/MISUNDERSTANDING)
SELECT
  source,
  COUNT(*) as total,
  SUM(CASE WHEN reverse_scored THEN 1 ELSE 0 END) as reverse_count
FROM question_pool
WHERE source IN ('DANGER', 'MISUNDERSTANDING')
GROUP BY source;

-- Lista todas as perguntas reformuladas para conferência
SELECT
  id,
  gift,
  source,
  pclass,
  reverse_scored,
  LEFT(text, 80) || '...' as text_preview
FROM question_pool
WHERE id IN (12,13,14,15,16,17,31,32,33,34,35,36,50,51,52,53,54,55,69,70,71,72,73,74,88,89,90,91,92,93,107,108,109,110,111,112,126,127,128,129,130,131)
ORDER BY gift, source, id;

COMMIT;

-- ============================================================================
-- FIM DA REFORMULAÇÃO
-- Total de perguntas atualizadas: 42
-- Reverse scoring eliminado: 100% nas categorias DANGER e MISUNDERSTANDING
-- ============================================================================
