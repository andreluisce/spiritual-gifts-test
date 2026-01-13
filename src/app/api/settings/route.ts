import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'

// GET endpoint to retrieve system settings
export async function GET() {
  try {
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get system settings using RPC
    const { data: settings, error: settingsError } = await supabase
      .rpc('get_system_settings')

    if (settingsError) {
      console.error('❌ Settings API: Error fetching settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Result might be null if not initialized, return empty object or default
    return NextResponse.json(settings || {})



  } catch (error) {
    console.error('Settings API GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    )
  }
}

// PUT endpoint to update system settings (admin only)
export async function PUT(request: NextRequest) {
  try {
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

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Update settings using RPC (handles admin check)
    const { data: updatedSettings, error: updateError } = await supabase
      .rpc('update_system_settings', { new_settings: body })

    if (updateError) {
      console.error('❌ Settings API: Error updating settings:', updateError)
      return NextResponse.json({
        error: 'Failed to update settings',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json(updatedSettings)

  } catch (error) {
    console.error('Settings API PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}