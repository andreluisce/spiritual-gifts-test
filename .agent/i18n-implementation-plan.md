# Análise e Implementação Completa de i18n

## 📊 Estado Atual do i18n

### ✅ Tabelas com i18n IMPLEMENTADO:

#### Modelo 1: Tabela Base + Tabela de Traduções
1. **question_pool** → **question_translations**
   - Base: metadados (gift, weight, pclass)
   - Traduções: text por locale

2. **educational_content** → **educational_content_translations**
   - Base: section_type, order_index
   - Traduções: title, content, biblical_reference por locale

#### Modelo 2: Locale como coluna (dados duplicados por idioma)
3. **spiritual_gifts** (locale: string)
   - Campos traduzíveis: name, definition, biblical_references

4. **categories** (locale: string)
   - Campos traduzíveis: name, description

5. **characteristics** (locale: string)
   - Campos traduzíveis: characteristic_name, description

6. **dangers** (locale: string)
   - Campos traduzíveis: danger

7. **misunderstandings** (locale: string)
   - Campos traduzíveis: misunderstanding

8. **qualities** (locale: string)
   - Campos traduzíveis: quality_name, description

9. **manifestations** (locale: string)
   - Campos traduzíveis: name, definition, biblical_references

10. **ministries** (locale: string)
    - Campos traduzíveis: name, definition, biblical_references

11. **manifestation_principles** (locale: string)
    - Campos traduzíveis: principle

12. **gift_bible_verses** (locale: string)
    - Campos traduzíveis: verse_text, verse_reference, context_note

13. **gift_content_cache** (locale: string)
    - Cache de conteúdo AI por locale

---

## 🎯 Plano de Implementação

### Fase 1: Padronização do Modelo i18n ✅
**Decisão:** Manter o modelo atual (Modelo 2: locale como coluna)
- ✅ Mais simples para queries
- ✅ Melhor performance (sem JOINs)
- ✅ Já implementado na maioria das tabelas

### Fase 2: Verificar Tabelas Faltantes
Tabelas que PODEM precisar de i18n mas NÃO têm:
- ❌ **profiles** - Não precisa (dados do usuário)
- ❌ **quiz_sessions** - Não precisa (dados de sessão)
- ❌ **user_demographics** - Não precisa (dados demográficos)
- ❌ **user_activities** - Não precisa (logs)
- ❌ **system_settings** - Pode precisar no futuro
- ❌ **gift_compatibility_analysis** - Conteúdo AI, já tem locale implícito

### Fase 3: Criar Funções Helper para i18n
Criar funções SQL que facilitam queries multilíngue:
1. `get_content_by_locale(table_name, locale)` - Genérica
2. `get_spiritual_gifts_by_locale(locale)` - Específica
3. `get_questions_by_locale(locale)` - Específica

### Fase 4: Migração de Dados
Garantir que TODOS os dados existentes têm tradução em PT (idioma principal):
1. Auditar dados existentes
2. Criar traduções faltantes
3. Validar integridade

### Fase 5: Frontend i18n
1. Configurar next-intl corretamente
2. Criar arquivos de tradução para UI
3. Implementar seletor de idioma
4. Garantir que todas as queries usam locale correto

---

## 🚀 Ações Imediatas

### 1. Criar Helper Functions SQL
### 2. Auditar Dados Existentes
### 3. Implementar Seletor de Idioma no Frontend
### 4. Documentar Padrões i18n para Desenvolvedores

---

## 📝 Convenções i18n

### Locales Suportados:
- `pt` - Português (Brasil) - **PADRÃO**
- `en` - English (planejado)
- `es` - Español (planejado)

### Regras:
1. **Sempre** incluir `locale` em queries de conteúdo
2. **Fallback** para `pt` se locale não encontrado
3. **Validar** locale antes de inserir (enum ou check constraint)
4. **Indexar** colunas `locale` para performance
