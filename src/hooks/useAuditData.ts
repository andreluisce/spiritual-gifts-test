'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

// Types
export type AuditLog = {
  id: string
  user_id?: string
  user_email: string
  action: string
  resource: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  status: 'success' | 'failed' | 'warning'
  created_at: string
}

export type AuditStats = {
  totalEvents: number
  eventsToday: number
  failedEvents: number
  uniqueUsers: number
}

// Hook for fetching audit logs
export function useAuditLogs(
  limit: number = 50,
  offset: number = 0,
  filterAction?: string,
  filterStatus?: string,
  filterUser?: string
) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)

        // Use RPC function to get audit logs
        const { data: logsData, error: logsError } = await supabase
          .rpc('get_audit_logs', {
            limit_count: limit,
            offset_count: offset,
            action_filter: filterAction || null,
            status_filter: filterStatus || null,
            search_term: filterUser || null
          })

        if (logsError) throw logsError

        if (logsData) {
          const mappedLogs: AuditLog[] = logsData.map((log: AuditLog) => ({
            id: log.id.toString(),
            user_id: log.user_id,
            user_email: log.user_email || 'Unknown',
            action: log.action,
            resource: log.resource,
            details: log.details,
            ip_address: log.ip_address,
            user_agent: log.user_agent,
            status: log.status as 'success' | 'failed' | 'warning',
            created_at: log.created_at
          }))

          setLogs(mappedLogs)
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err)
        console.dir(err)
        let errorMessage = 'Failed to fetch audit logs'
        if (typeof err === 'string') {
          errorMessage = err
        } else if (err instanceof Error) {
          errorMessage = err.message
        } else if (err && typeof err === 'object') {
          const pgError = err as { message?: string; details?: string; hint?: string }
          errorMessage = pgError.message || pgError.details || pgError.hint || JSON.stringify(err)
        }
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [supabase, limit, offset, filterAction, filterStatus, filterUser])

  return { logs, loading, error }
}

// Hook for fetching audit statistics
export function useAuditStats() {
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Use RPC function to get audit stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_audit_stats')

        if (statsError) throw statsError

        if (statsData) {
          setStats({
            totalEvents: statsData.totalEvents || 0,
            eventsToday: statsData.eventsToday || 0,
            failedEvents: statsData.failedEvents || 0,
            uniqueUsers: statsData.uniqueUsers || 0
          })
        }
      } catch (err) {
        console.error('Error fetching audit stats:', err)
        let errorMessage = 'Failed to fetch audit stats'
        if (typeof err === 'string') {
          errorMessage = err
        } else if (err && typeof err === 'object') {
          const pgError = err as { message?: string; details?: string; hint?: string }
          errorMessage = pgError.message || pgError.details || pgError.hint || JSON.stringify(err)
        }
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return { stats, loading, error }
}

// Hook for logging audit events
export function useAuditLogger() {
  const [logging, setLogging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  const logEvent = async (
    action: string,
    resource: string,
    details?: Record<string, unknown>,
    status: 'success' | 'failed' | 'warning' = 'success'
  ) => {
    try {
      setLogging(true)
      setError(null)

      // Get current user (authentication handled by RLS)

      // Log the event
      const { error: logError } = await supabase
        .rpc('log_audit_event', {
          action_name: action,
          resource_name: resource,
          details_json: details || null,
          status_value: status,
          ip_addr: null, // Would need to get from request in real implementation
          user_agent_string: navigator.userAgent || null
        })

      if (logError) throw logError

      return { success: true }
    } catch (err) {
      console.error('Error logging audit event:', err)
      setError(err instanceof Error ? err.message : 'Failed to log event')
      return { success: false, error: err }
    } finally {
      setLogging(false)
    }
  }

  return { logEvent, logging, error }
}