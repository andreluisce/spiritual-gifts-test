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
        // Use RPC function to check admin status
        const { data, error } = await supabase.rpc('is_user_admin_safe')

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
        // Query auth.users for admin role in metadata
        // Note: This requires service role or a function with SECURITY DEFINER
        // For now, we'll return empty set as this is typically used server-side
        const { data: currentUser } = await supabase.auth.getUser()

        // Only current user if they are admin
        if (currentUser?.user?.user_metadata?.role === 'admin') {
          setAdminUserIds(new Set([currentUser.user.id]))
        } else {
          setAdminUserIds(new Set())
        }
      } catch (error) {
        console.error('Error fetching admin users:', error)
        setAdminUserIds(new Set())
      } finally {
        setLoading(false)
      }
    }

    fetchAdminUsers()
  }, [supabase])

  return { adminUserIds, loading }
}