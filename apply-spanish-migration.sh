#!/bin/bash

# Script para aplicar a migration de dados em espanhol no Supabase Cloud
# Execute este script após fazer login no Supabase CLI

echo "🚀 Aplicando migration de dados em espanhol..."
echo ""

# Verificar se está logado
if ! supabase projects list &>/dev/null; then
    echo "❌ Você precisa fazer login primeiro:"
    echo "   supabase login"
    exit 1
fi

# Verificar se o projeto está linkado
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Projeto não está linkado. Execute:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✅ Supabase CLI configurado corretamente"
echo ""

# Aplicar a migration
echo "📝 Aplicando migration: 20260115125500_add_spanish_gift_pair_insights.sql"
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration aplicada com sucesso!"
    echo ""
    echo "🔍 Verificando dados em espanhol..."
    supabase db sql --query "SELECT COUNT(*) as spanish_insights FROM gift_pair_insights WHERE language = 'es';"
    echo ""
    echo "✨ Pronto! Os dados em espanhol foram adicionados ao banco."
else
    echo ""
    echo "❌ Erro ao aplicar migration. Verifique os logs acima."
    exit 1
fi
