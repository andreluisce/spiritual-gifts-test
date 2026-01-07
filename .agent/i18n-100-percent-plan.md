# 🎯 Plano para 100% i18n com next-intl

## Objetivo
Garantir que **TODOS** os textos visíveis ao usuário estejam usando `next-intl` para internacionalização.

## Status Atual
- ✅ Infraestrutura i18n completa
- ✅ Quiz Report Page - 100% i18n
- ✅ Admin section pt.json - Textos traduzidos
- ⏳ Implementação nos componentes - 5%

## Estratégia de Execução

### Fase 1: Páginas Admin (PRIORIDADE MÁXIMA)
1. ✅ `/admin/quiz-report/[sessionId]` - COMPLETO
2. ⏳ `/admin/page.tsx` - Dashboard principal
3. ⏳ `/admin/users/page.tsx` - Gerenciamento de usuários
4. ⏳ `/admin/analytics/*` - Todas as páginas de analytics
5. ⏳ `/admin/settings/*` - Todas as páginas de configurações
6. ⏳ `/admin/content/page.tsx` - Gerenciamento de conteúdo

### Fase 2: Componentes Compartilhados
7. ⏳ Componentes de navegação
8. ⏳ Componentes de formulário
9. ⏳ Mensagens de erro
10. ⏳ Tooltips e placeholders

### Fase 3: Páginas Públicas
11. ⏳ Home page
12. ⏳ Quiz pages
13. ⏳ Results pages
14. ⏳ Profile pages

## Checklist de Implementação por Arquivo

### Admin Dashboard (`/admin/page.tsx`)
- [ ] Importar `useTranslations`
- [ ] Substituir "Total Users" → `t('admin.dashboard.stats.totalUsers')`
- [ ] Substituir "Total Quizzes" → `t('admin.dashboard.stats.totalQuizzes')`
- [ ] Substituir "Recent Activity" → `t('admin.dashboard.recentActivity.title')`
- [ ] Substituir "Top Gifts" → `t('admin.dashboard.topGifts.title')`
- [ ] Testar funcionamento

### Admin Users (`/admin/users/page.tsx`)
- [ ] Importar `useTranslations`
- [ ] Substituir todos os placeholders
- [ ] Substituir labels de formulário
- [ ] Substituir mensagens de confirmação
- [ ] Testar funcionamento

### Admin Analytics (Todas as páginas)
- [ ] `/admin/analytics/page.tsx`
- [ ] `/admin/analytics/overview/page.tsx`
- [ ] `/admin/analytics/spiritual-gifts/page.tsx`
- [ ] `/admin/analytics/demographics/page.tsx`
- [ ] `/admin/analytics/reports/page.tsx`
- [ ] `/admin/analytics/ai/page.tsx`

### Admin Settings (Todas as páginas)
- [ ] `/admin/settings/page.tsx`
- [ ] `/admin/settings/general/page.tsx`
- [ ] `/admin/settings/ai/page.tsx`
- [ ] `/admin/settings/email/page.tsx`

### Admin Content
- [ ] `/admin/content/page.tsx`

## Padrão de Implementação

```typescript
// 1. Adicionar import
import { useTranslations } from 'next-intl'

// 2. Criar hook
const t = useTranslations('sectionName')

// 3. Substituir textos
// ANTES: <h1>Admin Dashboard</h1>
// DEPOIS: <h1>{t('title')}</h1>

// 4. Para textos com variáveis
// ANTES: <p>Total: {count} users</p>
// DEPOIS: <p>{t('totalUsers', { count })}</p>
```

## Estimativa de Tempo

| Fase | Arquivos | Tempo Estimado |
|------|----------|----------------|
| Fase 1 | 15 arquivos | 4-6 horas |
| Fase 2 | 10 arquivos | 2-3 horas |
| Fase 3 | 10 arquivos | 2-3 horas |
| **TOTAL** | **35 arquivos** | **8-12 horas** |

## Progresso

- [x] Infraestrutura (100%)
- [x] Traduções pt.json (90%)
- [ ] Implementação nos componentes (5%)
- [ ] Traduções en.json (0%)
- [ ] Traduções es.json (0%)

## Próximos Passos Imediatos

1. ✅ Traduzir admin section no pt.json
2. ⏳ Implementar i18n em `/admin/page.tsx`
3. ⏳ Implementar i18n em `/admin/users/page.tsx`
4. ⏳ Implementar i18n em todas as páginas de analytics
5. ⏳ Implementar i18n em todas as páginas de settings

## Meta Final
🎯 **100% dos textos usando next-intl** até o final do dia
