# 🔧 Development Setup Guide

This guide will help you set up the Spiritual Gifts Test application for local development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17 or higher
- **npm/yarn/pnpm**: Package manager of your choice
- **Git**: For version control
- **PostgreSQL**: Version 15+ (or Supabase account)
- **Code Editor**: VS Code recommended with TypeScript support

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/spiritual-gifts-test.git
cd spiritual-gifts-test

# Install dependencies
npm install
# or
yarn install
# or  
pnpm install
```

### 2. Environment Configuration

Create your environment file:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Using Supabase Cloud

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the database setup scripts:

```bash
cd database/core
# Execute scripts in order
psql -h your-host -U postgres -d your-db -f 01_CLEAN_complete_system.sql
psql -h your-host -U postgres -d your-db -f 02_CLEAN_load_data.sql
# ... (see database/README.md for complete list)
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:

```sql
CREATE DATABASE spiritual_gifts_test;
```

3. Update your connection string in `.env.local`
4. Run the setup scripts as above

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Development Tools

### Code Quality Tools

The project includes several tools to maintain code quality:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### VS Code Extensions

Recommended extensions for the best development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode", 
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Git Hooks

The project uses Husky for git hooks:

```bash
# Install git hooks
npx husky install

# Hooks will run automatically on:
# - pre-commit: lint and type check
# - commit-msg: validate commit message format
```

## 🗄️ Database Development

### Local Database Management

```bash
# Connect to local database
psql -d spiritual_gifts_test

# Reset database (CAUTION: Deletes all data)
cd database/core
psql -d spiritual_gifts_test -f 01_CLEAN_complete_system.sql

# Apply specific migration
psql -d spiritual_gifts_test -f specific_migration.sql
```

### Supabase Studio

Access your Supabase dashboard at `https://app.supabase.com/project/your-project-id`

Key sections:
- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **API Docs**: Auto-generated API documentation
- **Authentication**: Manage users and auth settings

### Database Functions Testing

```sql
-- Test quiz result calculation
SELECT * FROM calculate_quiz_result('session-uuid-here');

-- Test demographic functions
SELECT * FROM get_age_demographics();
SELECT * FROM get_geographic_demographics();

-- Test admin functions
SELECT * FROM get_admin_stats();
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test components/QuizQuestion.test.tsx
```

### Test Structure

```
src/
├── __tests__/          # Global test utilities
├── components/
│   ├── QuizQuestion.tsx
│   └── QuizQuestion.test.tsx
├── hooks/
│   ├── useQuiz.ts
│   └── useQuiz.test.ts
└── lib/
    ├── utils.ts
    └── utils.test.ts
```

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import QuizQuestion from './QuizQuestion'

describe('QuizQuestion', () => {
  it('renders question text', () => {
    render(
      <QuizQuestion
        question={{ text: 'Test question', gift: 'prophecy' }}
        onAnswer={jest.fn()}
      />
    )
    
    expect(screen.getByText('Test question')).toBeInTheDocument()
  })
})
```

## 🌍 Internationalization Development

### Adding New Translations

1. Update translation files in `src/i18n/messages/`:

```json
// messages/pt.json
{
  "quiz": {
    "newKey": "Nova tradução em português"
  }
}

// messages/en.json  
{
  "quiz": {
    "newKey": "New translation in English"
  }
}

// messages/es.json
{
  "quiz": {
    "newKey": "Nueva traducción en español"
  }
}
```

2. Use in components:

```typescript
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('quiz')
  
  return <h1>{t('newKey')}</h1>
}
```

### Testing Different Locales

```bash
# Test Portuguese (default)
open http://localhost:3000

# Test English  
open http://localhost:3000/en

# Test Spanish
open http://localhost:3000/es
```

## 🎨 UI Development

### Design System

The project uses **shadcn/ui** components with **Tailwind CSS**:

```bash
# Add new UI component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

### Component Development

```typescript
// Example component with proper typing
interface MyComponentProps {
  title: string
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export default function MyComponent({ 
  title, 
  variant = 'primary', 
  children 
}: MyComponentProps) {
  return (
    <div className={cn(
      'p-4 rounded-lg',
      variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
    )}>
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </div>
  )
}
```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
">
  {/* Content */}
</div>
```

## 🔧 Environment Variables

### Complete Environment Configuration

```env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional - OpenAI for AI Analysis
OPENAI_API_KEY=sk-your-openai-key

# Optional - Resend for Email
RESEND_API_KEY=re_your-resend-key

# Optional - Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - Debugging
DEBUG=true
NEXT_PUBLIC_DEBUG_MODE=true
```

### Environment Validation

The app validates environment variables on startup:

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Check Supabase connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"
```

#### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
npx tsc --build --clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Build Issues

```bash
# Check for unused imports
npm run lint

# Check TypeScript
npm run typecheck

# Check for circular dependencies  
npx madge --circular src/
```

### Performance Debugging

```bash
# Analyze bundle size
npm run build
npm run analyze

# Profile development build
NODE_ENV=development npm run build
```

### Database Debugging

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'quiz_sessions';

-- Check user permissions
SELECT * FROM auth.users WHERE id = auth.uid();

-- Debug quiz calculations
SELECT * FROM v_answer_effective_weights 
WHERE session_id = 'your-session-id';
```

## 📚 Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Project-Specific Guides

- [API Documentation](../architecture/api.md)
- [Database Schema](../architecture/database.md) 
- [Admin Panel Guide](../guides/admin.md)
- [Deployment Guide](../setup/production.md)

---

## 🤝 Contributing

Ready to contribute? Check out our [Contributing Guide](../../CONTRIBUTING.md) for detailed guidelines on:

- Code standards
- Pull request process  
- Testing requirements
- Documentation updates

---

> **Need Help?** Join our Discord server or open an issue on GitHub for support from the community and maintainers.