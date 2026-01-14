# 🔐 Configuração do Magic Link - Guia Completo

## ✅ O que foi implementado:

1. **Frontend** - Formulário de login com Magic Link ✅
2. **Template de Email** - Email bonito e profissional ✅
3. **Callback Handler** - Já existe em `/auth/callback` ✅

## 🚀 Configuração no Supabase Dashboard (5 minutos):

### Passo 1: Ativar Email Provider

1. Acesse: `https://supabase.com/dashboard/project/[seu-projeto]/auth/providers`
2. Clique em **Email**
3. Configure:
   - ✅ **Enable Email provider**: ON
   - ✅ **Confirm email**: OFF (para Magic Link não precisar confirmar)
   - ✅ **Secure email change**: ON

### Passo 2: Configurar Template de Email

1. Vá em: `https://supabase.com/dashboard/project/[seu-projeto]/auth/templates`
2. Clique em **Magic Link**
3. Cole o template do arquivo: `supabase/templates/magic_link_email.html`
4. **Subject**: `Seu link de acesso - Descubra seu Dom`
5. Clique em **Save**

### Passo 3: Configurar URLs de Redirect

1. Vá em: `https://supabase.com/dashboard/project/[seu-projeto]/auth/url-configuration`
2. Configure:
   - **Site URL**: `https://descubraseudom.online`
   - **Redirect URLs**: Adicione:
     ```
     http://localhost:3000/auth/callback
     https://descubraseudom.online/auth/callback
     https://descubraseudom.online/*
     ```

### Passo 4: (Opcional) Configurar SMTP Customizado

**Para usar SMTP do Supabase (Grátis):**
- Não precisa fazer nada! Já está ativo.

**Para usar Resend (Profissional):**
1. Vá em: `Settings → Auth → SMTP Settings`
2. Configure:
   ```
   Host: smtp.resend.com
   Port: 587
   User: resend
   Password: [sua_resend_api_key]
   Sender email: noreply@descubraseudom.online
   Sender name: Descubra seu Dom
   ```

## 🎯 Como Testar:

1. Acesse: `http://localhost:3000/pt/login`
2. Clique em **"Entrar com Email"**
3. Digite seu email
4. Clique em **"Enviar Link Mágico"**
5. Verifique seu email
6. Clique no link
7. Você será redirecionado e estará logado! ✅

## 📧 Exemplo de Email que o usuário receberá:

```
Assunto: Seu link de acesso - Descubra seu Dom

[Email bonito com gradiente roxo/azul]
🎁 Descubra seu Dom

Seu link de acesso está pronto!

Olá! 👋

Clique no botão abaixo para acessar sua conta:

[✨ Acessar Minha Conta]

ℹ️ Informações importantes:
• Este link é válido por 1 hora
• Após clicar, você ficará conectado por 30 dias
• Você pode usar este link apenas uma vez
```

## 🔧 Troubleshooting:

### Email não chega?
1. Verifique spam/lixo eletrônico
2. Aguarde até 5 minutos
3. Verifique se o Email Provider está ativado no Supabase

### Link não funciona?
1. Verifique se as Redirect URLs estão configuradas
2. Certifique-se que o link não expirou (1 hora)
3. Tente solicitar um novo link

### Erro "Invalid redirect URL"?
1. Adicione a URL em: Auth → URL Configuration → Redirect URLs
2. Formato: `https://seu-dominio.com/auth/callback`

## 🎉 Pronto!

Agora seus usuários podem fazer login com:
- ✅ **Google OAuth** (já tinha)
- ✅ **Magic Link** (novo!)

Ambos têm a mesma experiência e duração de sessão (30 dias).

## 📊 Vantagens do Magic Link:

- ✅ Funciona com qualquer email
- ✅ Sem necessidade de senha
- ✅ Mais seguro (link expira)
- ✅ Experiência moderna
- ✅ Mesma sessão do Google (30 dias)
- ✅ GRÁTIS com SMTP do Supabase
