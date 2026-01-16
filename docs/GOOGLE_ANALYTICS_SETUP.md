# 📊 Google Analytics 4 - Guia de Configuração e Uso

## 🚀 Configuração Inicial

### 1. Criar Conta no Google Analytics

1. Acesse: https://analytics.google.com
2. Clique em "Começar a medir"
3. Crie uma conta e propriedade
4. Selecione **Google Analytics 4** (GA4)
5. Copie o **Measurement ID** (formato: `G-XXXXXXXXXX`)

### 2. Configurar Variável de Ambiente

Adicione ao arquivo `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Importante:**
- Use `NEXT_PUBLIC_` para expor a variável no client-side
- Substitua `G-XXXXXXXXXX` pelo seu Measurement ID real

### 3. Verificar Instalação

1. Inicie o servidor: `pnpm dev`
2. Abra o app no navegador
3. Abra DevTools → Console
4. Procure por mensagens do `gtag`
5. Ou use a extensão: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/)

---

## 📈 Tracking Automático

### Page Views

✅ **Já configurado!** Todas as mudanças de rota são rastreadas automaticamente.

```typescript
// Automático via AnalyticsProvider
// Não precisa fazer nada!
```

---

## 🎯 Eventos Personalizados

### 1. Quiz Events

```typescript
import { trackQuizEvent } from '@/lib/analytics'

// Quando usuário inicia o quiz
trackQuizEvent('start', {
  step: 'introduction',
  progress: 0
})

// Quando completa uma seção
trackQuizEvent('complete', {
  step: 'motivations',
  progress: 33
})

// Quando abandona
trackQuizEvent('abandon', {
  step: 'ministries',
  progress: 50
})
```

### 2. Gift View Tracking

```typescript
import { trackGiftView } from '@/lib/analytics'

// Quando usuário visualiza uma página de dom
trackGiftView('service', 'Serviço')
```

### 3. Social Sharing

```typescript
import { trackResultShare } from '@/lib/analytics'

// Quando usuário compartilha resultado
trackResultShare('whatsapp')
trackResultShare('facebook')
trackResultShare('instagram')
trackResultShare('email')
```

### 4. User Engagement

```typescript
import { trackUserEngagement } from '@/lib/analytics'

// Quando usuário interage com conteúdo
trackUserEngagement('read_article', 'qualities_of_service')
trackUserEngagement('watch_video', 'introduction_video')
trackUserEngagement('download_pdf', 'results_report')
```

### 5. Authentication

```typescript
import { trackAuth } from '@/lib/analytics'

// Quando usuário faz login
trackAuth('google', user.id)
trackAuth('magic_link', user.id)
```

### 6. Error Tracking

```typescript
import { trackError } from '@/lib/analytics'

try {
  // código que pode falhar
} catch (error) {
  trackError(error.message, false) // não fatal
}

// Erro fatal
trackError('Critical database error', true)
```

---

## 🎨 Exemplos de Uso em Componentes

### Exemplo 1: Página de Quiz

```typescript
'use client'

import { useEffect } from 'react'
import { trackQuizEvent } from '@/lib/analytics'

export function QuizPage() {
  useEffect(() => {
    // Rastrear início do quiz
    trackQuizEvent('start', {
      step: 'introduction',
      progress: 0
    })
  }, [])

  const handleComplete = () => {
    trackQuizEvent('complete', {
      step: 'final',
      progress: 100
    })
    // ... resto da lógica
  }

  return (
    // ... seu componente
  )
}
```

### Exemplo 2: Botão de Compartilhamento

```typescript
'use client'

import { trackResultShare } from '@/lib/analytics'

export function ShareButton({ platform }: { platform: string }) {
  const handleShare = () => {
    // Rastrear compartilhamento
    trackResultShare(platform)

    // Lógica de compartilhamento
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
    }
  }

  return (
    <button onClick={handleShare}>
      Compartilhar no {platform}
    </button>
  )
}
```

### Exemplo 3: Página de Dom Individual

```typescript
'use client'

import { useEffect } from 'react'
import { trackGiftView } from '@/lib/analytics'

export function GiftDetailPage({ gift }: { gift: Gift }) {
  useEffect(() => {
    // Rastrear visualização do dom
    trackGiftView(gift.gift_key, gift.name)
  }, [gift])

  return (
    // ... seu componente
  )
}
```

---

## 📊 Eventos Recomendados para Gamificação

### Achievement Unlocked

```typescript
import { event } from '@/lib/analytics'

export const trackAchievement = (achievementName: string, level: number) => {
  event({
    action: 'unlock_achievement',
    category: 'Gamification',
    label: achievementName,
    value: level
  })
}

// Uso
trackAchievement('Primeiro Passo', 1)
trackAchievement('Mestre dos Dons', 5)
```

### Level Up

```typescript
export const trackLevelUp = (newLevel: number, xp: number) => {
  event({
    action: 'level_up',
    category: 'Gamification',
    label: `Level ${newLevel}`,
    value: xp
  })
}

// Uso
trackLevelUp(3, 580)
```

### Challenge Completed

```typescript
export const trackChallengeComplete = (challengeName: string, quality: string) => {
  event({
    action: 'complete_challenge',
    category: 'Development',
    label: `${quality} - ${challengeName}`,
    value: 1
  })
}

// Uso
trackChallengeComplete('Serviço Anônimo', 'Humildade')
```

### Streak Milestone

```typescript
export const trackStreak = (days: number) => {
  event({
    action: 'streak_milestone',
    category: 'Engagement',
    label: `${days} days`,
    value: days
  })
}

// Uso
trackStreak(7)  // 7 dias consecutivos
trackStreak(30) // 30 dias consecutivos
```

---

## 🔍 Visualizando Dados no GA4

### 1. Tempo Real

- Acesse: **Relatórios → Tempo real**
- Veja usuários ativos agora
- Eventos acontecendo em tempo real

### 2. Eventos

- Acesse: **Relatórios → Engajamento → Eventos**
- Veja todos os eventos personalizados
- Analise frequência e valores

### 3. Conversões

Configure eventos importantes como conversões:

1. Acesse: **Configurar → Eventos**
2. Marque eventos como conversão:
   - `complete_quiz`
   - `unlock_achievement`
   - `share`

### 4. Públicos

Crie públicos personalizados:

- Usuários que completaram quiz
- Usuários com streak > 7 dias
- Usuários que compartilharam

---

## 🎯 Métricas Importantes para Acompanhar

### Engajamento

- **Usuários ativos** (DAU, WAU, MAU)
- **Tempo médio de sessão**
- **Taxa de rejeição**
- **Páginas por sessão**

### Quiz

- **Taxa de início** (visitantes que iniciam)
- **Taxa de conclusão** (iniciam vs completam)
- **Taxa de abandono** (em qual etapa)
- **Tempo médio para completar**

### Gamificação

- **Achievements desbloqueados**
- **Níveis alcançados**
- **Streaks médios**
- **Desafios completados**

### Social

- **Compartilhamentos por plataforma**
- **Taxa de compartilhamento** (% dos usuários)
- **Viralidade** (novos usuários por compartilhamento)

---

## 🔒 Privacidade e LGPD

### Configurações de Privacidade

O Google Analytics já está configurado com:

✅ **IP Anonymization** - IPs são anonimizados
✅ **Cookie Flags** - SameSite=None;Secure
✅ **Apenas em Produção** - Não rastreia em desenvolvimento

### Política de Privacidade

Adicione ao seu site:

```markdown
## Uso de Cookies e Analytics

Utilizamos o Google Analytics para entender como os visitantes
usam nosso site. Os dados coletados são anônimos e usados apenas
para melhorar a experiência do usuário.

Você pode optar por não ser rastreado usando extensões de
navegador ou configurações do Google Analytics.
```

### Opt-Out (Opcional)

Se quiser permitir que usuários desativem o tracking:

```typescript
// Adicionar botão de opt-out
export function OptOutButton() {
  const handleOptOut = () => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true
    alert('Google Analytics desativado')
  }

  return <button onClick={handleOptOut}>Desativar Analytics</button>
}
```

---

## 🐛 Troubleshooting

### Analytics não está funcionando

1. **Verificar Measurement ID**
   ```bash
   echo $NEXT_PUBLIC_GA_MEASUREMENT_ID
   ```

2. **Verificar se está em produção**
   - Analytics só funciona em `NODE_ENV=production`
   - Para testar localmente: `pnpm build && pnpm start`

3. **Verificar console do navegador**
   - Procure por erros do `gtag`
   - Use Google Analytics Debugger

4. **Verificar bloqueadores de anúncios**
   - Desative AdBlock/uBlock temporariamente
   - Alguns bloqueadores impedem GA

### Eventos não aparecem no GA4

1. **Aguarde 24-48h** - Dados podem demorar
2. **Use Tempo Real** - Para ver eventos imediatamente
3. **Verifique nome dos eventos** - Devem ser snake_case
4. **Limite de eventos** - GA4 tem limite de 500 eventos distintos

---

## 📚 Recursos Adicionais

- [Documentação GA4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)

---

## ✅ Checklist de Implementação

- [x] Criar conta no Google Analytics
- [x] Copiar Measurement ID
- [ ] Adicionar `NEXT_PUBLIC_GA_MEASUREMENT_ID` ao `.env.local`
- [ ] Adicionar ao `.env.production` (Vercel/produção)
- [x] Componentes instalados
- [x] Tracking automático configurado
- [ ] Testar em produção
- [ ] Configurar eventos personalizados
- [ ] Adicionar política de privacidade
- [ ] Monitorar métricas no GA4

---

## 🎉 Pronto!

Seu Google Analytics está configurado e pronto para uso!

**Próximos passos:**
1. Adicione o Measurement ID ao `.env.local`
2. Teste em produção
3. Comece a adicionar eventos personalizados
4. Monitore as métricas no GA4 Dashboard
