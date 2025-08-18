# 📚 Documentação do Spiritual Gifts Test

Bem-vindo à documentação completa do projeto Spiritual Gifts Test. Esta documentação está organizada para fornecer informações detalhadas sobre todos os aspectos do sistema.

## 📋 Índice Geral

### 🔧 Setup e Configuração
- [Setup de Desenvolvimento](setup/development.md) - Configuração do ambiente local
- [Deploy em Produção](setup/production.md) - Guia para deploy e produção
- [Variáveis de Ambiente](setup/environment.md) - Configuração de environment variables

### 🏗️ Arquitetura do Sistema
- [Visão Geral](architecture/overview.md) - Arquitetura geral do sistema
- [Documentação da API](architecture/api.md) - Endpoints e funcionalidades da API
- [Schema do Banco de Dados](architecture/database.md) - Estrutura e relacionamentos
- [Segurança e RLS](architecture/security.md) - Políticas de segurança

### 📖 Guias de Uso
- [Painel Administrativo](guides/admin.md) - Como usar o painel admin
- [Sistema de Quiz](guides/quiz.md) - Funcionamento do quiz de dons
- [Internacionalização](guides/i18n.md) - Sistema multilíngue
- [Analytics e Relatórios](guides/analytics.md) - Dashboard e métricas

### 🔧 Manutenção
- [Scripts de Banco](maintenance/database.md) - Gerenciamento do banco de dados
- [Monitoramento](maintenance/monitoring.md) - Logs e métricas
- [Backup e Restore](maintenance/backup.md) - Procedimentos de backup

## 🚀 Início Rápido

Se você é novo no projeto, recomendamos seguir esta ordem:

1. **[Setup de Desenvolvimento](setup/development.md)** - Configure seu ambiente
2. **[Visão Geral da Arquitetura](architecture/overview.md)** - Entenda a estrutura
3. **[Schema do Banco](architecture/database.md)** - Compreenda os dados
4. **[Sistema de Quiz](guides/quiz.md)** - Funcionalidade principal
5. **[Painel Admin](guides/admin.md)** - Gestão do sistema

## 🎯 Funcionalidades Principais

### Sistema de Quiz
O coração da aplicação é um questionário de 140 perguntas que avalia:
- **7 Dons Motivacionais** (Romanos 12:6-8)
- **5 Dons Ministeriais** (Efésios 4:11-12) 
- **11 Dons de Manifestação** (1 Coríntios 12:8-10)

### Painel Administrativo
Interface completa para:
- Gestão de usuários e perfis
- Configuração do sistema
- Analytics e relatórios
- Gerenciamento de conteúdo
- Audit logs e monitoramento

### Sistema Multilíngue
Suporte nativo para:
- 🇧🇷 **Português** (padrão)
- 🇺🇸 **Inglês**
- 🇪🇸 **Espanhol**

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes
- **next-intl** - Internacionalização

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança
- **OpenAI API** - Análise de IA
- **Resend** - Email service

## 🔒 Segurança

O sistema implementa múltiplas camadas de segurança:

### Autenticação
- Supabase Auth com JWT tokens
- Políticas de senha robustas
- Rate limiting em endpoints críticos

### Autorização
- Row Level Security (RLS) no PostgreSQL
- Políticas granulares por tabela
- Separação clara entre usuários e admins

### Proteção de Dados
- Validação server-side em todas as APIs
- Sanitização de inputs
- HTTPS obrigatório em produção

## 📊 Monitoramento e Analytics

### Métricas do Sistema
- Performance de queries
- Tempo de resposta das APIs
- Uso de recursos

### Analytics de Usuário
- Conversão do funil de quiz
- Engagement e retenção
- Distribuição demográfica
- Padrões de uso

### Relatórios Administrativos
- Estatísticas de usuários
- Análise de resultados
- Métricas de conteúdo
- Audit trails

## 🤝 Contribuindo

Para contribuir com a documentação:

1. **Identifique** uma área que precisa de melhoria
2. **Crie** uma branch específica para documentação
3. **Edite** os arquivos Markdown relevantes
4. **Teste** os links e exemplos
5. **Submeta** um Pull Request

### Padrões de Documentação

- **Linguagem clara** e objetiva
- **Exemplos práticos** sempre que possível
- **Screenshots** para interfaces complexas
- **Links internos** para navegação
- **Código formatado** com syntax highlighting

## 📞 Suporte

### Para Desenvolvedores
- **Issues no GitHub** - Bugs e feature requests
- **Discussions** - Perguntas e discussões
- **Email** - Contato direto com mantenedores

### Para Usuários
- **FAQ** integrado na aplicação
- **Tutoriais** em vídeo
- **Suporte por email**

## 🎯 Roadmap da Documentação

### Em Desenvolvimento
- [ ] Guias de troubleshooting
- [ ] Tutoriais em vídeo
- [ ] Documentação de APIs externas
- [ ] Casos de uso avançados

### Planejado
- [ ] Documentação em inglês
- [ ] Arquitetura mobile (PWA)
- [ ] Integração com terceiros
- [ ] Performance guidelines

---

## 📖 Navegação Rápida

| Categoria | Descrição | Status |
|-----------|-----------|--------|
| [Setup](setup/) | Configuração e instalação | ✅ Completo |
| [Arquitetura](architecture/) | Design do sistema | ✅ Completo |
| [Guias](guides/) | Como usar o sistema | 🔄 Em progresso |
| [Manutenção](maintenance/) | Operação e monitoramento | 📅 Planejado |

---

> *"A sabedoria é a coisa principal; adquire, pois, a sabedoria, e com toda a tua possessão adquire o entendimento."* - Provérbios 4:7

**💡 Sugestões ou melhorias? Abra uma issue ou pull request!**