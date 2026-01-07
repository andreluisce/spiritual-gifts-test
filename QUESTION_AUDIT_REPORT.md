# Relatório de Auditoria: Viés Psicológico nas Perguntas do Quiz

**Data**: 2026-01-06
**Auditor**: Claude Code
**Escopo**: Análise completa de 133 perguntas do question_pool

---

## 📊 Resumo Executivo

### Estatísticas Gerais
- **Total de perguntas**: 133 perguntas ativas
- **Perguntas com reverse scoring**: 42 (32%)
- **Perguntas DANGER**: 28 (21%)
- **Perguntas MISUNDERSTANDING**: 14 (11%)
- **Perguntas com viés extremo identificado**: 9 (7%)

### Distribuição por Dom
Cada dom tem **19 perguntas**, distribuídas da seguinte forma:
- **QUALITY**: 5 perguntas (positivas)
- **CHARACTERISTIC**: 6 perguntas (neutras a positivas)
- **DANGER**: 4 perguntas (negativas, reverse-scored)
- **MISUNDERSTANDING**: 2 perguntas (negativas, reverse-scored)
- **OTHER**: 2 perguntas (balanceamento)

---

## 🚨 Problemas Identificados

### 1. Viés de Desejabilidade Social (Social Desirability Bias)

**Problema**: Perguntas DANGER descrevem comportamentos socialmente indesejáveis que ninguém quer admitir.

**Exemplos Problemáticos**:
```
ID 50: "Sinto-me superior por meu conhecimento e desmereço quem sabe menos."
ID 107: "Centralizo decisões por não confiar suficientemente na equipe."
ID 126: "Tomo decisões principalmente pelas emoções, ignorando a sabedoria."
```

**Impacto**:
- Pessoas subestimam comportamentos negativos (auto-proteção)
- Respostas defensivas ("Nunca faço isso!")
- Scores inflacionados e menos precisos
- Reduz a validade do teste

---

### 2. Confusão Cognitiva com Reverse Scoring

**Problema**: 32% das perguntas usam reverse scoring, criando complexidade cognitiva desnecessária.

**Como funciona atualmente**:
- Pergunta DANGER: "Centralizo decisões..." (comportamento negativo)
- Reverse scoring: Se a pessoa concorda, o score DIMINUI
- Usuário precisa processar: "Se eu admito isso negativo, meu dom diminui"

**Impacto**:
- Confusão durante o teste
- Respostas inconsistentes
- Fadiga mental aumentada
- Resultados menos confiáveis

---

### 3. Polarização Extrema (Positivo vs Negativo)

**Problema**: Não há equilíbrio entre perguntas positivas e negativas.

**Distribuição atual**:
- **QUALITY** (100% positivas): "Busco comunicar a mensagem com franqueza e precisão"
- **CHARACTERISTIC** (neutras): "Percebo quando alguém está receptivo"
- **DANGER** (100% negativas): "Fico irritado quando meu serviço é atrapalhado"
- **MISUNDERSTANDING** (100% negativas): "Pareço intolerante a nuances legítimas"

**Impacto**:
- Falta de contexto neutro para balancear
- Perguntas muito óbvias ("claro que busco franqueza!")
- Dificulta respostas honestas

---

### 4. Palavras Absolutas e Emocionais

**Perguntas com palavras problemáticas**:

```
ID 26: "melhor" (viés positivo)
ID 33: "ignoro" (viés negativo extremo)
ID 50: "superior", "desmereço" (carga emocional negativa)
ID 51: "todos" (absoluto)
ID 74: "mais...que" (comparação absoluta)
ID 91: "mártir" (carga emocional forte)
ID 107: "centralizo" (viés negativo)
ID 109: "imponho" (viés negativo)
```

**Impacto**:
- Respostas enviesadas por palavras carregadas
- Dificuldade de auto-avaliação precisa
- Reação emocional em vez de reflexão

---

## ✅ Recomendações de Melhoria

### Estratégia 1: Eliminar Reverse Scoring

**Problema**: Reverse scoring adiciona complexidade cognitiva desnecessária.

**Solução**: Reformular todas as 42 perguntas reverse-scored para linguagem neutra/positiva.

**Exemplo de Reformulação**:

| Atual (Reverse-scored) | Proposta (Normal scoring) |
|---|---|
| ❌ "Centralizo decisões por não confiar na equipe" | ✅ "Delego decisões importantes para membros da equipe" |
| ❌ "Sinto-me superior por meu conhecimento" | ✅ "Compartilho conhecimento com humildade e paciência" |
| ❌ "Fico irritado quando meu serviço é atrapalhado" | ✅ "Mantenho a calma quando surgem imprevistos no serviço" |
| ❌ "Valorizo tanto o fazer que ignoro as pessoas" | ✅ "Equilibro realizar tarefas com cuidado pelas pessoas" |

**Benefícios**:
- Eliminação de confusão cognitiva
- Respostas mais consistentes
- Melhor experiência do usuário
- Maior validade do teste

---

### Estratégia 2: Reformular Perguntas DANGER como Comportamentos Positivos

**Problema Atual**: Perguntas DANGER descrevem apenas o comportamento negativo.

**Solução**: Transformar em descrições de comportamentos saudáveis.

**Exemplos**:

#### Dom de Profecia (A_PROPHECY)

| ID | Atual (DANGER) | Proposta |
|---|---|---|
| 12 | "Tendo oportunidade de pregar, priorizo parecer brilhante em vez de depender do Espírito" | "Ao pregar, dependo do Espírito Santo mais do que da minha habilidade retórica" |
| 13 | "Confio tanto na minha lógica que descuido da oração" | "Equilibro preparação intelectual com oração e dependência de Deus" |
| 14 | "Enxergo pessoas mais como plateia do que como indivíduos" | "Vejo cada pessoa como indivíduo com necessidades únicas" |
| 15 | "Busco falar em público para ser reconhecido, não para edificar" | "Falo em público com o objetivo principal de edificar os ouvintes" |

#### Dom de Serviço (B_SERVICE)

| ID | Atual (DANGER) | Proposta |
|---|---|---|
| 31 | "Assumo mais tarefas do que consigo cumprir" | "Sei estabelecer limites saudáveis e dizer não quando necessário" |
| 32 | "Fico irritado quando meu serviço é atrapalhado" | "Mantenho paciência quando surgem obstáculos no serviço" |
| 33 | "Valorizo tanto o fazer que ignoro as pessoas" | "Equilibro eficiência na tarefa com atenção às pessoas" |
| 34 | "Sirvo esperando reconhecimento" | "Sirvo com alegria, mesmo quando não sou reconhecido" |

#### Dom de Ensino (C_TEACHING)

| ID | Atual (DANGER) | Proposta |
|---|---|---|
| 50 | "Sinto-me superior por meu conhecimento" | "Compartilho conhecimento com humildade, reconhecendo que sempre tenho mais a aprender" |
| 51 | "Acumulo informação e adio decisões esperando ter todos os dados" | "Consigo tomar decisões equilibrando informação com sabedoria prática" |
| 52 | "Concentro-me tanto em conteúdo que esqueço necessidades dos alunos" | "Adapto o conteúdo às necessidades reais dos alunos" |
| 53 | "Uso detalhes técnicos desnecessários que tornam a aula árida" | "Comunico conceitos complexos de forma clara e acessível" |

---

### Estratégia 3: Reformular Perguntas MISUNDERSTANDING como Auto-percepção

**Problema Atual**: Perguntas MISUNDERSTANDING descrevem como OUTROS veem a pessoa.

**Solução**: Transformar em auto-percepção ou comportamentos observáveis.

**Exemplos**:

| ID | Atual (MISUNDERSTANDING) | Proposta |
|---|---|---|
| 16 | "Costumo impor padrões sem sensibilidade, criando distância" | "Comunico padrões com sensibilidade, mantendo relacionamentos próximos" |
| 17 | "Ajo de modo tão binário que pareço intolerante" | "Consigo ver nuances legítimas em situações complexas" |
| 35 | "Insisto tanto em ajudar que pareço não aberto a ser ajudado" | "Estou aberto tanto a ajudar quanto a receber ajuda de outros" |
| 54 | "Minha busca por precisão parece frieza" | "Comunico com precisão de forma calorosa e acessível" |

---

### Estratégia 4: Balancear Categorias com Perguntas Neutras

**Problema**: Faltam perguntas neutras/descritivas.

**Solução**: Adicionar perguntas que descrevem comportamentos sem julgamento de valor.

**Exemplos de Perguntas Neutras**:

```
- "Prefiro estudar a Bíblia sozinho ou em grupo?"
- "Com que frequência compartilho insights espirituais com outras pessoas?"
- "Quanto tempo dedico semanalmente a servir na igreja?"
- "Prefiro liderar projetos ou ser parte de uma equipe?"
```

**Benefícios**:
- Reduz viés de desejabilidade social
- Fornece dados comportamentais objetivos
- Mais difícil "manipular" o resultado
- Aumenta validade do teste

---

### Estratégia 5: Remover Palavras Absolutas e Emocionais

**Problema**: Palavras como "sempre", "nunca", "superior", "mártir" carregam viés.

**Solução**: Substituir por linguagem mais neutra e gradual.

**Reformulações Específicas**:

| Palavra Problemática | Substituição Neutra |
|---|---|
| "sempre" | "frequentemente", "geralmente" |
| "nunca" | "raramente", "pouco" |
| "todo" | "a maioria", "muitos" |
| "superior" | "mais confiante", "mais experiente" |
| "mártir" | "desvalorizado", "não apreciado" |
| "ignoro" | "não priorizo", "dou menos atenção" |
| "centralizo" | "tendo a concentrar", "prefiro manter" |
| "imponho" | "insisto em", "prefiro que sigam" |

---

## 📋 Plano de Ação Recomendado

### Fase 1: Reformulação Crítica (Prioridade Alta)
**Prazo**: 2-3 semanas

1. **Reformular todas as 28 perguntas DANGER**
   - Eliminar reverse scoring
   - Transformar em comportamentos positivos
   - Remover palavras absolutas

2. **Reformular todas as 14 perguntas MISUNDERSTANDING**
   - Eliminar reverse scoring
   - Focar em auto-percepção, não percepção de outros
   - Tornar mais observável e menos subjetivo

### Fase 2: Balanceamento (Prioridade Média)
**Prazo**: 1-2 meses

3. **Adicionar 21 perguntas neutras** (3 por dom)
   - Comportamentos observáveis
   - Sem julgamento de valor
   - Difíceis de "manipular"

4. **Revisar perguntas QUALITY**
   - Reduzir viés positivo extremo
   - Tornar mais específicas e mensuráveis

### Fase 3: Validação (Prioridade Média)
**Prazo**: 2-3 meses

5. **Testar novas perguntas com amostra pequena**
   - 20-30 usuários
   - Comparar resultados antigos vs novos
   - Coletar feedback qualitativo

6. **Análise estatística**
   - Consistência interna (Cronbach's Alpha)
   - Correlações entre perguntas
   - Distribuição de respostas

---

## 📊 Métricas de Sucesso

### Objetivos Quantitativos
- ✅ **0% de perguntas reverse-scored** (atualmente 32%)
- ✅ **< 5% de perguntas com palavras absolutas** (atualmente 7%)
- ✅ **Cronbach's Alpha > 0.70** para cada dom
- ✅ **Distribuição normal** de scores (evitar clustering)

### Objetivos Qualitativos
- ✅ Feedback positivo sobre clareza das perguntas
- ✅ Redução de tempo médio por pergunta
- ✅ Menor taxa de "não sei responder"
- ✅ Maior confiança dos usuários nos resultados

---

## 🎯 Benefícios Esperados

### Para os Usuários
1. **Experiência melhor**: Perguntas mais claras e fáceis de responder
2. **Resultados mais precisos**: Menos viés, mais auto-conhecimento real
3. **Maior confiança**: Perguntas parecem mais válidas e profissionais
4. **Menos fadiga**: Eliminação de confusão cognitiva

### Para o Sistema
1. **Dados mais confiáveis**: Scores refletem melhor a realidade
2. **Análises mais válidas**: IA pode confiar mais nos dados
3. **Reputação melhor**: Teste visto como mais profissional
4. **Base científica**: Pode ser usado em pesquisas sérias

---

## 📝 Próximos Passos Imediatos

1. ✅ **Aprovar este relatório** com stakeholders
2. ⏳ **Criar branch de reformulação** de perguntas
3. ⏳ **Reformular primeiras 10 perguntas DANGER** como piloto
4. ⏳ **Testar com 5 usuários** e coletar feedback
5. ⏳ **Iterar** baseado no feedback
6. ⏳ **Escalar** para todas as perguntas

---

## 📎 Anexos

### A. Lista Completa de Perguntas com Viés Extremo

```
ID 26 | B_SERVICE | CHARACTERISTIC | "Recordo preferências e detalhes que ajudam a servir melhor as pessoas."
ID 33 | B_SERVICE | DANGER | "Valorizo tanto o fazer que ignoro as pessoas e seus sentimentos."
ID 50 | C_TEACHING | DANGER | "Sinto-me superior por meu conhecimento e desmereço quem sabe menos."
ID 51 | C_TEACHING | DANGER | "Acumulo informação e adio decisões por esperar 'ter todos os dados'."
ID 74 | D_EXHORTATION | MISUNDERSTANDING | "Ao estruturar planos, pareço confiar mais no método que no Espírito."
ID 90 | E_GIVING | DANGER | "Atendo toda solicitação imediata sem avaliar se é o melhor para o outro."
ID 91 | E_GIVING | DANGER | "Sinto-me mártir quando minha generosidade não é reconhecida."
ID 107 | F_LEADERSHIP | DANGER | "Centralizo decisões por não confiar suficientemente na equipe."
ID 109 | F_LEADERSHIP | DANGER | "Imponho meu jeito em vez de servir e persuadir com humildade."
```

### B. Estatísticas por Categoria

| Categoria | Total | Reverse-scored | % Reverse | Viés Identificado |
|---|---|---|---|---|
| QUALITY | 35 | 0 | 0% | 1 (positivo) |
| CHARACTERISTIC | 42 | 0 | 0% | 1 (positivo) |
| DANGER | 28 | 28 | 100% | 7 (negativo) |
| MISUNDERSTANDING | 14 | 14 | 100% | 1 (negativo) |
| OTHER | 14 | 0 | 0% | 0 |
| **TOTAL** | **133** | **42** | **32%** | **9** |

---

**Fim do Relatório**
