'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

// Types
export type UserWithStats = {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata: {
    name?: string
    role?: string
    avatar_url?: string
  }
  quiz_count: number
  avg_score: number
  status: 'active' | 'inactive'
}

export type QuizStats = {
  total_quizzes: number
  completed_today: number
  avg_score: number
  avg_completion_time: number
  completion_rate: number
}

export type GiftDistribution = {
  gift_id: number
  gift_name: string
  count: number
  percentage: number
}

// Interface for raw user data from RPC function
interface RawUserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata?: {
    name?: string
    full_name?: string
    role?: string
    avatar_url?: string
    picture?: string
  }
  quiz_count: number
  avg_score: number
  status: 'active' | 'inactive'
}

// Interface for raw activity data
interface RawActivityData {
  id: string
  user_email: string
  user_name: string
  action: string
  type: string
  created_at: string
}

// Interface for raw gift distribution data
interface RawGiftDistributionData {
  gift_id: number
  gift_name: string
  count: number
  percentage: number
}

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  newUsersThisMonth: number
  totalQuizzes: number
  completedToday: number
  averageScore: number
  mostPopularGift: string
}

export type RecentActivity = {
  id: string
  user_email: string
  user_name?: string
  action: string
  type: 'quiz' | 'user' | 'content' | 'system'
  created_at: string
}

// Interface for analytics data
interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  totalQuizzes: number
  averageScore: number
  dateRange: string
  [key: string]: unknown
}

// Interface for system status
interface SystemStatus {
  database: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
  }
  email: {
    status: 'healthy' | 'degraded' | 'down'
    lastSent: string | null
  }
  storage: {
    status: 'healthy' | 'degraded' | 'down'
    usage: number
  }
  [key: string]: unknown
}

// Interface for demographics data
interface DemographicsData {
  ageRange: string
  count: number
  percentage: number
}

interface DemographicsAnalyticsResponse {
  totalUsers: number
  ageDistribution: Array<{
    ageRange: string
    count: number
    percentage: number
  }>
  geographicDistribution: Array<{
    country: string
    count: number
    percentage: number
  }>
}

// Interface for geographic distribution
interface GeographicData {
  country: string
  region?: string
  count: number
  percentage: number
}

// Hook for admin dashboard overview using RPC
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Use RPC function to get admin stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_admin_stats')

        console.log('📊 Admin Stats Response:', { statsData, statsError })

        if (statsError) {
          console.error('❌ Admin Stats Error:', statsError)
          throw statsError
        }

        // RPC returns TABLE as array, get first row
        if (statsData && statsData.length > 0) {
          const row = statsData[0]
          console.log('✅ Admin Stats Row:', row)
          setStats({
            totalUsers: row.totalusers || 0,
            activeUsers: row.activeusers || 0,
            adminUsers: row.adminusers || 0,
            newUsersThisMonth: row.newusersthismonth || 0,
            totalQuizzes: row.totalquizzes || 0,
            completedToday: row.completedtoday || 0,
            averageScore: row.averagescore || 0,
            mostPopularGift: row.mostpopulargift || 'N/A'
          })
        } else {
          console.warn('⚠️ No admin stats data returned')
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err)
        console.error('Error details:', JSON.stringify(err, null, 2))
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return { stats, loading, error }
}

// Hook for fetching users with stats using RPC
export function useUsersWithStats() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)

        // Use RPC function to get users with stats
        const { data: usersData, error: usersError } = await supabase
          .rpc('get_users_with_stats')

        if (usersError) throw usersError

        if (usersData) {
          const usersWithStats = usersData.map((user: RawUserData) => ({
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            user_metadata: {
              name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
              role: user.user_metadata?.role || 'user',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
            },
            quiz_count: user.quiz_count || 0,
            avg_score: user.avg_score || 0,
            status: user.status || 'inactive'
          }))

          setUsers(usersWithStats)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [supabase])

  return { users, loading, error }
}

// Hook for recent activity using RPC
export function useRecentActivity(limit: number = 10) {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true)

        // Use RPC function to get recent activity
        const { data: activityData, error: activityError } = await supabase
          .rpc('get_recent_activity', { limit_count: limit })

        if (activityError) throw activityError

        if (activityData) {
          const activities: RecentActivity[] = activityData.map((activity: RawActivityData) => ({
            id: activity.id,
            user_email: activity.user_email || 'Unknown',
            user_name: activity.user_name || activity.user_email?.split('@')[0],
            action: activity.action,
            type: activity.type as 'quiz' | 'user' | 'content' | 'system',
            created_at: activity.created_at
          }))

          setActivities(activities)
        }
      } catch (err) {
        console.error('Error fetching activity:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch activity')
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [supabase, limit])

  return { activities, loading, error }
}

// Hook for gift distribution using RPC
export function useGiftDistribution() {
  const [distribution, setDistribution] = useState<GiftDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true)

        // Use RPC function to get gift distribution
        const { data: distributionData, error: distributionError } = await supabase
          .rpc('get_gift_distribution')

        if (distributionError) throw distributionError

        if (distributionData) {
          const distribution = distributionData.map((item: RawGiftDistributionData) => ({
            gift_id: item.gift_id,
            gift_name: item.gift_name,
            count: item.count,
            percentage: item.percentage
          }))

          setDistribution(distribution)
        }
      } catch (err) {
        console.error('Error fetching gift distribution:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch distribution')
      } finally {
        setLoading(false)
      }
    }

    fetchDistribution()
  }, [supabase])

  return { distribution, loading, error }
}

// Hook for analytics data with date range
export function useAnalyticsData(dateRange: '7d' | '30d' | '90d' | '1y' = '30d') {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        // Use real analytics data from the database
        const { data: analyticsData, error: analyticsError } = await supabase
          .rpc('get_analytics_data', { date_range_param: dateRange })

        if (analyticsError) throw analyticsError

        if (analyticsData) {
          setAnalytics(analyticsData)
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase, dateRange])

  return { analytics, loading, error }
}

// Hook for deleting a user (admin only)
export function useDeleteUser() {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const deleteUser = async (userId: string) => {
    try {
      setDeleting(true)
      setError(null)

      // Use RPC function to delete user
      const { data, error: deleteError } = await supabase
        .rpc('admin_delete_user', { target_user_id: userId })

      if (deleteError) throw deleteError

      return { success: true, data }
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      return { success: false, error: err }
    } finally {
      setDeleting(false)
    }
  }

  return { deleteUser, deleting, error }
}

// Hook for updating user information
export function useUpdateUser() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const updateUser = async (
    userId: string,
    updates: {
      displayName?: string
      role?: 'user' | 'admin'
      status?: 'active' | 'inactive' | 'suspended'
    }
  ) => {
    try {
      setUpdating(true)
      setError(null)

      // Use RPC function to update user
      const rpcParams = {
        target_user_id: userId,
        display_name: updates.displayName || null,
        user_role: updates.role || null,
        user_status: updates.status || null
      }


      const { data, error: updateError } = await supabase
        .rpc('admin_update_user', rpcParams)


      if (updateError) throw updateError

      return { success: true, data }
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  return { updateUser, updating, error }
}

// Hook for updating user role (backward compatibility)
export function useUpdateUserRole() {
  const { updateUser, updating, error } = useUpdateUser()

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    return updateUser(userId, { role })
  }

  return { updateUserRole, updating, error }
}

// Hook for system status
export function useSystemStatus() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setLoading(true)

        // Use RPC function to get system status
        const { data: statusData, error: statusError } = await supabase
          .rpc('get_system_status')

        if (statusError) {
          // Handle Supabase error object
          const errorMessage = statusError.message ||
            statusError.details ||
            'Failed to fetch system status'
          throw new Error(errorMessage)
        }

        if (statusData) {
          setSystemStatus(statusData)
        }
      } catch (err) {
        console.error('Error fetching system status:', err)
        const errorMessage = err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as Record<string, unknown>).message)
            : 'Failed to fetch system status'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStatus()
  }, [supabase])

  return { systemStatus, loading, error }
}

// Hook for age demographics
export function useAgeDemographics() {
  const [demographics, setDemographics] = useState<DemographicsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .rpc('get_demographics_analytics')

        if (error) throw error

        // Extract age distribution from the comprehensive analytics
        const analyticsData = data as DemographicsAnalyticsResponse
        const ageDistribution = analyticsData?.ageDistribution || []

        // Convert to expected format
        const mappedData: DemographicsData[] = ageDistribution.map((item) => ({
          ageRange: item.ageRange,
          count: item.count,
          percentage: item.percentage
        }))

        setDemographics(mappedData)
      } catch (err) {
        console.error('Error fetching age demographics:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDemographics()
  }, [supabase])

  return { demographics, loading, error }
}

// Hook for geographic distribution
export function useGeographicDistribution() {
  const [distribution, setDistribution] = useState<GeographicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .rpc('get_demographics_analytics')

        if (error) throw error

        // Extract geographic distribution from the comprehensive analytics
        const analyticsData = data as DemographicsAnalyticsResponse
        const geoDistribution = analyticsData?.geographicDistribution || []

        // Convert to expected format
        const mappedData: GeographicData[] = geoDistribution.map((item) => ({
          country: item.country,
          count: item.count,
          percentage: item.percentage
        }))

        setDistribution(mappedData)
      } catch (err) {
        console.error('Error fetching geographic distribution:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDistribution()
  }, [supabase])

  return { distribution, loading, error }
}