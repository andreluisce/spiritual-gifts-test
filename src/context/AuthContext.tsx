'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { getEnvironmentConfig } from '@/lib/env-config'
import { userHasDemographics, triggerDemographicsCollection } from '@/lib/demographics'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

type UserRole = 'user' | 'manager' | 'admin'

type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  adminLoading: boolean
  userRole: UserRole | null
  isManager: boolean
  permissions: string[]
  hasPermission: (permission: string) => boolean
  isApproved: boolean
  approvedLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isApproved, setIsApproved] = useState(false)
  const [approvedLoading, setApprovedLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  // Function to check admin status using secure RPC function
  const deriveAdminFromMetadata = useCallback((currentUser: User | null) => {
    if (!currentUser) return false
    const { user_metadata: userMeta = {}, email = '' } = currentUser
    const appMeta = (currentUser as User & { app_metadata?: Record<string, unknown> }).app_metadata ?? {}
    const userMetaData = userMeta as Record<string, unknown>
    const appMetaData = appMeta as Record<string, unknown>

    const roles = Array.isArray(appMetaData.roles)
      ? (appMetaData.roles as unknown[]).map(String)
      : []

    return (
      userMetaData.is_admin === true ||
      userMetaData.role === 'admin' ||
      appMetaData.is_admin === true ||
      appMetaData.role === 'admin' ||
      roles.includes('admin') ||
      email.includes('@admin.')
    )
  }, [])

  const checkAdminStatus = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false)
      setUserRole(null)
      setPermissions([])
      setIsApproved(false)
      return
    }

    setAdminLoading(true)
    setApprovedLoading(true)
    try {
      // Get user role using new RPC function
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role')

      // Get approval status
      const { data: approvedData, error: approvedError } = await supabase.rpc('is_user_approved')
      if (!approvedError) {
        setIsApproved(!!approvedData)
      } else {
        // Fallback or assume false if error (except for admins/managers who are always approved)
        setIsApproved(false)
      }

      if (!roleError && roleData) {
        setUserRole(roleData as UserRole)
        setIsAdmin(roleData === 'admin')
      } else {
        // Fallback to old method
        const isAdminFallback = deriveAdminFromMetadata(currentUser)
        setIsAdmin(isAdminFallback)
        setUserRole(isAdminFallback ? 'admin' : 'user')
      }

      // Get user permissions
      const { data: permsData, error: permsError } = await supabase.rpc('get_user_permissions')

      if (!permsError && permsData) {
        setPermissions(Array.isArray(permsData) ? permsData : [])
      } else {
        // Set default permissions based on role
        if (roleData === 'admin') {
          setPermissions(['analytics', 'users_read', 'users_write', 'system_admin'])
        } else if (roleData === 'manager') {
          setPermissions(['analytics', 'users_read'])
        } else {
          setPermissions([])
        }
      }
    } catch (error) {
      console.error('Error checking admin status, using metadata fallback:', error)
      const isAdminFallback = deriveAdminFromMetadata(currentUser)
      setIsAdmin(isAdminFallback)
      setUserRole(isAdminFallback ? 'admin' : 'user')
      setPermissions(isAdminFallback ? ['analytics', 'users_read', 'users_write', 'system_admin'] : [])
      setIsApproved(isAdminFallback) // Admins are approved by default
    } finally {
      setAdminLoading(false)
      setApprovedLoading(false)
    }
  }, [supabase, deriveAdminFromMetadata])

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)

        // Check admin status for the initial user (non-blocking)
        checkAdminStatus(user).catch(console.error)
      } catch (error) {
        console.error('Error getting user:', error)
        setUser(null)
        setLoading(false) // Always set loading to false even on error
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      setLoading(false)

      // Check admin status when user changes (non-blocking)
      checkAdminStatus(newUser).catch(console.error)

      // Log activity based on auth event
      if (newUser) {
        if (event === 'SIGNED_IN') {
          // Log login activity
          supabase.rpc('log_user_activity', {
            p_user_id: newUser.id,
            p_activity_type: 'login',
            p_description: 'User logged in',
            p_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
            p_metadata: { provider: newUser.app_metadata?.provider || 'unknown' }
          }).then(({ error }: { error: unknown }) => {
            if (error) console.error('Failed to log login activity:', error)
          })

          // Check if user has demographics data and collect if missing
          userHasDemographics(newUser.id).then((hasDemographics) => {
            if (!hasDemographics) {
              console.log('User missing demographics data, triggering collection...')
              triggerDemographicsCollection(newUser.id).then((success) => {
                if (success) {
                  console.log('Demographics collection triggered successfully')
                } else {
                  console.warn('Demographics collection failed')
                }
              })
            }
          }).catch((error) => {
            console.error('Error checking/collecting demographics:', error)
          })
        }
      } else if (event === 'SIGNED_OUT') {
        // Log logout activity (use previous user if available)
        const previousUser = user
        if (previousUser) {
          supabase.rpc('log_user_activity', {
            p_user_id: previousUser.id,
            p_activity_type: 'logout',
            p_description: 'User logged out',
            p_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
            p_metadata: {}
          }).then(({ error }: { error: unknown }) => {
            if (error) console.error('Failed to log logout activity:', error)
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, checkAdminStatus, user])

  const signInWithGoogle = async () => {
    // Check if registration is enabled before proceeding
    try {
      const { data: settingsData } = await supabase.rpc('get_system_settings')

      if (settingsData && settingsData.general && !settingsData.general.enableRegistration) {
        throw new Error('Registro de novos usuários está temporariamente desabilitado.')
      }
    } catch (error) {
      // If we can't check settings, allow the registration (fallback)
      console.warn('Could not check registration settings:', error)
    }

    // Get current locale from URL
    const currentPath = window.location.pathname
    const locale = currentPath.split('/')[1] || 'pt'
    const { authCallbackUrl } = getEnvironmentConfig()

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authCallbackUrl(locale),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('OAuth error:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setIsAdmin(false) // Reset admin status on signout

      // Get current locale for redirect
      const currentPath = window.location.pathname
      const locale = currentPath.split('/')[1] || 'pt'

      // Redirect to login page
      window.location.href = `/${locale}/login`
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if logout fails, redirect to login
      const currentPath = window.location.pathname
      const locale = currentPath.split('/')[1] || 'pt'
      window.location.href = `/${locale}/login`
    }
  }

  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission)
  }, [permissions])

  const isManager = userRole === 'manager' || userRole === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      adminLoading,
      userRole,
      isManager,
      permissions,
      hasPermission,
      isApproved: isApproved || isAdmin || isManager,
      approvedLoading,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
