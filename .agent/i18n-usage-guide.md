# 🌍 Guia de Uso do Sistema i18n

## 📚 Visão Geral

O sistema de internacionalização (i18n) do projeto suporta **3 idiomas**:
- 🇧🇷 **Português (pt)** - Idioma padrão
- 🇺🇸 **English (en)** - Planejado
- 🇪🇸 **Español (es)** - Planejado

## 🎯 Como Usar

### 1. **No Frontend (React/Next.js)**

#### Usar Hooks i18n para Conteúdo do Banco de Dados

```typescript
import { useSpiritualGiftsI18n, useGiftCompleteI18n } from '@/hooks/useI18nContent'

function MyComponent() {
  // Automaticamente usa o locale do next-intl
  const { gifts, loading, error } = useSpiritualGiftsI18n()

  return (
    <div>
      {gifts.map(gift => (
        <div key={gift.gift_key}>
          <h2>{gift.name}</h2>
          <p>{gift.definition}</p>
        </div>
      ))}
    </div>
  )
}
```

#### Hooks Disponíveis

```typescript
// 1. Todos os dons espirituais
const { gifts, loading, error } = useSpiritualGiftsI18n()

// 2. Todas as perguntas do quiz
const { questions, loading, error } = useQuestionsI18n()

// 3. Conteúdo educacional
const { content, loading, error } = useEducationalContentI18n()

// 4. Dados completos de um dom específico
const { giftData, loading, error } = useGiftCompleteI18n('A_PROPHECY')
```

#### Adicionar Seletor de Idioma

```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

function Header() {
  return (
    <header>
      <nav>
        {/* ... outros itens ... */}
        <LanguageSwitcher />
      </nav>
    </header>
  )
}
```

---

### 2. **No Backend (SQL/Supabase)**

#### Funções RPC Disponíveis

```sql
-- 1. Obter dons espirituais com tradução
SELECT * FROM get_spiritual_gifts_i18n('pt');

-- 2. Obter perguntas com tradução
SELECT * FROM get_questions_i18n('en');

-- 3. Obter conteúdo educacional
SELECT * FROM get_educational_content_i18n('es');

-- 4. Obter características de um dom
SELECT * FROM get_characteristics_i18n('A_PROPHECY', 'pt');

-- 5. Obter versículos bíblicos de um dom
SELECT * FROM get_gift_bible_verses_i18n('B_SERVICE', 'pt');

-- 6. Obter TODOS os dados de um dom (completo)
SELECT * FROM get_gift_complete_i18n('C_TEACHING', 'pt');

-- 7. Validar locale
SELECT validate_locale('invalid'); -- Retorna 'pt' (fallback)
SELECT validate_locale('en');      -- Retorna 'en'
```

---

### 3. **Adicionar Novas Traduções**

#### Para Tabelas com `locale` (Modelo Atual)

```sql
-- Exemplo: Adicionar tradução em inglês para um dom
INSERT INTO spiritual_gifts (gift_key, locale, name, definition, category_key)
VALUES (
  'A_PROPHECY',
  'en',
  'Prophecy',
  'The ability to speak God''s truth boldly',
  'motivational'
);

-- Exemplo: Adicionar tradução de característica
INSERT INTO characteristics (gift_key, locale, characteristic_name, description, order_sequence)
VALUES (
  'A_PROPHECY',
  'en',
  'Bold Communication',
  'Speaks truth directly and clearly',
  1
);
```

#### Para Tabelas com `_translations`

```sql
-- Exemplo: Adicionar tradução de pergunta
INSERT INTO question_translations (question_id, locale, text)
VALUES (
  1,
  'en',
  'I enjoy speaking God''s truth to others'
);

-- Exemplo: Adicionar tradução de conteúdo educacional
INSERT INTO educational_content_translations (content_id, locale, title, content)
VALUES (
  'intro-section-1',
  'en',
  'Introduction to Spiritual Gifts',
  'Spiritual gifts are special abilities given by the Holy Spirit...'
);
```

---

## 🔧 Convenções e Boas Práticas

### ✅ DO (Faça)

1. **Sempre use as funções i18n** em vez de queries diretas:
   ```typescript
   // ✅ BOM
   const { gifts } = useSpiritualGiftsI18n()

   // ❌ RUIM
   const { data } = await supabase.from('spiritual_gifts').select('*')
   ```

2. **Forneça fallback** para conteúdo faltante:
   ```typescript
   const giftName = gift.name || 'Nome não disponível'
   ```

3. **Valide locale** antes de inserir dados:
   ```sql
   INSERT INTO spiritual_gifts (locale, ...)
   VALUES (validate_locale('pt'), ...);
   ```

### ❌ DON'T (Não Faça)

1. **Não hardcode idiomas** no código:
   ```typescript
   // ❌ RUIM
   const locale = 'pt'

   // ✅ BOM
   const locale = useLocale()
   ```

2. **Não misture modelos i18n**:
   - Use `locale` como coluna OU tabela `_translations`
   - Não use ambos para a mesma entidade

3. **Não esqueça de indexar** colunas `locale`:
   ```sql
   CREATE INDEX idx_spiritual_gifts_locale ON spiritual_gifts(locale);
   ```

---

## 📊 Status de Tradução

### ✅ Tabelas com i18n Completo
- `spiritual_gifts`
- `categories`
- `characteristics`
- `dangers`
- `misunderstandings`
- `qualities`
- `manifestations`
- `ministries`
- `manifestation_principles`
- `gift_bible_verses`
- `question_pool` → `question_translations`
- `educational_content` → `educational_content_translations`

### ⏳ Próximos Passos
1. Traduzir todo conteúdo existente para EN e ES
2. Adicionar validação de locale em todas as tabelas
3. Criar scripts de migração de dados
4. Implementar cache de traduções

---

## 🐛 Troubleshooting

### Problema: Conteúdo não aparece no idioma selecionado

**Solução:**
1. Verifique se a tradução existe no banco:
   ```sql
   SELECT * FROM spiritual_gifts WHERE locale = 'en';
   ```
2. Verifique se o locale está sendo passado corretamente:
   ```typescript
   console.log('Current locale:', useLocale())
   ```
3. Limpe o cache do navegador (Cmd+Shift+R)

### Problema: Função RPC retorna vazio

**Solução:**
1. Verifique se a função existe:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'get_spiritual_gifts_i18n';
   ```
2. Teste a função diretamente no SQL:
   ```sql
   SELECT * FROM get_spiritual_gifts_i18n('pt');
   ```
3. Verifique os logs de erro no Supabase Dashboard

---

## 📞 Suporte

Para dúvidas sobre i18n:
1. Consulte este documento
2. Verifique `.agent/i18n-implementation-plan.md`
3. Revise os exemplos em `src/hooks/useI18nContent.ts`
