# 🚀 Setup no Supabase

## Pré-requisitos

### 1. Instalar Supabase CLI:
```bash
# Via npm
npm install -g supabase

# Via Homebrew (macOS)
brew install supabase/tap/supabase

# Verificar instalação
supabase --version
```

### 2. Fazer login no Supabase:
```bash
supabase login
```

### 3. Linkar seu projeto:
```bash
# Obter PROJECT_REF do dashboard Supabase (Settings → General)
supabase link --project-ref YOUR_PROJECT_REF
```

## 🎯 Execução Automática (Recomendada)

```bash
cd /Users/andreluisce/workspaces/personal/spiritual-gifts-test/database
./run_supabase_setup.sh
```

Este script vai:
- ✅ Verificar se CLI está instalado e logado
- ✅ Verificar se projeto está linkado  
- ✅ Dar opção de reset completo ou execução individual
- ✅ Executar todos os scripts na ordem correta
- ✅ Testar o sistema final
- ✅ Mostrar link do dashboard

## 📋 Execução Manual

### Opção A: Reset completo + Scripts
```bash
# 1. Reset do banco (limpa tudo)
supabase db reset

# 2. Executar scripts principais
cat 01_CLEAN_complete_system.sql | supabase db sql
cat 02_CLEAN_load_data.sql | supabase db sql
cat 03_CLEAN_load_questions.sql | supabase db sql
cat 04_CLEAN_english_translations.sql | supabase db sql
cat 05_CLEAN_spanish_translations.sql | supabase db sql
cat enhanced_spiritual_gifts_schema.sql | supabase db sql
cat 06_CLEAN_final_verification.sql | supabase db sql
```

### Opção B: Execução individual
```bash
# Executar cada script separadamente
supabase db sql -f 00_FRESH_START_drop_and_recreate.sql
supabase db sql -f 01_CLEAN_complete_system.sql
supabase db sql -f 02_CLEAN_load_data.sql
supabase db sql -f 03_CLEAN_load_questions.sql
supabase db sql -f 04_CLEAN_english_translations.sql
supabase db sql -f 05_CLEAN_spanish_translations.sql
supabase db sql -f enhanced_spiritual_gifts_schema.sql
supabase db sql -f 06_CLEAN_final_verification.sql
```

## 🧪 Testando o Sistema

### Comandos de teste:
```bash
# Testar perguntas multilíngues
supabase db sql --query "SELECT * FROM get_questions_by_locale('pt') LIMIT 5;"

# Testar categorias
supabase db sql --query "SELECT * FROM get_categories_by_locale('pt');"

# Validar sistema completo
supabase db sql --query "SELECT * FROM validate_multilingual_system();"

# Status geral do sistema
supabase db sql --query "
SELECT 
  '🎉 STATUS' as status,
  (SELECT COUNT(*) FROM question_pool) as perguntas,
  (SELECT COUNT(DISTINCT locale) FROM question_translations) as idiomas,
  '✅ OK' as resultado;
"
```

## 🔍 Verificação de Problemas

### Se der erro de autenticação:
```bash
supabase logout
supabase login
```

### Se não conseguir linkar o projeto:
1. Vá para https://app.supabase.com
2. Abra seu projeto
3. Settings → General → Reference ID
4. Use: `supabase link --project-ref SEU_REFERENCE_ID`

### Se der erro na execução:
```bash
# Ver logs detalhados
supabase db logs
```

## 📊 Estrutura Final

Após a execução, seu Supabase terá:

### 📋 **Tabelas Principais:**
- `question_pool` (140 perguntas)
- `question_translations` (traduções PT/EN/ES)
- `decision_weights` (matriz de pesos)
- `quiz_sessions` (sessões de usuário)
- `answers` (respostas)
- `profiles` (usuários)

### 🎨 **Dados Ricos:**
- `categories` (categorias teológicas)
- `spiritual_gifts` (dados detalhados dos dons)
- `qualities` (qualidades de cada dom)
- `characteristics` (características)
- `dangers` (perigos)
- `misunderstandings` (mal-entendidos)
- `ministries` (ministérios bíblicos)
- `manifestations` (manifestações)

### 🔧 **Funções RPC:**
- `get_questions_by_locale(locale)`
- `calculate_quiz_result(session_id)`
- `get_top_gift_details(session_id, locale)`
- `get_gift_complete_data(gift_key, locale)`
- `validate_multilingual_system()`

## 🌐 Dashboard

Acesse seu dashboard em: https://app.supabase.com

**Table Editor** → Visualizar dados inseridos
**SQL Editor** → Executar queries personalizadas
**API** → Testar endpoints automáticos
**Auth** → Configurar autenticação (se necessário)

## ⚡ Dicas

1. **Backup**: Sempre faça backup antes de executar
2. **Desenvolvimento**: Use `supabase db reset` para limpar e recomeçar
3. **Produção**: Execute scripts individualmente para controle
4. **Monitoramento**: Use `supabase db logs` para debug
5. **Migrações**: Supabase gera migrations automáticas das suas alterações