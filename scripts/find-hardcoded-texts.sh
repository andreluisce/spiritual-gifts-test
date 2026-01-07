#!/bin/bash

# Script para encontrar textos hardcoded em português no código
# Procura por strings em português que deveriam estar em arquivos de tradução

echo "🔍 Procurando textos hardcoded em português..."
echo ""

# Procurar por strings em português em arquivos TSX/TS
# Padrões comuns: "Texto em português", 'Texto em português', >Texto em português<

echo "📁 Arquivos com possíveis textos hardcoded:"
echo "============================================"

# Buscar strings entre aspas duplas com acentuação ou palavras em português
rg -t tsx -t ts -t jsx -t js \
  -e '"[A-ZÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ][a-zàáâãäåèéêëìíîïòóôõöùúûüç\s]+' \
  -e "'[A-ZÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ][a-zàáâãäåèéêëìíîïòóôõöùúûüç\s]+'" \
  --no-heading \
  --line-number \
  --color never \
  src/ \
  | grep -v "node_modules" \
  | grep -v ".next" \
  | grep -v "className" \
  | grep -v "import" \
  | grep -v "//" \
  | head -100

echo ""
echo "✅ Análise completa!"
echo ""
echo "💡 Próximos passos:"
echo "1. Adicionar textos ao pt.json, en.json, es.json"
echo "2. Substituir por useTranslations()"
echo "3. Testar em todos os idiomas"
