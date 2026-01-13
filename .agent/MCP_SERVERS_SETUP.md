# Configuração dos MCP Servers

Os seguintes MCP servers foram instalados globalmente:

## ✅ Instalados

1. **@supabase/mcp-server-supabase** - Integração com Supabase
2. **context7-mcp-server** - Documentação atualizada de frameworks

## 📝 Configuração

### Para Claude Desktop

Crie ou edite o arquivo `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "${NEXT_PUBLIC_SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "context7-mcp-server"
      ]
    }
  }
}
```

### Para Cursor/Cline

Crie ou edite o arquivo de configuração MCP do Cursor (geralmente em `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "${NEXT_PUBLIC_SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "context7-mcp-server"
      ]
    }
  }
}
```

## 🔑 Variáveis de Ambiente

### Supabase Server

O servidor Supabase precisa das seguintes variáveis (já estão no seu `.env.local`):

- `SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (chave de serviço com permissões administrativas)

**Importante**: Use a **Service Role Key**, não a Anon Key, para ter acesso completo às operações do banco.

### Context7 Server

Não requer configuração adicional. Funciona automaticamente para fornecer documentação atualizada de:
- Next.js
- React
- Supabase
- E muitos outros frameworks

## 🚀 Como Usar

Após configurar, reinicie o Claude Desktop ou Cursor. Os servidores MCP estarão disponíveis e você poderá:

### Com Supabase MCP:
- Consultar tabelas diretamente
- Executar queries SQL
- Gerenciar dados
- Gerar tipos TypeScript
- Acessar storage e edge functions

### Com Context7:
- Obter documentação atualizada durante o desenvolvimento
- Evitar informações desatualizadas ou "alucinações" da IA
- Ter exemplos de código específicos da versão que você está usando

## 🔧 Verificação

Para verificar se os servidores estão funcionando:

```bash
# Testar Supabase MCP
npx @supabase/mcp-server-supabase --help

# Testar Context7
npx context7-mcp-server --help
```

## 📚 Recursos

- [Supabase MCP Server](https://github.com/supabase/mcp-server)
- [Context7 MCP Server](https://github.com/context7/mcp-server)
- [Model Context Protocol](https://modelcontextprotocol.io/)
