'use client'

import { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthError = { name: string; message: string }

type UserProfile = {
  id: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin'
}

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const getOrigin = () =>
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_SITE_URL ?? ''
    : window.location.origin

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      // For now, hardcode admin check based on email
      const user = await supabase.auth.getUser()
      const isAdminEmail = user.data.user?.email === 'andremluisce@gmail.com'
      
      return {
        ...data,
        role: isAdminEmail ? 'admin' as const : 'user' as const
      } as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [])

  useEffect(() => {
    mounted.current = true
      ; (async () => {
        const { data } = await supabase.auth.getSession()
        if (!mounted.current) return
        
        const session = data.session
        setSession(session ?? null)
        setUser(session?.user ?? null)
        
        if (session?.user?.id) {
          const userProfile = await fetchUserProfile(session.user.id)
          if (mounted.current) {
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      })()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, newSession) => {
        if (!mounted.current) return
        
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (newSession?.user?.id) {
          const userProfile = await fetchUserProfile(newSession.user.id)
          if (mounted.current) {
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted.current = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectTo =
        process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URI ||
        `${getOrigin()}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          // tokens mais estáveis do Google (evita login silencioso quebrado)
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })

      if (error) return { error: { name: error.name, message: error.message } }

      // Redireciono explicitamente (evita depender do popup)
      if (data?.url) window.location.assign(data.url)
      return { error: null }
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error('An unknown error occurred');
      return { error: { name: error.name, message: error.message } }
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!session?.user,
    isAdmin: profile?.role === 'admin',
    signInWithGoogle,
    signOut,
  }), [user, session, profile, loading, signInWithGoogle, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
