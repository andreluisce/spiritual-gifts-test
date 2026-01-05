'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { getEnvironmentConfig } from '@/lib/env-config'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  isAdmin: boolean
  adminLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [supabase] = useState(() => createClient())

  // Function to check admin status using secure RPC function
  const deriveAdminFromMetadata = useCallback((currentUser: User | null) => {
    if (!currentUser) return false
    const { user_metadata: userMeta = {}, email = '' } = currentUser
    const appMeta = (currentUser as User & { app_metadata?: Record<string, unknown> }).app_metadata ?? {}
    const userMetaData = userMeta as Record<string, any>
    const appMetaData = appMeta as Record<string, any>

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
      return
    }

    setAdminLoading(true)
    try {
      // Use secure RPC function that checks auth.users metadata
      const { data, error } = await supabase.rpc('is_user_admin_safe')
      
      if (error) {
        console.error('Error checking admin status, using metadata fallback:', error)
        setIsAdmin(deriveAdminFromMetadata(currentUser))
      } else {
        const adminFromRpc = typeof data === 'boolean' ? data : false
        const fallback = deriveAdminFromMetadata(currentUser)
        setIsAdmin(adminFromRpc || fallback) // Function returns boolean
      }
    } catch (error) {
      console.error('Error checking admin status, using metadata fallback:', error)
      setIsAdmin(deriveAdminFromMetadata(currentUser))
    } finally {
      setAdminLoading(false)
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
    })

    return () => subscription.unsubscribe()
  }, [supabase, checkAdminStatus])

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

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      adminLoading,
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
