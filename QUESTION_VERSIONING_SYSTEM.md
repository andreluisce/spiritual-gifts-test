# Sistema de Versionamento de Perguntas

**Data de Implementação:** 07/01/2026
**Migration:** `20260107112214_create_question_history_v3.sql`
**Status:** ✅ Ativo em produção

---

## 🎯 Objetivo

Manter um **histórico completo** de todas as versões das perguntas do quiz, preservando as versões antigas para referência, mas garantindo que **apenas as versões atuais sejam usadas** no quiz ativo.

---

## 📊 Estrutura do Sistema

### 1. Tabela Principal: `question_pool`

Contém **apenas a versão atual** de cada pergunta (a que é usada no quiz).

**Nova coluna adicionada:**
```sql
version INT NOT NULL DEFAULT 1
```

**Valores de versão:**
- `version = 1`: Pergunta original (não reformulada)
- `version = 2`: Pergunta reformulada (sem reverse scoring)

### 2. Tabela de Histórico: `question_history`

Armazena **todas as versões antigas** das perguntas para referência histórica.

**Estrutura:**
```sql
CREATE TABLE question_history (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL,           -- FK para question_pool.id
  version INT NOT NULL,                   -- Número da versão antiga
  gift gift_key NOT NULL,
  source source_type NOT NULL,
  pclass weight_class NOT NULL,
  reverse_scored BOOLEAN NOT NULL,       -- Se usava reverse scoring
  default_weight NUMERIC(6,3) NOT NULL,
  text TEXT NOT NULL,                    -- Texto da versão antiga
  reason_for_change TEXT,                -- Por que foi alterada
  changed_at TIMESTAMPTZ NOT NULL,       -- Quando foi alterada
  changed_by TEXT DEFAULT 'system',      -- Quem alterou
  UNIQUE(question_id, version)           -- Uma entrada por versão
);
```

### 3. View: `question_version_history`

Facilita comparação entre versão antiga e atual:

```sql
CREATE VIEW question_version_history AS
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
```

---

## 🔍 Como Funciona

### Perguntas Reformuladas (42 total)

| ID | Dom | Versão Atual | Status |
|----|-----|--------------|--------|
| 12-17 | A_PROPHECY | 2 | ✅ Reformulada |
| 31-36 | B_SERVICE | 2 | ✅ Reformulada |
| 50-55 | C_TEACHING | 2 | ✅ Reformulada |
| 69-74 | D_EXHORTATION | 2 | ✅ Reformulada |
| 88-93 | E_GIVING | 2 | ✅ Reformulada |
| 107-112 | F_LEADERSHIP | 2 | ✅ Reformulada |
| 126-131 | G_MERCY | 2 | ✅ Reformulada |

### Perguntas Não Reformuladas (91 total)

Todas as perguntas **QUALITY**, **CHARACTERISTIC** e **OTHER** permanecem com `version = 1` (versão original).

---

## 📝 Consultas Úteis

### Ver todas as perguntas reformuladas
```sql
SELECT id, gift, source, version, reverse_scored, text
FROM question_pool
WHERE version = 2
ORDER BY gift, id;
```

### Ver comparação antes/depois de uma pergunta
```sql
SELECT *
FROM question_version_history
WHERE question_id = 107  -- Exemplo: Liderança - Delegação
ORDER BY old_version;
```

### Contar perguntas por versão
```sql
SELECT
  version,
  COUNT(*) as total_questions,
  SUM(CASE WHEN reverse_scored THEN 1 ELSE 0 END) as reverse_scored_count
FROM question_pool
GROUP BY version
ORDER BY version;
```

**Resultado esperado:**
| version | total_questions | reverse_scored_count |
|---------|-----------------|----------------------|
| 1 | 91 | 0 |
| 2 | 42 | 0 |

### Ver histórico completo de uma pergunta específica
```sql
-- Versão antiga (se existir)
SELECT * FROM question_history WHERE question_id = 107;

-- Versão atual
SELECT * FROM question_pool WHERE id = 107;
```

---

## ✅ Garantias do Sistema

### 1. Quiz Usa Apenas Versões Atuais

O sistema de quiz (`generate_balanced_quiz`) busca perguntas diretamente de `question_pool`, que contém **apenas as versões atuais**.

```sql
-- Exemplo da função generate_balanced_quiz
SELECT qp.id, qp.text, qp.reverse_scored, qt.text as translated_text
FROM question_pool qp
LEFT JOIN question_translations qt
  ON qt.question_id = qp.id AND qt.locale = target_locale
WHERE qp.is_active = true  -- Apenas perguntas ativas
ORDER BY RANDOM()
LIMIT 5;
```

✅ **Resultado**: Apenas versões atuais são incluídas no quiz.

### 2. Versões Antigas Preservadas

Todas as versões antigas podem ser consultadas em `question_history` para:
- Análise comparativa
- Auditoria de mudanças
- Estudos de validação psicométrica
- Documentação histórica

### 3. Rastreabilidade Completa

Cada mudança registra:
- **O quê mudou**: Texto antigo vs texto novo
- **Por que mudou**: `reason_for_change`
- **Quando mudou**: `changed_at`
- **Quem mudou**: `changed_by`

---

## 🔧 Como Adicionar Novas Versões

### Processo para reformular perguntas adicionais:

1. **Inserir versão antiga no histórico:**
```sql
INSERT INTO question_history (
  question_id, version, gift, source, pclass,
  reverse_scored, default_weight, text,
  reason_for_change, changed_by
)
SELECT
  id, version, gift, source, pclass,
  reverse_scored, default_weight, text,
  'Sua razao aqui', 'seu_nome_aqui'
FROM question_pool
WHERE id IN (lista_de_ids_a_reformular);
```

2. **Atualizar question_pool com nova versão:**
```sql
UPDATE question_pool
SET
  text = 'Novo texto da pergunta',
  reverse_scored = false,
  version = version + 1
WHERE id = id_da_pergunta;
```

3. **Documentar no CHANGELOG:**
- Adicionar entrada com data, IDs reformulados e razão

---

## 📚 Documentação Relacionada

| Arquivo | Descrição |
|---------|-----------|
| `REFORMULATION_SUMMARY.md` | Resumo completo da reformulação de 2026-01-07 |
| `QUESTION_REFORMULATION_PROTOTYPE.md` | Protótipo detalhado com exemplos |
| `QUESTION_AUDIT_REPORT.md` | Relatório de auditoria de viés psicológico |
| `QUESTIONS_TABLE.md` | Tabela completa de todas as perguntas |

---

## 🎓 Exemplos Práticos

### Exemplo 1: Consultar evolução da pergunta de Liderança #107

```sql
-- Versão antiga (v1)
SELECT text, reverse_scored
FROM question_history
WHERE question_id = 107 AND version = 1;
```
**Resultado:**
```
text: "Centralizo decisões por não confiar suficientemente na equipe."
reverse_scored: true (🔄)
```

```sql
-- Versão atual (v2)
SELECT text, reverse_scored, version
FROM question_pool
WHERE id = 107;
```
**Resultado:**
```
text: "Delego decisões importantes confiando nas capacidades da equipe."
reverse_scored: false (→)
version: 2
```

### Exemplo 2: Análise de impacto da reformulação

```sql
SELECT
  COUNT(DISTINCT qh.question_id) as perguntas_reformuladas,
  SUM(CASE WHEN qh.reverse_scored THEN 1 ELSE 0 END) as tinha_reverse_antes,
  SUM(CASE WHEN qp.reverse_scored THEN 1 ELSE 0 END) as tem_reverse_agora
FROM question_history qh
JOIN question_pool qp ON qh.question_id = qp.id
WHERE qh.version = 1 AND qp.version = 2;
```

**Resultado esperado:**
```
perguntas_reformuladas: 42
tinha_reverse_antes: 42
tem_reverse_agora: 0
```

✅ **100% de eliminação de reverse scoring nas perguntas reformuladas**

---

## ⚠️ Regras Importantes

### 1. Nunca Deletar de `question_pool`
❌ **NUNCA** delete perguntas de `question_pool`
✅ **Use** `is_active = false` para desativar

### 2. Sempre Preservar Histórico
❌ **NUNCA** atualize `question_pool` sem antes inserir em `question_history`
✅ **SEMPRE** registre a versão antiga antes de modificar

### 3. Versionamento Sequencial
❌ **NUNCA** pule números de versão
✅ **SEMPRE** incremente sequencialmente (1 → 2 → 3...)

### 4. Unique Constraint
A combinação `(question_id, version)` é **UNIQUE**.
Você **não pode** ter duas entradas para a mesma pergunta com a mesma versão.

---

## 🚀 Status Atual do Sistema

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Tabela de histórico | ✅ Criada | `question_history` |
| Coluna de versão | ✅ Adicionada | `question_pool.version` |
| Índices | ✅ Criados | Performance otimizada |
| View de comparação | ✅ Disponível | `question_version_history` |
| Perguntas versionadas | ✅ 42/42 | 100% marcadas corretamente |
| Documentação | ✅ Completa | Este arquivo |

---

`★ Insight ─────────────────────────────────────`
Este sistema permite **rastreabilidade total** das mudanças nas perguntas enquanto garante que o quiz sempre use **apenas as versões mais recentes e validadas**. É uma solução robusta para evolução contínua do instrumento.
`─────────────────────────────────────────────────`

**Última Atualização:** 07/01/2026
**Versão do Sistema:** 1.0
