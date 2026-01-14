import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Sync profile role with auth metadata (admin/manager only).
 * Uses service role key to update the profiles table so get_user_role returns the correct value.
 */
export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const desiredRoleRaw =
    (user.app_metadata?.role as string | undefined) ||
    (user.user_metadata?.role as string | undefined)

  const desiredRole = desiredRoleRaw === 'admin' || desiredRoleRaw === 'manager'
    ? desiredRoleRaw
    : null

  if (!desiredRole) {
    return NextResponse.json({ updated: false, reason: 'no-privileged-role-in-metadata' })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey || !serviceUrl) {
    return NextResponse.json({ updated: false, error: 'service-key-missing' }, { status: 500 })
  }

  const adminClient = createClient<Database>(serviceUrl, serviceKey)

  // Update profiles.role + permissions using service key to bypass RLS
  const { error } = await adminClient
    .from('profiles')
    .update({
      role: desiredRole,
      permissions: desiredRole === 'admin'
        ? ['analytics', 'users_read', 'users_write', 'system_admin']
        : ['analytics', 'users_read'],
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('[sync-role] failed to update profile', error)
    return NextResponse.json({ updated: false, error: 'failed-to-update' }, { status: 500 })
  }

  return NextResponse.json({ updated: true, role: desiredRole })
}
