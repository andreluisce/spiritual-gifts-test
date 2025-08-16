'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

// Hook to check if a specific user ID is an admin
export function useAdminCheck(userId: string | null) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false)
      return
    }

    const checkAdmin = async () => {
      setLoading(true)
      try {
        // Check if user has admin role in user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single()

        setIsAdmin(!!data && !error)
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [userId, supabase])

  return { isAdmin, loading }
}

// Hook to get all admin user IDs (for bulk operations)
export function useAdminUsers() {
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchAdminUsers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin')

        if (data && !error) {
          setAdminUserIds(new Set(data.map((row: { user_id: string }) => row.user_id)))
        }
      } catch (error) {
        console.error('Error fetching admin users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminUsers()
  }, [supabase])

  return { adminUserIds, loading }
}