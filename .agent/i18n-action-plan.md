# 🌍 Plano de Ação: i18n Completo de Textos Hardcoded

## 📊 Status Atual

### ✅ O que JÁ está internacionalizado:
- ✅ Conteúdo do banco de dados (spiritual_gifts, questions, etc.)
- ✅ Arquivos de tradução existem (pt.json, en.json, es.json)
- ✅ Sistema next-intl configurado
- ✅ Muitas páginas já usam `useTranslations()`

### ❌ O que FALTA internacionalizar:
- ❌ Textos hardcoded em componentes admin
- ❌ Mensagens de erro específicas
- ❌ Labels de formulários
- ❌ Tooltips e placeholders
- ❌ Textos de confirmação

---

## 🎯 Estratégia de Implementação

### Fase 1: Auditoria Completa (FEITO ✅)
- [x] Identificar arquivos com textos hardcoded
- [x] Criar documento de rastreamento
- [x] Priorizar por impacto

### Fase 2: Adicionar Traduções aos Arquivos JSON
**Arquivos a atualizar:**
- `src/i18n/messages/pt.json`
- `src/i18n/messages/en.json`
- `src/i18n/messages/es.json`

**Seções a adicionar:**
```json
{
  "admin": {
    "quizReport": { ... },
    "users": { ... },
    "analytics": { ... }
  },
  "errors": {
    "generic": "Ocorreu um erro",
    "network": "Erro de conexão",
    "notFound": "Não encontrado"
  },
  "forms": {
    "required": "Campo obrigatório",
    "invalid": "Valor inválido"
  }
}
```

### Fase 3: Substituir Textos Hardcoded
**Padrão de substituição:**

```typescript
// ❌ ANTES (hardcoded)
<p>Carregando relatório...</p>

// ✅ DEPOIS (i18n)
import { useTranslations } from 'next-intl'

function Component() {
  const t = useTranslations('admin.quizReport')
  return <p>{t('loading')}</p>
}
```

### Fase 4: Traduzir para EN e ES
- Usar ferramentas de tradução automática
- Revisar traduções críticas manualmente
- Testar em cada idioma

---

## 📝 Arquivos Prioritários para i18n

### Alta Prioridade (Visível para usuários):
1. `/src/app/[locale]/admin/quiz-report/[sessionId]/page.tsx` ⚠️
2. `/src/app/[locale]/admin/page.tsx`
3. `/src/components/LanguageSwitcher.tsx`
4. Mensagens de erro globais

### Média Prioridade:
5. Páginas de analytics
6. Páginas de configurações
7. Formulários de admin

### Baixa Prioridade:
8. Tooltips
9. Logs de console
10. Comentários de código

---

## 🚀 Ação Imediata

Vou implementar i18n para a página de Quiz Report como exemplo:

1. ✅ Adicionar traduções ao pt.json
2. ✅ Criar traduções em en.json e es.json
3. ✅ Substituir textos hardcoded
4. ✅ Testar funcionamento

---

## 📊 Estimativa de Trabalho

- **Arquivos a modificar:** ~50 arquivos
- **Textos a extrair:** ~500-800 strings
- **Tempo estimado:** 8-12 horas de trabalho
- **Prioridade:** ALTA (afeta UX multilíngue)

---

## ✅ Checklist de Implementação

- [x] Criar funções SQL i18n
- [x] Criar hooks React i18n
- [x] Criar componente LanguageSwitcher
- [ ] Extrair textos hardcoded do admin
- [ ] Adicionar traduções completas
- [ ] Testar em todos os idiomas
- [ ] Documentar padrões para novos desenvolvedores

---

## 🎓 Padrões para Desenvolvedores

### Regra de Ouro:
**NUNCA escreva texto visível diretamente no JSX/TSX**

```typescript
// ❌ ERRADO
<button>Salvar</button>

// ✅ CORRETO
<button>{t('common.save')}</button>
```

### Organização de Chaves:
```
common.* - Textos reutilizáveis (save, cancel, etc.)
errors.* - Mensagens de erro
forms.* - Labels e validações
[page].* - Textos específicos de página
```

---

## 📞 Próximos Passos

1. **Implementar exemplo completo** (Quiz Report)
2. **Criar script de auditoria** para encontrar hardcoded texts
3. **Migrar gradualmente** outras páginas
4. **Adicionar CI check** para prevenir novos hardcoded texts
