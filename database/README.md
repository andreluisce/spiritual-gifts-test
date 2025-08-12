# Sistema de Dons Espirituais - Scripts SQL

Este diretório contém todos os scripts SQL para configurar o sistema multilíngue de dons espirituais do zero.

## 🚀 Quick Setup

### Option 1: Automated Script (Recommended)
```bash
cd database/
./run_all_scripts.sh
```

### Option 2: Manual Execution
Execute scripts one by one in order:
```bash
psql -d your_database -f 00_FRESH_START_drop_and_recreate.sql
psql -d your_database -f 01_CLEAN_complete_system.sql  
psql -d your_database -f 02_CLEAN_load_data.sql
psql -d your_database -f 03_CLEAN_load_questions.sql
psql -d your_database -f 04_CLEAN_english_translations.sql
psql -d your_database -f 05_CLEAN_spanish_translations.sql
psql -d your_database -f enhanced_spiritual_gifts_schema.sql
psql -d your_database -f 06_CLEAN_final_verification.sql
psql -d your_database -f 07_RLS_policies.sql
```

## 📋 Scripts Individuais (Ordem de Execução)

### 1. `00_FRESH_START_drop_and_recreate.sql`
- **Propósito**: Limpa completamente o schema público
- **⚠️ CUIDADO**: Remove TODOS os dados existentes
- **Uso**: Apenas para desenvolvimento ou reset completo

### 2. `01_CLEAN_complete_system.sql` 
- **Propósito**: Cria o sistema base completo
- **Conteúdo**: 
  - Enums (gift_key, source_type, weight_class)
  - Tabelas principais (question_pool, question_translations, etc.)
  - Funções multilíngues (get_questions_by_locale, calculate_quiz_result)
  - Views de cálculo (v_answer_effective_weights, quiz_results_weighted)

### 3. `02_CLEAN_load_data.sql`
- **Propósito**: Carrega matriz de pesos completa
- **Conteúdo**: 105 configurações de peso (7 dons × 5 sources × 3 classes)

### 4. `03_CLEAN_load_questions.sql`
- **Propósito**: Carrega as 140 perguntas estruturadas em português
- **Estrutura**: 20 perguntas por dom, categorizadas por tipo

### 5. `04_CLEAN_english_translations.sql`
- **Propósito**: Adiciona traduções em inglês para todas as perguntas
- **Total**: 140 traduções

### 6. `05_CLEAN_spanish_translations.sql`
- **Propósito**: Adiciona traduções em espanhol para todas as perguntas  
- **Total**: 140 traduções

### 7. `enhanced_spiritual_gifts_schema.sql`
- **Propósito**: Adiciona dados ricos multilíngues
- **Conteúdo**:
  - Categorias (Motivações, Ministérios, Manifestações)
  - Dados detalhados dos dons (qualidades, características, perigos)
  - Informações bíblicas e teológicas
  - Funções avançadas para frontend

### 8. `06_CLEAN_final_verification.sql`
- **Propósito**: Verificação e validação completa do sistema
- **Funcionalidades**:
  - Testes automáticos
  - Criação de dados de teste
  - Função de validação completa
  - Estatísticas finais

### 9. `07_RLS_policies.sql`
- **Propósito**: Configura Row Level Security (RLS) para acesso seguro
- **Funcionalidades**:
  - Habilita RLS em todas as tabelas
  - Permite leitura de dados públicos para usuários autenticados
  - Restringe acesso a sessões e respostas aos próprios usuários
  - Configurações especiais para administradores

## 🧪 Testando o Sistema

Após a execução, teste com:

```sql
-- Testar perguntas multilíngues
SELECT * FROM get_questions_by_locale('pt');
SELECT * FROM get_questions_by_locale('en');  
SELECT * FROM get_questions_by_locale('es');

-- Testar dados ricos
SELECT * FROM get_categories_by_locale('pt');
SELECT * FROM get_all_gifts_with_data('pt');

-- Executar validação
SELECT * FROM validate_multilingual_system();
```

## 📊 Estrutura de Dados Final

### Tabelas Principais
- **question_pool**: 140 perguntas estruturadas
- **question_translations**: Traduções multilíngues 
- **decision_weights**: 105 configurações de peso
- **quiz_sessions**: Sessões de usuário
- **answers**: Respostas dos usuários
- **profiles**: Perfis de usuário

### Tabelas de Dados Ricos
- **categories**: Categorias teológicas (Motivações, Ministérios, Manifestações)
- **spiritual_gifts**: Dados detalhados dos 7 dons
- **qualities**: Qualidades de cada dom
- **characteristics**: Características distintivas
- **dangers**: Perigos a evitar
- **misunderstandings**: Mal-entendidos comuns
- **ministries**: Ministérios bíblicos
- **manifestations**: Manifestações do Espírito
- **biblical_activities**: Atividades bíblicas relacionadas

### Funções Principais
- `get_questions_by_locale(locale)`: Retorna perguntas no idioma especificado
- `calculate_quiz_result(session_id)`: Calcula resultados ponderados
- `get_top_gift_details(session_id, locale)`: Detalhes do dom principal
- `get_gift_complete_data(gift_key, locale)`: Dados completos de um dom
- `validate_multilingual_system()`: Validação completa do sistema

## 🗂️ Estrutura de Arquivos

```
database/
├── 00_MASTER_SETUP.sql          # 🚀 Script principal (execute este)
├── 00_FRESH_START_drop_and_recreate.sql
├── 01_CLEAN_complete_system.sql
├── 02_CLEAN_load_data.sql
├── 03_CLEAN_load_questions.sql
├── 04_CLEAN_english_translations.sql
├── 05_CLEAN_spanish_translations.sql
├── 06_CLEAN_final_verification.sql
├── enhanced_spiritual_gifts_schema.sql
└── README.md                    # Este arquivo
```

## 🔐 Segurança e RLS

### Aplicar apenas políticas RLS
Se você já tem o banco configurado e só precisa aplicar as políticas de segurança:

```bash
cd database/
./apply_rls_policies.sh
```

### Políticas de Acesso
- **Dados públicos**: Todos os usuários autenticados podem ler categorias, dons, perguntas
- **Dados privados**: Usuários só acessam suas próprias sessões e respostas
- **Administradores**: Acesso completo se `is_admin = true` nos metadados do usuário

## ⚡ Dicas de Uso

1. **Desenvolvimento**: Use `00_MASTER_SETUP.sql` para reset completo
2. **Produção**: Execute scripts individuais para atualizações incrementais
3. **Debug**: Use `06_CLEAN_final_verification.sql` para diagnosticar problemas
4. **Backup**: Sempre faça backup antes de executar `00_FRESH_START`
5. **Segurança**: Sempre execute `07_RLS_policies.sql` em produção

## 🌍 Suporte Multilíngue

O sistema suporta:
- **pt**: Português (padrão)
- **en**: Inglês  
- **es**: Espanhol

Facilmente extensível para outros idiomas adicionando registros em `question_translations` e tabelas de dados ricos.