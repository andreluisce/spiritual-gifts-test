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
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(!!data) // Function returns boolean
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setAdminLoading(false)
    }
  }, [supabase])

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
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: authCallbackUrl(locale)
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false) // Reset admin status on signout
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
