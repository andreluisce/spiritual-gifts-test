# 📧 Configurando o Resend para Emails Transacionais

Para que o sistema envie emails automáticos (boas-vindas, aprovação, resultados do quiz), precisamos configurar o serviço **Resend**.

## 1. Criar Conta e Chave de API

1. Acesse [resend.com](https://resend.com) e crie uma conta.
2. No dashboard, vá em **API Keys**.
3. Crie uma nova chave com permissão "Full Access" ou "Sending Access".
4. Copie a chave (começa com `re_`).

## 2. Verificar Domínio (Produção)

Para enviar emails para qualquer destinatário (não apenas seu próprio email), você precisa verificar um domínio.

1. Vá em **Domains** no dashboard do Resend.
2. Adicione seu domínio (ex: `espiritualismo.com.br`).
3. Adicione os registros DNS (DKIM, SPF, DMARC) no seu provedor de domínio (Cloudflare, GoDaddy, Registro.br, etc).
4. Aguarde a verificação (clique no link enviado por email ou use o link de teste: `http://localhost:3000/pt/auth/callback?code=06598fb3-918b-4408-922b-c3bb248c6f50`).

**Nota de Desenvolvimento:** Sem verificar domínio, você só pode enviar emails para o endereço de email cadastrado na sua conta Resend (ex: `andreluisce@gmail.com`).

## 3. Configurar Variáveis de Ambiente

No seu arquivo `.env.local` (local) e nas configurações da Vercel/Supabase (produção), adicione:

```env
# Chave de API do Resend
RESEND_API_KEY=re_123456789...

# Email de remetente (deve ser do domínio verificado ou onboarding@resend.dev para testes)
RESEND_FROM_EMAIL=nao-responda@seudominio.com

# URL do site para links nos emails
NEXT_PUBLIC_SITE_URL=https://seudominio.com
```

## 4. Testar Configuração

1. Acesse o painel admin: `/admin/settings/email`.
2. Verifique se o status está "Configurado".
3. Use a ferramenta de teste nessa página para enviar um email de teste.

## 5. Emails Automáticos Implementados

O sistema já está preparado para enviar:
- 📩 **Boas-vindas:** Ao se cadastrar (precisa ser ativado).
- ✅ **Aprovação:** Quando um manager aprova o usuário (precisa ser ativado na Server Action).
- 📊 **Resultados:** Quando o usuário termina o quiz.
- 🔔 **Notificações Admin:** Quando um novo usuário se cadastra ou completa o quiz.

---

**Status Atual:** O código do `EmailService` já está pronto em `src/lib/email.ts`. Falta apenas a configuração das variáveis de ambiente e a integração da Server Action de aprovação.
