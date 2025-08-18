# Organização dos Arquivos SQL

## 🎯 ARQUIVOS PRINCIPAIS - USE ESTES

### 1. Setup Inicial
- **`00_MASTER_SETUP.sql`** - Script principal para setup completo
- **`backup.sql`** - Dados completos (qualities, characteristics, dangers, misunderstandings)

### 2. Migração Supabase (ATUAL)
```
supabase/migrations/
├── 20250812185723_fix_foreign_key_and_rls.sql
├── 20250812_complete_gift_data.sql (dados completos)
├── 20250812_add_characteristics.sql
└── 20250812_add_qualities.sql
```

## 📁 ESTRUTURA RECOMENDADA

### Core Database
- `01_schema.sql` - Estrutura de tabelas e tipos
- `02_data.sql` - Dados essenciais (dons, categorias, perguntas)
- `03_extended_data.sql` - Dados estendidos (qualities, characteristics, dangers, misunderstandings)
- `04_functions.sql` - Funções do quiz
- `05_rls_policies.sql` - Políticas de segurança
- `06_indexes.sql` - Índices para performance

### Translations
- `translations/pt.sql` - Dados em português
- `translations/en.sql` - Dados em inglês  
- `translations/es.sql` - Dados em espanhol

### Utilities
- `backup_complete.sql` - Backup completo dos dados
- `test_data.sql` - Dados para testes
- `verify_setup.sql` - Scripts de verificação

## 🚫 ARQUIVOS OBSOLETOS - REMOVER

### Database Legacy (podem ser removidos)
- `database/02_CLEAN_load_data.sql` - Substituído pelo backup.sql
- `database/03_CLEAN_load_questions.sql` - Incluído no MASTER_SETUP
- `database/04_CLEAN_english_translations.sql` - Reorganizar
- `database/05_CLEAN_spanish_translations.sql` - Reorganizar
- `database/06_CLEAN_final_verification.sql` - Obsoleto
- `database/enhanced_spiritual_gifts_schema.sql` - Duplicado
- `database/supabase/` - Pasta duplicada

### Root Level (podem ser removidos/organizados)
- `complete_characteristics.sql` - Dados incluídos no backup.sql
- `create_quiz_functions.sql` - Incluído nas migrations
- `EXECUTE_IN_SUPABASE.sql` - Temporário
- `populate_dangers_misunderstandings.sql` - Incluído no backup.sql
- `test_functions.sql` - Mover para pasta de testes

## 🎯 PRÓXIMOS PASSOS

1. Executar `backup.sql` no Supabase
2. Limpar arquivos obsoletos
3. Reorganizar estrutura conforme recomendação acima
4. Testar funcionamento completo