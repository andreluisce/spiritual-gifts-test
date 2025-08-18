# 🌟 Spiritual Gifts Test

> Descubra seus dons espirituais através de uma avaliação bíblica completa e personalizada

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Sobre o Projeto

O **Spiritual Gifts Test** é uma aplicação web moderna que ajuda cristãos a identificar e compreender seus dons espirituais através de um questionário biblicamente fundamentado. A plataforma oferece resultados detalhados, análise de compatibilidade e orientações para o desenvolvimento ministerial.

### ✨ Características Principais

- 🌍 **Multilíngue**: Suporte completo para português, inglês e espanhol
- 📊 **Quiz Inteligente**: 140 perguntas estruturadas por categorias teológicas
- 🎯 **Resultados Detalhados**: Análise profunda dos 7 dons motivacionais + 16 dons ministeriais
- 👥 **Painel Administrativo**: Gestão completa de usuários, conteúdo e analytics
- 🔐 **Segurança Robusta**: Autenticação via Supabase com RLS (Row Level Security)
- 📱 **Responsivo**: Design otimizado para desktop, tablet e mobile
- 🤖 **IA Integrada**: Análise personalizada via OpenAI GPT
- 📈 **Analytics**: Dashboard completo com métricas e relatórios

### 🎯 Dons Espirituais Avaliados

#### Dons Motivacionais (Romanos 12:6-8)
- **Profecia** - Dom de proclamar a verdade de Deus
- **Ministério/Serviço** - Dom de servir e suprir necessidades
- **Ensino** - Dom de explicar e aplicar a Palavra
- **Exortação** - Dom de encorajar e aconselhar
- **Contribuição** - Dom de dar com generosidade
- **Liderança** - Dom de administrar e liderar
- **Misericórdia** - Dom de mostrar compaixão

#### Dons Ministeriais (Efésios 4:11-12)
- **Apóstolo** - Dom de plantar igrejas e estabelecer ministérios
- **Profeta** - Dom de revelar a vontade de Deus
- **Evangelista** - Dom de anunciar o Evangelho
- **Pastor** - Dom de cuidar e proteger o rebanho
- **Mestre** - Dom de ensinar com profundidade

#### Dons de Manifestação (1 Coríntios 12:8-10)
- **Sabedoria** - Dom de aplicar conhecimento divino
- **Conhecimento** - Dom de compreender verdades espirituais
- **Fé** - Dom de confiança sobrenatural
- **Cura** - Dom de restaurar saúde física/emocional
- **Milagres** - Dom de operar sinais sobrenaturais
- **Discernimento** - Dom de distinguir espíritos
- **Línguas** - Dom de comunicação sobrenatural
- **Interpretação** - Dom de traduzir línguas espirituais

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18.17+ 
- npm/yarn/pnpm
- Conta no Supabase
- OpenAI API Key (opcional - para análise de IA)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/spiritual-gifts-test.git
   cd spiritual-gifts-test
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` com suas credenciais:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   OPENAI_API_KEY=sua_chave_openai
   RESEND_API_KEY=sua_chave_resend
   ```

4. **Configure o banco de dados**
   ```bash
   cd database
   ./run_all_scripts.sh
   ```

5. **Execute o projeto**
   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── [locale]/       # Rotas internacionalizadas
│   │   ├── api/            # API Routes
│   │   └── globals.css     # Estilos globais
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base (shadcn/ui)
│   │   └── ...            # Componentes específicos
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # Utilitários e configurações
│   ├── i18n/              # Internacionalização
│   └── context/           # React Context providers
├── database/              # Scripts SQL e migrações
├── docs/                  # Documentação detalhada
├── public/                # Assets estáticos
└── supabase/              # Configurações Supabase
```

## 🌐 Internacionalização

O projeto suporta múltiplos idiomas através do `next-intl`:

- **🇧🇷 Português** (padrão)
- **🇺🇸 Inglês** 
- **🇪🇸 Espanhol**

Arquivos de tradução em `src/i18n/messages/`

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes
- **Lucide React** - Ícones
- **next-intl** - Internacionalização

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **OpenAI API** - Análise de IA
- **Resend** - Envio de emails

### Ferramentas
- **ESLint** - Linter de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

## 📚 Documentação

Documentação completa disponível em `docs/`:

- [🔧 Setup de Desenvolvimento](docs/setup/development.md)
- [🏗️ Arquitetura do Sistema](docs/architecture/overview.md)
- [📡 Documentação da API](docs/architecture/api.md)
- [🗄️ Schema do Banco](docs/architecture/database.md)
- [👑 Guia do Admin](docs/guides/admin.md)
- [🎯 Sistema de Quiz](docs/guides/quiz.md)
- [🌍 Internacionalização](docs/guides/i18n.md)

## 🔐 Segurança

- **Autenticação** via Supabase Auth
- **Row Level Security (RLS)** no PostgreSQL
- **Validação de dados** server-side e client-side
- **Rate limiting** em APIs críticas
- **HTTPS** obrigatório em produção

## 🤝 Contribuição

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para histórico de versões.

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Andre Evangelista**
- GitHub: [@andreluisce](https://github.com/andreluisce)
- Email: andre@example.com

## 🙏 Agradecimentos

- Comunidade cristã pela inspiração e feedback
- Igreja local pelo apoio e testes
- Desenvolvedores das bibliotecas open source utilizadas

---

> *"Cada um exerça o dom que recebeu para servir aos outros, administrando fielmente a graça de Deus em suas múltiplas formas."* - 1 Pedro 4:10

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**