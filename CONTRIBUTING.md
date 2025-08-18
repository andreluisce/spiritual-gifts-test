# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o **Spiritual Gifts Test**! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

## 📜 Código de Conduta

Este projeto segue um código de conduta baseado nos valores cristãos. Esperamos que todos os participantes:

- Tratem uns aos outros com **respeito e amor**
- Usem linguagem **edificante e construtiva**
- Aceitem **críticas construtivas** com humildade
- Foquem no que é **melhor para a comunidade**
- Demonstrem **paciência** com iniciantes

> *"Portanto, encorajem-se uns aos outros e edifiquem-se mutuamente"* - 1 Tessalonicenses 5:11

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Fork no GitHub, depois clone seu fork
git clone https://github.com/seu-usuario/spiritual-gifts-test.git
cd spiritual-gifts-test

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-usuario/spiritual-gifts-test.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma nova branch para sua contribuição
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
# ou
git checkout -b docs/atualizacao-documentacao
```

### 3. Faça suas Alterações

- Siga os [padrões de código](#padrões-de-código)
- Adicione testes quando necessário
- Atualize a documentação se relevante
- Teste suas alterações localmente

### 4. Commit e Push

```bash
# Commit seguindo os padrões
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# Push para seu fork
git push origin feature/nome-da-feature
```

### 5. Crie um Pull Request

- Vá para o GitHub e crie um PR
- Use o template de PR
- Descreva claramente suas alterações
- Referencie issues relacionadas

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18.17+
- npm/yarn/pnpm
- Conta no Supabase
- Git

### Setup Local

1. **Instale dependências**
   ```bash
   npm install
   ```

2. **Configure ambiente**
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas credenciais
   ```

3. **Configure banco de dados**
   ```bash
   cd database
   ./run_all_scripts.sh
   ```

4. **Execute testes**
   ```bash
   npm run test
   npm run lint
   npm run typecheck
   ```

5. **Inicie desenvolvimento**
   ```bash
   npm run dev
   ```

## 📝 Padrões de Código

### TypeScript

- **Sempre use TypeScript** - evite `any`
- **Interfaces explícitas** para props e objetos
- **Strict mode** habilitado
- **Nomenclatura descritiva** para variáveis e funções

```typescript
// ✅ Bom
interface QuizSettings {
  questionsPerGift: number
  shuffleQuestions: boolean
  timeLimit?: number
}

const handleQuizSubmission = async (answers: Answer[]): Promise<QuizResult> => {
  // implementação
}

// ❌ Evitar
const handleStuff = (data: any) => {
  // implementação
}
```

### React Components

- **Functional components** com hooks
- **Props interface** sempre definida
- **Componentes pequenos** e focados
- **Custom hooks** para lógica reutilizável

```tsx
// ✅ Bom
interface QuizQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  isLoading?: boolean
}

export default function QuizQuestion({ question, onAnswer, isLoading = false }: QuizQuestionProps) {
  // implementação
}
```

### CSS/Styling

- **Tailwind CSS** preferencial
- **Classes utilitárias** organizadas
- **Responsive design** mobile-first
- **Consistency** com design system

```tsx
// ✅ Bom
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md md:flex-row md:gap-6">
  <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
    Enviar
  </button>
</div>
```

### Banco de Dados

- **Funções PostgreSQL** para lógica complexa
- **Row Level Security** obrigatório
- **Índices** para queries frequentes
- **Comentários** em funções SQL

```sql
-- ✅ Bom
CREATE OR REPLACE FUNCTION get_quiz_result(session_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Calcula o resultado do quiz baseado nas respostas ponderadas
-- Retorna: JSON com scores por dom espiritual
BEGIN
  -- implementação
END;
$$;
```

## 📝 Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
tipo(escopo): descrição

[corpo opcional]

[rodapé opcional]
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Formatação, sem mudança de funcionalidade
- **refactor**: Refatoração de código
- **test**: Adição ou correção de testes
- **chore**: Tarefas de build, configuração, etc.

### Exemplos

```bash
# Funcionalidades
git commit -m "feat(quiz): adiciona timer para perguntas"
git commit -m "feat(admin): implementa dashboard de analytics"

# Correções
git commit -m "fix(auth): corrige redirecionamento após login"
git commit -m "fix(database): resolve query de resultados duplicados"

# Documentação
git commit -m "docs(api): atualiza documentação de endpoints"
git commit -m "docs(readme): adiciona instruções de deploy"

# Refatoração
git commit -m "refactor(components): migra para hooks customizados"
git commit -m "refactor(sql): otimiza queries de relatórios"
```

## 🔄 Pull Requests

### Template de PR

```markdown
## 📝 Descrição

Breve descrição das alterações feitas.

## 🔗 Issue Relacionada

Fixes #123

## ✅ Tipo de Mudança

- [ ] Bug fix (mudança que corrige um problema)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou funcionalidade que quebra compatibilidade)
- [ ] Documentação (mudança apenas na documentação)

## 🧪 Como Testar

1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja '...'

## 📋 Checklist

- [ ] Meu código segue os padrões do projeto
- [ ] Fiz uma auto-revisão do meu código
- [ ] Comentei meu código em partes difíceis de entender
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção é efetiva
- [ ] Testes novos e existentes passam localmente
```

### Processo de Review

1. **Automated checks** devem passar
2. **Code review** por pelo menos 1 mantenedor
3. **Testing** em ambiente de desenvolvimento
4. **Documentation** atualizada se necessário

## 🐛 Reportando Bugs

### Antes de Reportar

- **Verifique issues existentes**
- **Reproduza o bug** consistentemente
- **Teste na versão mais recente**

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara e concisa do que o bug é.

**Para Reproduzir**
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
Descrição clara do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar o problema.

**Ambiente:**
 - OS: [ex. iOS]
 - Browser [ex. chrome, safari]
 - Versão [ex. 22]

**Contexto Adicional**
Adicione qualquer outro contexto sobre o problema aqui.
```

## 💡 Sugerindo Funcionalidades

### Antes de Sugerir

- **Verifique se já existe** uma issue similar
- **Considere se é útil** para a maioria dos usuários
- **Pense na implementação** e complexidade

### Template de Feature Request

```markdown
**A funcionalidade está relacionada a um problema? Descreva.**
Descrição clara de qual é o problema. Ex. Estou sempre frustrado quando [...]

**Descreva a solução que você gostaria**
Descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Descrição clara de qualquer solução ou funcionalidade alternativa que você considerou.

**Contexto adicional**
Adicione qualquer outro contexto ou screenshots sobre a solicitação de funcionalidade aqui.
```

## 🔍 Áreas que Precisam de Ajuda

### 🌍 Traduções

- Melhorar traduções em inglês e espanhol
- Adicionar novos idiomas
- Revisar traduções teológicas

### 📱 Interface

- Melhorar responsividade mobile
- Adicionar animações e micro-interações
- Otimizar acessibilidade

### 🧪 Testes

- Aumentar cobertura de testes
- Adicionar testes E2E
- Testes de performance

### 📚 Documentação

- Guias de usuário
- Tutoriais em vídeo
- Documentação de API

### ⚡ Performance

- Otimização de queries
- Cache estratégico
- Bundle size optimization

## 🙏 Agradecimentos

Toda contribuição é valiosa! Algumas formas de ajudar:

- **💻 Código**: Implementar funcionalidades e corrigir bugs
- **📝 Documentação**: Melhorar guias e tutoriais
- **🌍 Tradução**: Ajudar com internacionalização
- **🧪 Testes**: Relatar bugs e testar funcionalidades
- **💬 Feedback**: Compartilhar experiências e sugestões
- **🙏 Oração**: Orar pelo projeto e equipe

---

> *"E tudo o que fizerem, seja em palavra ou em ação, façam-no em nome do Senhor Jesus"* - Colossenses 3:17

**Obrigado por contribuir para edificar o Corpo de Cristo! 🙏**