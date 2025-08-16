'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
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

  // Function to check admin status using the database
  const checkAdminStatus = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false)
      return
    }

    setAdminLoading(true)
    try {
      const { data: isAdminData, error } = await supabase.rpc('is_admin_user')
      
      if (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } else {
        setIsAdmin(!!isAdminData)
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
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      // Check admin status for the initial user
      await checkAdminStatus(user)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      setLoading(false)
      
      // Check admin status when user changes
      await checkAdminStatus(newUser)
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
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/dashboard`
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
