'use client'

import { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthError = { name: string; message: string }

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
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
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
      ; (async () => {
        const { data } = await supabase.auth.getSession()
        if (!mounted.current) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        setLoading(false)
      })()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, newSession) => {
        if (!mounted.current) return
        setSession(newSession)
        setUser(newSession?.user ?? null)
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
    loading,
    isAuthenticated: !!session?.user,
    signInWithGoogle,
    signOut,
  }), [user, session, loading, signInWithGoogle, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
