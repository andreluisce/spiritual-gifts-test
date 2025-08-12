'use client'

import { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/lib/supabase'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      // Get user data from auth metadata (Google OAuth data)
      const { data: authUser } = await supabase.auth.getUser()

      if (!authUser.user) {
        return null
      }

      const userRole = authUser.user.user_metadata?.role === 'admin' ? 'admin' : 'user'

      // Use auth user metadata directly
      const profileData = {
        id: userId,
        full_name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || null,
        avatar_url: authUser.user.user_metadata?.avatar_url || authUser.user.user_metadata?.picture || null,
        role: userRole as 'admin' | 'user'
      }

      return profileData as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }, [supabase])

  useEffect(() => {
        mounted.current = true

        const fetchUser = async () => {
            setLoading(true)
            const timeoutId = setTimeout(() => {
                if (mounted.current) {
                    setLoading(false); // Force loading to false after timeout
                }
            }, 5000); // 5 seconds timeout

            try {
                const { data: { session } } = await supabase.auth.getSession()
                const { data: { user } } = await supabase.auth.getUser()

                if (!mounted.current) return

                setSession(session ?? null)
                setUser(user ?? null)

                if (user?.id) {
                    const userProfile = await fetchUserProfile(user.id)
                    if (mounted.current) {
                        setProfile(userProfile)
                    }
                } else {
                    setProfile(null)
                }
            } finally {
                clearTimeout(timeoutId); // Clear timeout if operation completes
                if (mounted.current) {
                    console.log('AuthContext: Setting loading to false (fetchUser)');
                    setLoading(false);
                }
            }
        }

        fetchUser()

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted.current) return

                setLoading(true)
                const timeoutId = setTimeout(() => {
                    if (mounted.current) {
                        setLoading(false); // Force loading to false after timeout
                    }
                }, 5000); // 5 seconds timeout

                try {
                    const { data: { user } } = await supabase.auth.getUser()

                    setSession(session ?? null)
                    setUser(user ?? null)

                    if (user?.id) {
                        const userProfile = await fetchUserProfile(user.id)
                        if (mounted.current) {
                            setProfile(userProfile)
                        }
                    } else {
                        setProfile(null)
                    }
                } finally {
                    clearTimeout(timeoutId); // Clear timeout if operation completes
                    if (mounted.current) {
                        console.log('AuthContext: Setting loading to false (onAuthStateChange)');
                        setLoading(false);
                    }
                }
            }
        )

        return () => {
            mounted.current = false
            listener.subscription.unsubscribe()
        }
    }, [fetchUserProfile, supabase])

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectTo = process.env.NEXT_PUBLIC_SITE_URL + '/dashboard'

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
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

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
