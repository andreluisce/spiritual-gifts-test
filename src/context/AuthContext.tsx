'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
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
  const userRef = useRef<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isApproved, setIsApproved] = useState(false)
  const [approvedLoading, setApprovedLoading] = useState(false)
  const [supabase] = useState(() => createClient())
  const syncRoleAttemptedRef = useRef(false)

  // Lightweight helper to auto-fill location from IP (server handles no-op)
  const autoPopulateLocation = useCallback(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/profile/auto-locate', { method: 'POST' })
        const body = res.ok ? await res.json() : null

        // If backend couldn't resolve via IP/headers, try browser geolocation
        if ((body?.reason === 'geolocation-unavailable' || !res.ok) && typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude }
                const geoRes = await fetch('/api/profile/auto-locate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(coords)
                })
                await geoRes.json().catch(() => null)
              } catch (err) {
                console.error('[auto-locate] browser fallback failed', err)
              }
            },
            (err) => {
              console.warn('[auto-locate] browser geolocation denied/unavailable', err)
            },
            { enableHighAccuracy: false, timeout: 5000 }
          )
        }
      } catch (error) {
        console.error('[auto-locate] failed', error)
      }
    }
    run()
  }, [])

  // Function to derive role from metadata when RPC is unavailable
  const deriveRoleFromMetadata = useCallback((currentUser: User | null): UserRole | null => {
    if (!currentUser) return null
    const { user_metadata: userMeta = {}, email = '' } = currentUser
    const appMeta = (currentUser as User & { app_metadata?: Record<string, unknown> }).app_metadata ?? {}
    const userMetaData = userMeta as Record<string, unknown>
    const appMetaData = appMeta as Record<string, unknown>

    const roles = Array.isArray(appMetaData.roles)
      ? (appMetaData.roles as unknown[]).map(String)
      : []

    if (
      userMetaData.is_admin === true ||
      userMetaData.role === 'admin' ||
      appMetaData.is_admin === true ||
      appMetaData.role === 'admin' ||
      roles.includes('admin') ||
      email.includes('@admin.')
    ) {
      return 'admin'
    }

    if (
      userMetaData.role === 'manager' ||
      appMetaData.role === 'manager' ||
      roles.includes('manager') ||
      email.includes('@manager.')
    ) {
      return 'manager'
    }

    return 'user'
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
      const derivedRole = deriveRoleFromMetadata(currentUser)

      // Get user role using new RPC function
      const { data: roleData, error: roleError } = await supabase.rpc('get_user_role')
      if (roleError) {
        console.warn('[auth] get_user_role error:', roleError)
      } else {
      }

      // Get approval status
      const { data: approvedData, error: approvedError } = await supabase.rpc('is_user_approved')
      if (!approvedError) {
        setIsApproved(!!approvedData)
      } else {
        // Fallback or assume false if error (except for admins/managers who are always approved)
        setIsApproved(false)
      }

      let resolvedRole = roleError ? null : (roleData as UserRole | null)

      // If Supabase says "user" but metadata claims manager/admin, try a one-time sync of profile role
      if (
        !roleError &&
        roleData === 'user' &&
        (derivedRole === 'manager' || derivedRole === 'admin') &&
        !syncRoleAttemptedRef.current
      ) {
        syncRoleAttemptedRef.current = true
        try {
          await fetch('/api/profile/sync-role', { method: 'POST' })
          const { data: refreshedRole, error: refreshError } = await supabase.rpc('get_user_role')
          if (!refreshError && refreshedRole) {
            resolvedRole = refreshedRole as UserRole
          }
        } catch (syncError) {
          console.error('[auth] sync-role failed:', syncError)
        }
      }

      if (!roleError && resolvedRole) {
        setUserRole(resolvedRole)
        setIsAdmin(resolvedRole === 'admin')
      } else {
        // Safe fallback: only allow admin via metadata, otherwise treat as regular user
        const isAdminFallback = derivedRole === 'admin'
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
          setPermissions(['analytics', 'users_read', 'users_write'])
        } else {
          // Metadata fallback: only grant admin; manager falls back to user on failure for safety
          if (derivedRole === 'admin') {
            setPermissions(['analytics', 'users_read', 'users_write', 'system_admin'])
          } else if (derivedRole === 'manager') {
            setPermissions(['analytics', 'users_read', 'users_write'])
          } else {
            setPermissions([])
          }
        }
      }
    } catch (error) {
      console.error('Error checking admin status, using metadata fallback:', error)
      const derivedRole = deriveRoleFromMetadata(currentUser)
      const isAdminFallback = derivedRole === 'admin'
      setIsAdmin(isAdminFallback)
      const role = isAdminFallback ? 'admin' : (derivedRole === 'manager' ? 'manager' : 'user')
      setUserRole(role)
      setPermissions(
        isAdminFallback
          ? ['analytics', 'users_read', 'users_write', 'system_admin']
          : role === 'manager'
            ? ['analytics', 'users_read', 'users_write']
            : []
      )
      setIsApproved(isAdminFallback || role === 'manager') // manager treated as approved
    } finally {
      setAdminLoading(false)
      setApprovedLoading(false)
    }
  }, [supabase, deriveRoleFromMetadata])

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        userRef.current = user
        setUser(user)
        setLoading(false)

        // Check admin status for the initial user (non-blocking)
        checkAdminStatus(user).catch(console.error)

        // Fill location automatically if missing
        if (user) {
          autoPopulateLocation()
        }
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
      const previousUser = userRef.current
      userRef.current = newUser
      setUser(newUser)
      setLoading(false)

      // Check admin status when user changes (non-blocking)
      checkAdminStatus(newUser).catch(console.error)

      // Log activity based on auth event
      if (newUser) {
        if (event === 'SIGNED_IN') {
          autoPopulateLocation()

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
              triggerDemographicsCollection(newUser.id).then((success) => {
                if (success) {
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
  }, [supabase, checkAdminStatus, autoPopulateLocation])

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
