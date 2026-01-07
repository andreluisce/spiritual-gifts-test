-- Sistema de Versionamento e Historico de Perguntas
-- Preserva versoes antigas para referencia historica

BEGIN;

-- 1. Criar tabela de historico
CREATE TABLE IF NOT EXISTS question_history (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL,
  version INT NOT NULL,
  gift gift_key NOT NULL,
  source source_type NOT NULL,
  pclass weight_class NOT NULL,
  reverse_scored BOOLEAN NOT NULL,
  default_weight NUMERIC(6,3) NOT NULL,
  text TEXT NOT NULL,
  reason_for_change TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  changed_by TEXT DEFAULT 'system',
  UNIQUE(question_id, version)
);

-- 2. Adicionar coluna de versao na tabela principal
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='question_pool' AND column_name='version') THEN
    ALTER TABLE question_pool ADD COLUMN version INT NOT NULL DEFAULT 1;
  END IF;
END $$;

-- 3. Marcar perguntas reformuladas como versao 2
UPDATE question_pool SET version = 2
WHERE id IN (12,13,14,15,16,17,31,32,33,34,35,36,50,51,52,53,54,55,69,70,71,72,73,74,88,89,90,91,92,93,107,108,109,110,111,112,126,127,128,129,130,131);

-- 4. Criar indices
CREATE INDEX IF NOT EXISTS idx_question_history_question_id ON question_history(question_id);
CREATE INDEX IF NOT EXISTS idx_question_history_version ON question_history(version);
CREATE INDEX IF NOT EXISTS idx_question_pool_version ON question_pool(version);

-- 5. View para historico de versoes
CREATE OR REPLACE VIEW question_version_history AS
SELECT
  qh.id as history_id,
  qh.question_id,
  qh.version as old_version,
  qh.text as old_text,
  qh.reverse_scored as old_reverse_scored,
  qp.version as current_version,
  qp.text as current_text,
  qp.reverse_scored as current_reverse_scored,
  qh.reason_for_change,
  qh.changed_at,
  qh.changed_by,
  qp.gift,
  qp.source,
  qp.pclass
FROM question_history qh
JOIN question_pool qp ON qh.question_id = qp.id
ORDER BY qh.question_id, qh.version;

-- 6. Documentacao
COMMENT ON TABLE question_history IS 'Historico de mudancas nas perguntas. Versao 1 = reverse scoring, Versao 2+ = sem reverse scoring';
COMMENT ON COLUMN question_pool.version IS 'Versao atual da pergunta. Apenas esta versao e usada no quiz';
COMMENT ON VIEW question_version_history IS 'Compara versoes antigas com versao atual';

COMMIT;
