# 🔧 Configuração Permanente do Supabase CLI

## ✅ SOLUÇÃO DEFINITIVA - Nunca Mais Ter Erro de Autenticação

### Problema Comum:
```
Initialising login role...
Invalid access token format. Must be like `sbp_0102...1920`.
```

### Solução Permanente:

O access token já está no arquivo `.env.local` do projeto. Para usar sempre:

#### 1. Adicionar ao seu `.zshrc` ou `.bashrc`:

```bash
# Abrir o arquivo de configuração do shell
nano ~/.zshrc  # ou ~/.bashrc se usar bash

# Adicionar esta linha no final:
export SUPABASE_ACCESS_TOKEN=sbp_6abad92ce0edd0173b360b34faa1e147893e3fd2

# Salvar (Ctrl+O, Enter, Ctrl+X)

# Recarregar o shell
source ~/.zshrc  # ou source ~/.bashrc
```

#### 2. Ou criar um alias para facilitar:

```bash
# Adicionar ao ~/.zshrc ou ~/.bashrc:
alias supabase-auth='export SUPABASE_ACCESS_TOKEN=sbp_6abad92ce0edd0173b360b34faa1e147893e3fd2'

# Depois, sempre que abrir um novo terminal, execute:
supabase-auth
```

#### 3. Ou usar um script helper:

Crie um arquivo `supabase-setup.sh` na raiz do projeto:

```bash
#!/bin/bash
# Source this file before running supabase commands
export SUPABASE_ACCESS_TOKEN=sbp_6abad92ce0edd0173b360b34faa1e147893e3fd2
export SUPABASE_PROJECT_ID=vttkurdzstlkybojigry
echo "✅ Supabase environment configured!"
```

Depois, sempre execute:
```bash
source ./supabase-setup.sh
supabase db push
```

### Verificar se está funcionando:

```bash
# Deve listar seus projetos sem erro
supabase projects list
```

## 🚀 Aplicar Migrations

### Método Rápido (Com Token Configurado):

```bash
# Se adicionou ao .zshrc/.bashrc:
supabase db push

# Se usa o script helper:
source ./supabase-setup.sh && supabase db push

# Se prefere inline:
export SUPABASE_ACCESS_TOKEN=sbp_6abad92ce0edd0173b360b34faa1e147893e3fd2 && supabase db push
```

## ✅ Migration Aplicada com Sucesso!

A migration `20260115125500_add_spanish_gift_pair_insights.sql` foi aplicada com sucesso no Supabase Cloud!

### O que foi adicionado:
- ✅ 14 combinações de dons em espanhol
- ✅ Dados completos com sinergias, fortalezas, riscos e exemplos
- ✅ Pronto para uso na interface em espanhol

### Verificar no Dashboard:

1. Acesse: https://app.supabase.com/project/vttkurdzstlkybojigry
2. Vá em **Table Editor** → `gift_pair_insights`
3. Filtre por `language = 'es'`
4. Deve ver 14 registros em espanhol

## 📝 Comandos Úteis

```bash
# Listar projetos
supabase projects list

# Ver status do projeto
supabase status

# Aplicar migrations
supabase db push

# Ver migrations aplicadas
supabase migration list

# Fazer dump do banco
supabase db dump -f backup.sql
```

## 🎯 Resumo

**NUNCA MAIS** você terá erro de autenticação se:

1. ✅ Adicionar o token ao `.zshrc`/`.bashrc` (RECOMENDADO)
2. ✅ Ou usar o script helper antes de cada comando
3. ✅ Ou usar inline: `export SUPABASE_ACCESS_TOKEN=... && supabase ...`

**Token do Projeto**: `sbp_6abad92ce0edd0173b360b34faa1e147893e3fd2`
**Project ID**: `vttkurdzstlkybojigry`
**URL**: `https://vttkurdzstlkybojigry.supabase.co`
