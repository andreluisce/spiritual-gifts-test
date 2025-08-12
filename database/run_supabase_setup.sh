#!/bin/bash

# =========================================================
# SETUP AUTOMATIZADO PARA SUPABASE
# Execute: ./run_supabase_setup.sh
# =========================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "========================================="
echo "🚀 SUPABASE SPIRITUAL GIFTS SETUP"
echo "========================================="
echo -e "${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não está instalado${NC}"
    echo "Instale com: npm install -g supabase"
    echo "Ou: brew install supabase/tap/supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Não está logado no Supabase${NC}"
    echo "Execute: supabase login"
    exit 1
fi

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Projeto não está linkado${NC}"
    echo "Execute: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo -e "${BLUE}Projeto linkado encontrado!${NC}"
echo ""

# Function to execute SQL file
execute_sql() {
    local file=$1
    local description=$2
    
    echo -e "${BLUE}📋 EXECUTANDO: ${description}${NC}"
    echo -e "${YELLOW}   Arquivo: ${file}${NC}"
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ ERRO: Arquivo $file não encontrado${NC}"
        exit 1
    fi
    
    if cat "$file" | supabase db sql; then
        echo -e "${GREEN}✅ SUCESSO: $description completado${NC}"
    else
        echo -e "${RED}❌ ERRO: Falha ao executar $file${NC}"
        exit 1
    fi
    echo ""
}

# Confirm execution
echo -e "${YELLOW}ATENÇÃO: Isto vai RESETAR completamente o banco de dados!${NC}"
read -p "Tem certeza? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Execução cancelada${NC}"
    exit 0
fi

echo ""

# Option 1: Reset database (clean slate)
echo -e "${BLUE}Opção 1: Reset completo do banco${NC}"
echo -e "${BLUE}Opção 2: Executar scripts individuais${NC}"
read -p "Escolha (1/2): " option

if [ "$option" = "1" ]; then
    echo -e "${BLUE}🔄 Resetando banco de dados...${NC}"
    supabase db reset
    echo -e "${GREEN}✅ Reset completo${NC}"
    echo ""
else
    echo -e "${BLUE}📋 Executando scripts individuais...${NC}"
    echo ""
    
    # Execute scripts in order
    execute_sql "00_FRESH_START_drop_and_recreate.sql" "PASSO 1: Fresh start (drop & recreate)"
fi

# Execute remaining scripts
execute_sql "01_CLEAN_complete_system.sql" "PASSO 2: Sistema base"
execute_sql "02_CLEAN_load_data.sql" "PASSO 3: Matriz de pesos"
execute_sql "03_CLEAN_load_questions.sql" "PASSO 4: 140 perguntas em português"
execute_sql "04_CLEAN_english_translations.sql" "PASSO 5: Traduções em inglês"
execute_sql "05_CLEAN_spanish_translations.sql" "PASSO 6: Traduções em espanhol"
execute_sql "enhanced_spiritual_gifts_schema.sql" "PASSO 7: Dados ricos multilíngues"
execute_sql "06_CLEAN_final_verification.sql" "PASSO 8: Verificação final"

# Success message
echo -e "${GREEN}"
echo "========================================="
echo "✅ SETUP SUPABASE CONCLUÍDO!"
echo "========================================="
echo -e "${NC}"

echo -e "${BLUE}🧪 Testando o sistema...${NC}"

# Test the system
supabase db sql --query "
SELECT 
  '🎉 STATUS DO SISTEMA' as status,
  NOW() as tempo_conclusao,
  (SELECT COUNT(*) FROM public.question_pool) as total_perguntas,
  (SELECT COUNT(DISTINCT locale) FROM public.question_translations) as idiomas_suportados,
  (SELECT COUNT(*) FROM public.decision_weights) as configuracoes_peso,
  (SELECT COUNT(*) FROM public.categories) as categorias_dados_ricos,
  (SELECT COUNT(*) FROM public.spiritual_gifts) as dons_com_dados_ricos,
  '✅ OPERACIONAL' as resultado_final;
"

echo ""
echo -e "${GREEN}🎉 Sistema Supabase pronto para uso!${NC}"
echo ""
echo -e "${BLUE}Comandos para testar:${NC}"
echo "  supabase db sql --query \"SELECT * FROM get_questions_by_locale('pt') LIMIT 5;\""
echo "  supabase db sql --query \"SELECT * FROM get_categories_by_locale('pt');\""
echo "  supabase db sql --query \"SELECT * FROM validate_multilingual_system();\""
echo ""

echo -e "${YELLOW}💡 Dashboard Supabase:${NC}"
echo "  https://app.supabase.com/project/$(cat .supabase/config.toml | grep project_id | cut -d'"' -f2)"