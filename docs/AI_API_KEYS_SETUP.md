# 🤖 Configuração de API Keys para IA Gratuita

## Como obter API Keys gratuitas para análise de compatibilidade

### 1. 🚀 Groq (RECOMENDADO - Mais rápido e confiável)

**Por que usar:** Groq oferece modelos Llama extremamente rápidos e tem um tier gratuito generoso.

**Como obter:**
1. Acesse: https://console.groq.com/
2. Crie uma conta gratuita com seu email
3. Vá em "API Keys" no menu lateral
4. Clique em "Create API Key"
5. Copie a chave gerada

**Tier Gratuito:**
- 14,400 tokens por minuto
- Sem limite de requests por dia
- Modelos: Llama 3.1 8B, Mixtral 8x7B

**Configuração:**
```bash
# No arquivo .env.local
GROQ_API_KEY=gsk_sua_chave_aqui
```

---

### 2. 🔄 Together AI (Alternativa robusta)

**Por que usar:** Boa variedade de modelos open-source e tier gratuito decente.

**Como obter:**
1. Acesse: https://api.together.xyz/
2. Cadastre-se com GitHub ou email
3. Vá em "Settings" → "API Keys"
4. Clique em "Create new API key"
5. Copie a chave

**Tier Gratuito:**
- $5 em créditos gratuitos por mês
- Modelos: Llama 3.2, Code Llama, etc.

**Configuração:**
```bash
# No arquivo .env.local
TOGETHER_API_KEY=sua_chave_aqui
```

---

### 3. 🤗 Hugging Face (Backup/Alternativa)

**Por que usar:** Maior variedade de modelos, boa para experimentação.

**Como obter:**
1. Acesse: https://huggingface.co/
2. Crie uma conta
3. Vá em "Settings" → "Access Tokens"
4. Clique em "New token"
5. Escolha "Read" permissions
6. Copie o token

**Tier Gratuito:**
- Rate limit: 1000 requests por hora por modelo
- Centenas de modelos disponíveis

**Configuração:**
```bash
# No arquivo .env.local
HUGGINGFACE_API_KEY=hf_sua_chave_aqui
```

---

## 🚀 Configuração Rápida (Recomendada)

Para começar rapidamente, use apenas o **Groq**:

1. **Cadastre-se no Groq:** https://console.groq.com/
2. **Gere sua API key**
3. **Adicione no .env.local:**
   ```bash
   GROQ_API_KEY=gsk_sua_chave_aqui
   ```

---

## 🔧 Configuração Completa (Redundância)

Para máxima confiabilidade, configure todas as três:

```bash
# Arquivo: .env.local

# Groq (Primário - mais rápido)
GROQ_API_KEY=gsk_sua_chave_groq

# Together AI (Backup)
TOGETHER_API_KEY=sua_chave_together

# Hugging Face (Backup do backup)
HUGGINGFACE_API_KEY=hf_sua_chave_huggingface
```

---

## 🔍 Como o Sistema Escolhe a API

O sistema tem fallback automático:

1. **Primeiro tenta:** Groq (se GROQ_API_KEY existir)
2. **Se falhar:** Together AI (se TOGETHER_API_KEY existir)
3. **Se falhar:** Hugging Face (se HUGGINGFACE_API_KEY existir)
4. **Se tudo falhar:** Usa análise offline com templates

---

## 📊 Comparação de Serviços

| Serviço | Velocidade | Limite Gratuito | Qualidade | Facilidade |
|---------|-----------|-----------------|-----------|------------|
| Groq | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Together AI | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Hugging Face | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 Recomendação Final

**Para começar:** Use apenas Groq
**Para produção:** Configure Groq + Together AI como backup
**Para experimentação:** Configure todos os três

---

## 🔒 Segurança

- ✅ Nunca commite as API keys no git
- ✅ Use sempre arquivo .env.local
- ✅ Adicione .env.local no .gitignore
- ✅ Renove as keys periodicamente

---

## 🐛 Troubleshooting

**Erro de API key inválida:**
- Verifique se copiou a key completa
- Certifique-se que a key não expirou
- Teste a key em uma requisição simples

**Rate limit excedido:**
- O sistema automaticamente usa o próximo serviço
- Aguarde alguns minutos e tente novamente
- Considere usar múltiplas APIs

**Resposta em formato incorreto:**
- O sistema tem fallback para análise offline
- Verifique se o modelo suporta instruções JSON
- Tente com um modelo diferente