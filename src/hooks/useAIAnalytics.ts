import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

export interface AIAnalyticsOverview {
  total_analyses: number
  cache_hits: number
  api_calls: number
  unique_users: number
  analyses_today: number
  analyses_this_week: number
  analyses_this_month: number
  avg_confidence_score: number
  most_analyzed_gift: string
  cache_hit_rate: number
}

export interface AITimelineData {
  analysis_date: string
  daily_analyses: number
  daily_cache_hits: number
  daily_api_calls: number
}

export interface AIGiftBreakdown {
  gift_key: string
  analysis_count: number
  avg_confidence: number
  last_analysis: string
}

export interface AIRecentActivity {
  id: string
  user_email: string
  primary_gift: string
  confidence_score: number
  ai_service: string
  created_at: string
  is_cached: boolean
}

export interface AISystemStatus {
  ai_button_enabled: boolean
  auto_generate_enabled: boolean
  cache_strategy: string
  total_system_analyses: number
  system_health_score: number
}

export interface AIAnalyticsData {
  overview?: AIAnalyticsOverview
  timeline?: AITimelineData[]
  byGift?: AIGiftBreakdown[]
  recentActivity?: AIRecentActivity[]
  systemStatus?: AISystemStatus
}

export function useAIAnalytics(type: 'overview' | 'timeline' | 'by-gift' | 'recent-activity' | 'system-status' | 'all' = 'overview') {
  const { user } = useAuth()
  const [data, setData] = useState<AIAnalyticsData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      console.log('📊 useAIAnalytics: Fetching AI analytics data...')
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/ai-analytics?type=${type}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ useAIAnalytics: Analytics data fetched successfully')
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      console.error('❌ useAIAnalytics: Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user, type])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  }
}

// Specialized hooks for specific analytics
export function useAIOverviewStats() {
  const { data, loading, error, refetch } = useAIAnalytics('overview')
  return {
    overview: data.overview,
    loading,
    error,
    refetch
  }
}

export function useAITimelineData() {
  const { data, loading, error, refetch } = useAIAnalytics('timeline')
  return {
    timeline: data.timeline || [],
    loading,
    error,
    refetch
  }
}

export function useAIRecentActivity(limit = 10) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<AIRecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/ai-analytics?type=recent-activity&limit=${limit}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch recent activity: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setActivities(result.data.recentActivity || [])
      } else {
        throw new Error(result.error || 'Failed to fetch recent activity')
      }
    } catch (err) {
      console.error('❌ useAIRecentActivity: Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user, limit])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  return {
    activities,
    loading,
    error,
    refetch: fetchActivity
  }
}

// Hook for testing AI service
export function useAIServiceTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testAIService = useCallback(async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          test: true,
          profile: {
            primaryGift: { key: 'C_TEACHING', name: 'Teaching', score: 21 },
            secondaryGifts: [
              { key: 'F_LEADERSHIP', name: 'Leadership', score: 18 },
              { key: 'A_PROPHECY', name: 'Prophecy', score: 15 }
            ],
            locale: 'pt'
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `AI service working correctly! Analysis generated with ${data.analysis?.confidence || 'unknown'}% confidence.`
        })
      } else {
        const errorData = await response.json()
        setResult({
          success: false,
          message: `AI service test failed: ${errorData.error || 'Unknown error'}`
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error testing AI service: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setTesting(false)
    }
  }, [])

  return {
    testAIService,
    testing,
    result
  }
}