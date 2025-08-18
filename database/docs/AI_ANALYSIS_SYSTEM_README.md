# AI Analysis Cache System

## Overview

This system provides intelligent caching for AI-generated personality and spiritual gift compatibility analyses. It improves performance by avoiding redundant API calls and provides a better user experience.

## Architecture

```
User Quiz Results → AI Analysis API → Cache → Display
                     ↓ (if cached)     ↑
                     Database ←--------+
```

## Database Structure

### Main Table: `ai_analysis_cache`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `user_id` | UUID | Reference to auth.users |
| `session_id` | UUID | Reference to quiz_sessions (UNIQUE) |
| `gift_scores` | JSONB | User's gift scores for context |
| `primary_gifts` | TEXT[] | Array of main gifts |
| `personalized_insights` | TEXT | AI-generated personalized analysis |
| `strengths_description` | TEXT | Description of user's strengths |
| `challenges_guidance` | TEXT | Guidance for potential challenges |
| `ministry_recommendations` | TEXT[] | AI ministry suggestions |
| `development_plan` | TEXT | Personalized development plan |
| `practical_applications` | TEXT[] | Practical ways to use gifts |
| `confidence_score` | INTEGER | AI confidence (0-100) |
| `ai_service_used` | VARCHAR(50) | Which AI service generated this |
| `analysis_version` | VARCHAR(10) | Version for future updates |

## API Endpoints

### POST `/api/ai-analysis`

Generate or retrieve AI analysis for a user profile.

**Request:**
```json
{
  "profile": {
    "primaryGift": {
      "key": "A_PROPHECY",
      "name": "Prophecy",
      "score": 85
    },
    "secondaryGifts": [
      {
        "key": "C_TEACHING",
        "name": "Teaching", 
        "score": 78
      }
    ],
    "locale": "pt"
  },
  "sessionId": "uuid-here",
  "useCache": true
}
```

**Response:**
```json
{
  "analysis": {
    "personalizedInsights": "Based on your strong prophetic gift...",
    "strengthsDescription": "Your natural abilities include...",
    "challengesGuidance": "Areas to watch out for...",
    "ministryRecommendations": ["Preaching", "Counseling"],
    "developmentPlan": "To grow in your gifts...",
    "practicalApplications": ["Join prayer team", "Lead Bible study"],
    "confidence": 87
  },
  "cached": false,
  "generatedAt": "2025-01-15T10:30:00Z"
}
```

### GET `/api/ai-analysis?sessionId=uuid`

Retrieve cached analysis for a specific session.

## React Component Usage

```tsx
import AIInsights from '@/components/AIInsights'

function ResultsPage() {
  const giftScores = {
    "A_PROPHECY": 85,
    "C_TEACHING": 78,
    "G_MERCY": 72
  }
  
  const topGifts = ["A_PROPHECY", "C_TEACHING", "G_MERCY"]
  
  return (
    <AIInsights
      giftScores={giftScores}
      topGifts={topGifts}
      sessionId="quiz-session-uuid"
      locale="pt"
      className="mb-6"
    />
  )
}
```

## Database Functions

### `save_ai_analysis(...)`
Saves AI analysis with automatic upsert behavior.

### `get_ai_analysis_by_session(session_id)`
Retrieves cached analysis for a specific quiz session.

### `get_user_ai_analysis_history(user_id, limit)`
Gets user's historical AI analyses for dashboard.

### `get_ai_analysis_stats()`
Admin function to get system-wide AI analysis statistics.

## Cache Strategy

1. **Check Cache First**: Always check if analysis exists for sessionId
2. **Generate if Missing**: Call AI API only if no cache exists
3. **Save Results**: Store successful AI responses for future use
4. **Version Control**: Track analysis version for future updates
5. **Confidence Tracking**: Store AI confidence scores for quality metrics

## Performance Benefits

- **Cache Hit**: ~100ms (database query)
- **Cache Miss**: ~3-5s (AI API call + save)
- **Cost Savings**: Avoid redundant AI API calls
- **Offline Support**: Cached results work without internet

## Security

- **Row Level Security**: Users only see their own analyses
- **Authenticated Routes**: All API endpoints require authentication
- **Server-Side Keys**: AI API keys never exposed to client
- **Data Validation**: Input sanitization and type checking

## Monitoring

```sql
-- Check cache hit rate
SELECT 
  COUNT(*) as total_analyses,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(confidence_score) as avg_confidence
FROM ai_analysis_cache;

-- Get recent activity
SELECT 
  primary_gifts,
  confidence_score,
  ai_service_used,
  created_at
FROM ai_analysis_cache 
ORDER BY created_at DESC 
LIMIT 10;
```

## Deployment Notes

1. Run migration: `database/28_CREATE_AI_ANALYSIS_CACHE_SYSTEM.sql`
2. Set environment variables for AI services
3. Test API endpoints with sample data
4. Monitor cache hit rates and performance
5. Set up alerts for low confidence scores

## Future Enhancements

- [ ] Automatic cache invalidation based on new quiz attempts
- [ ] A/B testing for different AI prompts
- [ ] Multilingual analysis caching
- [ ] Analytics dashboard for admin users
- [ ] Batch processing for multiple users