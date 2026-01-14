# 🌐 Aplicar Traduções em Espanhol no Supabase

## Opção 1: Usando o Script Automático (Recomendado)

```bash
# 1. Fazer login no Supabase (se ainda não estiver logado)
supabase login

# 2. Executar o script
./apply-spanish-migration.sh
```

## Opção 2: Aplicar Manualmente via CLI

```bash
# 1. Fazer login
supabase login

# 2. Verificar se está linkado ao projeto
supabase status

# 3. Aplicar todas as migrations pendentes
supabase db push
```

## Opção 3: Aplicar Diretamente via SQL Editor

1. Acesse: https://app.supabase.com
2. Abra seu projeto
3. Vá em **SQL Editor**
4. Copie e cole o conteúdo de: `supabase/migrations/20260115125500_add_spanish_gift_pair_insights.sql`
5. Clique em **Run**

## Verificar se Funcionou

Após aplicar, execute no SQL Editor:

```sql
-- Verificar quantos insights em espanhol foram adicionados
SELECT COUNT(*) as spanish_insights
FROM gift_pair_insights
WHERE language = 'es';

-- Deve retornar: 14

-- Ver alguns exemplos
SELECT gift_a, gift_b, summary
FROM gift_pair_insights
WHERE language = 'es'
LIMIT 3;
```

## O que foi Adicionado?

✅ 14 combinações de dons em espanhol:
- Serviço + Exortação
- Serviço + Ensino
- Profecia + Exortação
- Profecia + Ensino
- Ensino + Exortação
- Ensino + Liderança
- Exortação + Contribuição
- Exortação + Misericórdia
- Contribuição + Liderança
- Contribuição + Misericórdia
- Liderança + Misericórdia
- Liderança + Profecia
- Misericórdia + Profecia
- Misericórdia + Serviço

Cada combinação inclui:
- 📊 Pontuação de sinergia
- 📝 Resumo da combinação
- ✅ Áreas de fortaleza
- ⚠️ Riscos potenciais
- 💡 Estratégias de mitigação
- 🎯 Exemplos práticos

## Próximos Passos

Após aplicar a migration:

1. ✅ Fazer deploy do código atualizado
2. ✅ Testar a interface em espanhol
3. ✅ Verificar se os dados aparecem corretamente
4. ✅ Confirmar que a análise de IA usa o idioma correto

## Troubleshooting

### ⚠️ ERRO: "Invalid access token format. Must be like `sbp_0102...1920`"

Este é um erro comum quando o Supabase CLI não está autenticado corretamente. Siga estes passos:

#### Solução Completa:

```bash
# 1. Fazer logout completo
supabase logout

# 2. Limpar cache de autenticação (se necessário)
rm -rf ~/.supabase

# 3. Fazer login novamente
supabase login
```

Quando executar `supabase login`, uma página do navegador será aberta automaticamente. Siga os passos:

1. ✅ Faça login na sua conta Supabase
2. ✅ Autorize o acesso do CLI
3. ✅ Copie o **Access Token** que aparece na página
4. ✅ Cole o token no terminal quando solicitado

**IMPORTANTE**: O token deve começar com `sbp_` e ter o formato: `sbp_0102...1920`

#### Verificar se funcionou:

```bash
# Listar seus projetos
supabase projects list

# Se aparecer a lista de projetos, está funcionando! ✅
```

#### Se ainda não funcionar:

1. **Verifique se o token está correto**:
   - Deve começar com `sbp_`
   - Não deve ter espaços extras
   - Copie novamente do navegador

2. **Tente gerar um novo token**:
   - Vá em: https://app.supabase.com/account/tokens
   - Clique em "Generate new token"
   - Dê um nome (ex: "CLI Access")
   - Copie o token e use no login

3. **Use o token diretamente**:
   ```bash
   export SUPABASE_ACCESS_TOKEN="seu_token_aqui"
   supabase projects list
   ```

---

### Erro de autenticação (outros casos)
```bash
supabase logout
supabase login
```

### Projeto não linkado
```bash
# Obter PROJECT_REF do dashboard: Settings → General
supabase link --project-ref YOUR_PROJECT_REF
```

### Ver logs de erro
```bash
supabase db logs
```
