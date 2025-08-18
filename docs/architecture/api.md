# 📡 API Documentation

This document provides comprehensive documentation for all API endpoints in the Spiritual Gifts Test application.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Quiz Endpoints](#quiz-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Settings Endpoints](#settings-endpoints)
- [Email Endpoints](#email-endpoints)
- [Demographics Endpoints](#demographics-endpoints)
- [AI Analysis Endpoints](#ai-analysis-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 Authentication

All API endpoints require authentication unless specified otherwise. Authentication is handled via Supabase Auth with JWT tokens.

### Headers Required

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### User Roles

- **User**: Standard authenticated user
- **Admin**: User with `role: "admin"` in `raw_user_meta_data`

## 🎯 Quiz Endpoints

### Start Quiz Session

Creates a new quiz session for the authenticated user.

```http
POST /api/quiz/start
```

**Response:**
```json
{
  "sessionId": "uuid",
  "message": "Quiz session created successfully"
}
```

### Get Quiz Questions

Retrieves questions for the quiz in the specified locale.

```http
GET /api/quiz/questions?locale=pt&session_id=uuid
```

**Parameters:**
- `locale` (string): Language code (pt, en, es)
- `session_id` (string): Active quiz session ID

**Response:**
```json
{
  "questions": [
    {
      "id": "uuid",
      "text": "Question text",
      "gift": "prophecy",
      "weight_primary": 3,
      "weight_secondary": 1
    }
  ],
  "total": 140
}
```

### Submit Answer

Submits an answer for a specific question.

```http
POST /api/quiz/answer
```

**Body:**
```json
{
  "session_id": "uuid",
  "question_id": "uuid", 
  "response_value": 4
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer recorded successfully"
}
```

### Complete Quiz

Marks quiz as complete and calculates results.

```http
POST /api/quiz/complete
```

**Body:**
```json
{
  "session_id": "uuid"
}
```

**Response:**
```json
{
  "results": {
    "top_gifts": [
      {
        "gift": "prophecy",
        "score": 85.5,
        "percentage": 92.3
      }
    ],
    "all_scores": {
      "prophecy": 85.5,
      "ministry": 72.1,
      "teaching": 68.9
    }
  },
  "session_id": "uuid",
  "completed_at": "2024-08-18T10:30:00Z"
}
```

### Get Quiz Results

Retrieves results for a completed quiz session.

```http
GET /api/quiz/results/:sessionId
```

**Parameters:**
- `sessionId` (string): Quiz session ID

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "completed_at": "2024-08-18T10:30:00Z",
    "is_completed": true
  },
  "results": {
    "top_gifts": [...],
    "all_scores": {...},
    "gift_details": [...]
  }
}
```

## 👑 Admin Endpoints

### Get Admin Statistics

Retrieves system-wide statistics. **Admin only**.

```http
GET /api/admin/stats
```

**Response:**
```json
{
  "total_users": 1250,
  "active_sessions": 23,
  "completed_quizzes": 892,
  "recent_activity": [
    {
      "type": "quiz_completed",
      "user_id": "uuid",
      "timestamp": "2024-08-18T10:30:00Z"
    }
  ]
}
```

### Get User List

Retrieves paginated list of users. **Admin only**.

```http
GET /api/admin/users?page=1&limit=50
```

**Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-08-18T10:30:00Z",
      "last_sign_in": "2024-08-18T10:30:00Z",
      "quiz_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

### Get Analytics Reports

Generates analytics reports. **Admin only**.

```http
GET /api/admin/reports?type=demographics&period=30d
```

**Parameters:**
- `type` (string): Report type (demographics, gifts, activity)
- `period` (string): Time period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "type": "demographics",
  "period": "30d",
  "data": {
    "age_distribution": [...],
    "geographic_distribution": [...],
    "gift_preferences": [...]
  },
  "generated_at": "2024-08-18T10:30:00Z"
}
```

### Download Reports

Downloads report data in various formats. **Admin only**.

```http
GET /api/admin/reports/download?type=users&format=csv
```

**Parameters:**
- `type` (string): Data type (users, sessions, answers)
- `format` (string): Export format (csv, xlsx, json)

**Response:** File download

## ⚙️ Settings Endpoints

### Get System Settings

Retrieves current system settings. **Admin only**.

```http
GET /api/settings
```

**Response:**
```json
{
  "quiz": {
    "questionsPerGift": 5,
    "shuffleQuestions": true,
    "showProgress": true,
    "allowRetake": false,
    "debugMode": false
  },
  "general": {
    "siteName": "Spiritual Gifts Test",
    "enableRegistration": true,
    "maintenanceMode": false
  },
  "ai": {
    "enableAIAnalysis": true,
    "showAIButton": true,
    "model": "gpt-4"
  }
}
```

### Update System Settings

Updates system settings. **Admin only**.

```http
PUT /api/settings
```

**Body:**
```json
{
  "quiz": {
    "questionsPerGift": 7,
    "shuffleQuestions": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "settings": {...}
}
```

## 📧 Email Endpoints

### Send Results Email

Sends quiz results to user's email.

```http
POST /api/email/send-results
```

**Body:**
```json
{
  "session_id": "uuid",
  "email": "user@example.com",
  "language": "pt"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "email_id": "resend_email_id"
}
```

### Send Welcome Email

Sends welcome email to new users.

```http
POST /api/email/welcome
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "João Silva",
  "language": "pt"
}
```

### Admin Notification

Sends notification to administrators. **Admin only**.

```http
POST /api/email/admin-notification
```

**Body:**
```json
{
  "type": "user_registered",
  "data": {
    "user_email": "user@example.com",
    "timestamp": "2024-08-18T10:30:00Z"
  }
}
```

### Email Configuration Status

Checks email service configuration. **Admin only**.

```http
GET /api/email/config/status
```

**Response:**
```json
{
  "configured": true,
  "provider": "resend",
  "last_test": "2024-08-18T10:30:00Z",
  "status": "healthy"
}
```

## 📊 Demographics Endpoints

### Collect Demographics

Collects demographic data from users.

```http
POST /api/demographics/collect
```

**Body:**
```json
{
  "age_range": "25-34",
  "country": "Brasil",
  "city": "São Paulo",
  "state_province": "São Paulo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Demographics data saved successfully"
}
```

### Get Demographics Statistics

Retrieves demographic statistics. **Admin only**.

```http
GET /api/admin/demographics
```

**Response:**
```json
{
  "age_distribution": [
    {
      "age_range": "25-34",
      "count": 450,
      "percentage": 36.2
    }
  ],
  "geographic_distribution": [
    {
      "country": "Brasil",
      "count": 800,
      "percentage": 64.3
    }
  ],
  "total_responses": 1244
}
```

## 🤖 AI Analysis Endpoints

### Request AI Analysis

Requests AI analysis for quiz results.

```http
POST /api/ai-analysis
```

**Body:**
```json
{
  "session_id": "uuid",
  "language": "pt",
  "include_development_tips": true
}
```

**Response:**
```json
{
  "analysis": {
    "summary": "Based on your results...",
    "strengths": ["Leadership", "Teaching"],
    "development_areas": ["Patience", "Delegation"],
    "ministry_suggestions": ["Youth Ministry", "Bible Study Leader"],
    "biblical_references": [...]
  },
  "cached": false,
  "generated_at": "2024-08-18T10:30:00Z"
}
```

### Get AI Analytics

Retrieves AI usage analytics. **Admin only**.

```http
GET /api/admin/ai-analytics
```

**Response:**
```json
{
  "total_requests": 1245,
  "cached_responses": 892,
  "cache_hit_rate": 71.6,
  "average_response_time": 2.3,
  "cost_estimate": 24.50,
  "usage_by_language": {
    "pt": 680,
    "en": 320,
    "es": 245
  }
}
```

## ❌ Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": true,
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation details if applicable"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

### Error Response Examples

**Validation Error:**
```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "session_id": "Required field missing",
    "response_value": "Must be between 1 and 5"
  }
}
```

**Authorization Error:**
```json
{
  "error": true,
  "message": "Admin access required",
  "code": "FORBIDDEN"
}
```

## 🚦 Rate Limiting

API endpoints have rate limits to prevent abuse:

### Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 15 minutes |
| Quiz Operations | 100 requests | 1 hour |
| Admin Operations | 200 requests | 1 hour |
| AI Analysis | 20 requests | 1 hour |
| Email Sending | 10 requests | 1 hour |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1692350400
```

### Rate Limit Exceeded Response

```json
{
  "error": true,
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

## 🧪 Testing Endpoints

For development and testing purposes:

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-18T10:30:00Z",
  "version": "2.1.0",
  "services": {
    "database": "connected",
    "auth": "healthy",
    "email": "configured"
  }
}
```

### API Version

```http
GET /api/version
```

**Response:**
```json
{
  "version": "2.1.0",
  "build": "abc123",
  "environment": "production"
}
```

## 📚 SDK and Client Libraries

### JavaScript/TypeScript

```typescript
import { SpiritualGiftsAPI } from '@spiritual-gifts/api-client'

const api = new SpiritualGiftsAPI({
  baseURL: 'https://your-domain.com/api',
  token: 'jwt_token'
})

// Start quiz
const session = await api.quiz.start()

// Submit answer
await api.quiz.submitAnswer({
  sessionId: session.sessionId,
  questionId: 'question-uuid',
  responseValue: 4
})
```

### Python

```python
from spiritual_gifts_api import SpiritualGiftsAPI

api = SpiritualGiftsAPI(
    base_url='https://your-domain.com/api',
    token='jwt_token'
)

# Get admin stats
stats = api.admin.get_stats()
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are version 4 unless specified otherwise
- Pagination uses 1-based indexing
- All text fields support Unicode
- Binary data (files) use base64 encoding in JSON responses

## 🔗 Related Documentation

- [Database Schema](database.md) - Database structure and relationships
- [Security Policies](security.md) - Authentication and authorization
- [Architecture Overview](overview.md) - System architecture
- [Development Setup](../setup/development.md) - Local development guide

---

> For questions or issues with the API, please refer to the troubleshooting guide or contact the development team.