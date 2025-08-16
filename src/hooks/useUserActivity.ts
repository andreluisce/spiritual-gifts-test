'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

// Types for user activities
interface RawUserActivity {
  id: string
  user_id: string
  activity_type: string
  activity_description: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, unknown>
  created_at: string
  users?: {
    email: string
    full_name: string
  }
}

export type UserActivity = {
  id: string
  user_id: string
  user_email: string
  user_name: string
  activity_type: 'login' | 'logout' | 'quiz_start' | 'quiz_complete' | 'profile_update' | 'password_change' | 'account_created' | 'email_verified'
  activity_description: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export type ActivityStats = {
  totalActivities: number
  todayActivities: number
  activeUsers: number
  topActivities: { type: string; count: number }[]
}

// Hook for fetching user activities
export function useUserActivities(limit: number = 50, userId?: string) {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use the RPC function to get real activity data
        const { data, error: rpcError } = await supabase.rpc('get_user_activities', {
          limit_count: limit
        })

        if (rpcError) throw rpcError

        if (data) {
          const mappedActivities: UserActivity[] = data.map((activity: RawUserActivity) => ({
            id: activity.id,
            user_id: activity.user_id,
            user_email: activity.users?.email || '',
            user_name: activity.users?.full_name || '',
            activity_type: activity.activity_type,
            activity_description: activity.activity_description || '',
            ip_address: activity.ip_address,
            user_agent: activity.user_agent,
            metadata: activity.metadata,
            created_at: activity.created_at
          }))

          setActivities(mappedActivities)
        }

      } catch (err) {
        console.error('Error fetching user activities:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase, limit, userId])

  return { activities, loading, error }
}

// Hook for activity statistics
export function useActivityStats() {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use the RPC function to get real activity statistics
        const { data, error: rpcError } = await supabase.rpc('get_activity_stats')

        if (rpcError) throw rpcError

        if (data) {
          setStats({
            totalActivities: data.totalActivities || 0,
            todayActivities: data.todayActivities || 0,
            activeUsers: data.activeUsers || 0,
            topActivities: data.topActivities || []
          })
        }

      } catch (err) {
        console.error('Error fetching activity stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return { stats, loading, error }
}