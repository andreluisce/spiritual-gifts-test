# 🌍 Textos Hardcoded para Extrair - Quiz Report Page

## Arquivo: `/src/app/[locale]/admin/quiz-report/[sessionId]/page.tsx`

### Textos Encontrados:

```typescript
// Loading state
"Carregando relatório..."

// Error state
"Erro ao carregar relatório"
"Voltar"

// Header
"Imprimir / Salvar PDF"
"Relatório Completo - Teste de Dons Espirituais"

// Session Info
"Usuário:"
"Data:"
"Duração: {duration} minutos"

// Spiritual Gifts Section
"Dons Espirituais Descobertos"
"Primário"
"Secundário"
"Presente"

// AI Insights Section
"Insights e Orientações"
"Descrição:"
"Fundamento Bíblico:"
"Aplicações Práticas:"
"No description available"
"No biblical foundation available"
"No practical applications available"

// Questions Section
"Perguntas e Respostas ({count} perguntas)"
"Resposta:"
"Question text not available"

// Footer
"Relatório gerado em {date}"
"Teste de Dons Espirituais - Descubra Seu Dom"
```

## Estrutura de Tradução Sugerida:

```json
{
  "admin": {
    "quizReport": {
      "loading": "Carregando relatório...",
      "error": "Erro ao carregar relatório",
      "back": "Voltar",
      "print": "Imprimir / Salvar PDF",
      "title": "Relatório Completo - Teste de Dons Espirituais",
      "sessionInfo": {
        "user": "Usuário:",
        "date": "Data:",
        "duration": "Duração: {duration} minutos"
      },
      "spiritualGifts": {
        "title": "Dons Espirituais Descobertos",
        "strength": {
          "primary": "Primário",
          "secondary": "Secundário",
          "present": "Presente"
        }
      },
      "aiInsights": {
        "title": "Insights e Orientações",
        "description": "Descrição:",
        "biblicalFoundation": "Fundamento Bíblico:",
        "practicalApplications": "Aplicações Práticas:",
        "noDescription": "Descrição não disponível",
        "noBiblicalFoundation": "Fundamento bíblico não disponível",
        "noPracticalApplications": "Aplicações práticas não disponíveis"
      },
      "questions": {
        "title": "Perguntas e Respostas ({count} perguntas)",
        "answer": "Resposta:",
        "noText": "Texto da pergunta não disponível"
      },
      "footer": {
        "generated": "Relatório gerado em {date}",
        "subtitle": "Teste de Dons Espirituais - Descubra Seu Dom"
      }
    }
  }
}
```

## Próximos Passos:

1. ✅ Identificar todos os textos hardcoded
2. ⏳ Adicionar ao pt.json, en.json, es.json
3. ⏳ Substituir no código por useTranslations()
4. ⏳ Testar em todos os idiomas
