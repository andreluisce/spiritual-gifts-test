# 🏗️ Architecture Overview

This document provides a comprehensive overview of the Spiritual Gifts Test application architecture.

## 📋 Table of Contents
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Data Flow](#data-flow)
- [Security Model](#security-model)
- [Performance Considerations](#performance-considerations)
- [Deployment Architecture](#deployment-architecture)

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    Client[Next.js Frontend] --> API[API Routes]
    Client --> Auth[Supabase Auth]
    
    API --> DB[(PostgreSQL)]
    API --> OpenAI[OpenAI API]
    API --> Email[Resend Email]
    
    DB --> RLS[Row Level Security]
    DB --> Functions[Database Functions]
    
    subgraph "Frontend Layer"
        Client
        Components[React Components]
        Hooks[Custom Hooks]
        I18n[Internationalization]
    end
    
    subgraph "Backend Layer"
        API
        Auth
        Middleware[Next.js Middleware]
    end
    
    subgraph "Data Layer"
        DB
        RLS
        Functions
        Cache[Query Cache]
    end
    
    subgraph "External Services"
        OpenAI
        Email
        Storage[Supabase Storage]
    end
```

### Component Architecture

```mermaid
graph TD
    App[Next.js App] --> Layout[Layout Components]
    App --> Pages[Page Components]
    
    Layout --> Header[Header/Navigation]
    Layout --> Sidebar[Admin Sidebar]
    Layout --> Footer[Footer]
    
    Pages --> Quiz[Quiz System]
    Pages --> Admin[Admin Dashboard]
    Pages --> Results[Results Pages]
    
    Quiz --> Questions[Question Components]
    Quiz --> Progress[Progress Tracking]
    Quiz --> Submission[Answer Submission]
    
    Admin --> Users[User Management]
    Admin --> Analytics[Analytics Dashboard]
    Admin --> Settings[System Settings]
    Admin --> Content[Content Management]
    
    Results --> Charts[Chart Components]
    Results --> Reports[Report Generation]
    Results --> AI[AI Analysis]
```

## 💻 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.6 | React framework with App Router |
| **React** | 18+ | UI library |
| **TypeScript** | 5.0+ | Type safety |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **shadcn/ui** | Latest | Component library |
| **next-intl** | Latest | Internationalization |
| **Lucide React** | Latest | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.0+ | Backend-as-a-Service |
| **PostgreSQL** | 15+ | Primary database |
| **Row Level Security** | Native | Data security |
| **OpenAI API** | 4.0 | AI analysis |
| **Resend** | Latest | Email service |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **TypeScript** | Type checking |
| **Git** | Version control |

## 🔄 Data Flow

### Quiz Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant DB as Database
    participant AI as OpenAI
    
    U->>F: Start Quiz
    F->>A: GET /api/quiz/start
    A->>DB: Create quiz_session
    DB-->>A: Return session_id
    A-->>F: Session created
    
    loop For each question
        F->>A: GET /api/questions
        A->>DB: get_questions_by_locale()
        DB-->>A: Return questions
        A-->>F: Questions data
        
        U->>F: Submit answer
        F->>A: POST /api/answers
        A->>DB: Insert answer
        DB-->>A: Answer saved
    end
    
    U->>F: Complete quiz
    F->>A: POST /api/quiz/complete
    A->>DB: calculate_quiz_result()
    DB-->>A: Return results
    
    opt AI Analysis
        A->>AI: Analyze results
        AI-->>A: AI insights
        A->>DB: Cache AI response
    end
    
    A-->>F: Complete results
    F-->>U: Show results page
```

### Admin Dashboard Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant API as API Routes
    participant DB as Database
    
    A->>F: Access admin panel
    F->>API: GET /api/admin/verify
    API->>DB: Check admin role
    DB-->>API: Role verification
    
    alt Admin verified
        API-->>F: Access granted
        F->>API: GET /api/admin/stats
        API->>DB: get_admin_stats()
        DB-->>API: Dashboard data
        API-->>F: Stats returned
        F-->>A: Show dashboard
    else Not admin
        API-->>F: Access denied
        F-->>A: Redirect to dashboard
    end
```

## 🔐 Security Model

### Authentication Layer

```mermaid
graph TD
    User[User] --> Auth[Supabase Auth]
    Auth --> JWT[JWT Token]
    
    JWT --> Middleware[Next.js Middleware]
    Middleware --> Protected[Protected Routes]
    Middleware --> API[API Routes]
    
    Protected --> AdminCheck{Admin Role?}
    AdminCheck -->|Yes| AdminPanel[Admin Panel]
    AdminCheck -->|No| UserDash[User Dashboard]
    
    API --> RLSCheck[RLS Policies]
    RLSCheck --> Database[(Database)]
```

### Row Level Security (RLS)

The system implements granular access control through PostgreSQL RLS:

#### User Data Access
```sql
-- Users can only access their own quiz sessions
CREATE POLICY "Users can view own sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own answers  
CREATE POLICY "Users can insert own answers" ON answers
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
    )
  );
```

#### Admin Access
```sql
-- Admins can access all data
CREATE POLICY "Admins can view all data" ON quiz_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin')
    )
  );
```

#### Public Data
```sql
-- Everyone can read spiritual gifts data
CREATE POLICY "Public read on spiritual_gifts" ON spiritual_gifts
  FOR SELECT USING (true);
```

### API Security

- **Rate Limiting**: Implemented on critical endpoints
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Properly configured for production
- **HTTPS**: Enforced in production environment

## ⚡ Performance Considerations

### Frontend Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js Font optimization
- **Bundle Analysis**: Regular bundle size monitoring

### Database Optimization

- **Indexing Strategy**: Optimized indexes for frequent queries
- **Query Optimization**: Efficient PostgreSQL functions
- **Connection Pooling**: Supabase handles connection management
- **Caching**: Strategic caching of expensive operations

### API Performance

- **Debouncing**: Client-side debouncing for settings
- **Pagination**: Large datasets are paginated
- **Response Caching**: Cache headers for static data
- **Compression**: Gzip compression enabled

## 🚀 Deployment Architecture

### Production Environment

```mermaid
graph TB
    CDN[Vercel CDN] --> App[Next.js App]
    App --> Supabase[Supabase Cloud]
    
    subgraph "Vercel Platform"
        App
        Edges[Edge Functions]
        Analytics[Vercel Analytics]
    end
    
    subgraph "Supabase Infrastructure"
        Supabase
        DB[(PostgreSQL)]
        Auth[Auth Service]
        Storage[File Storage]
    end
    
    subgraph "External APIs"
        OpenAI[OpenAI API]
        Resend[Resend Email]
    end
    
    App --> OpenAI
    App --> Resend
```

### Environment Configuration

| Environment | Purpose | URL Pattern |
|-------------|---------|-------------|
| **Development** | Local development | `localhost:3000` |
| **Preview** | Feature testing | `*.vercel.app` |
| **Production** | Live application | `yourdomain.com` |

### Database Environments

- **Development**: Local Supabase or shared dev instance
- **Staging**: Separate Supabase project for testing
- **Production**: Production Supabase project with backups

## 📊 Monitoring and Observability

### Application Monitoring

- **Error Tracking**: Next.js error boundaries
- **Performance Monitoring**: Web Vitals tracking
- **User Analytics**: Privacy-compliant usage tracking

### Database Monitoring

- **Query Performance**: Supabase dashboard metrics
- **Connection Monitoring**: Connection pool analysis
- **Storage Usage**: Database size and growth tracking

### External Service Monitoring

- **API Response Times**: External service latency
- **Error Rates**: Failed API calls tracking
- **Usage Quotas**: OpenAI and Resend usage monitoring

## 🔄 Data Architecture

### Database Schema Overview

```mermaid
erDiagram
    users ||--o{ quiz_sessions : creates
    quiz_sessions ||--o{ answers : contains
    questions ||--o{ answers : receives
    spiritual_gifts ||--o{ questions : categorizes
    
    users {
        uuid id
        string email
        jsonb raw_user_meta_data
        timestamp created_at
    }
    
    quiz_sessions {
        uuid id
        uuid user_id
        boolean is_completed
        timestamp created_at
        timestamp completed_at
    }
    
    answers {
        uuid id
        uuid session_id
        uuid question_id
        integer response_value
        timestamp created_at
    }
    
    questions {
        uuid id
        gift_key gift
        text question_text
        integer weight_primary
        integer weight_secondary
    }
    
    spiritual_gifts {
        gift_key key
        text name
        text description
        text biblical_reference
    }
```

## 🧪 Testing Strategy

### Frontend Testing

- **Unit Tests**: Component testing with Jest/React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Critical user flows with Playwright/Cypress

### Backend Testing

- **Database Tests**: PostgreSQL function testing
- **API Tests**: Endpoint testing with automated requests
- **Security Tests**: RLS policy validation

### Performance Testing

- **Load Testing**: Concurrent user simulation
- **Stress Testing**: System limits identification
- **Database Performance**: Query optimization validation

---

## 📚 Related Documentation

- [Database Schema](database.md) - Detailed database structure
- [API Documentation](api.md) - Complete API reference
- [Security Policies](security.md) - Security implementation details
- [Development Setup](../setup/development.md) - Local development guide

---

> This architecture is designed to be scalable, secure, and maintainable while providing excellent performance for users worldwide.