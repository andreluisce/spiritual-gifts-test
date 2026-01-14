import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { DEFAULT_SETTINGS } from '@/lib/system-settings-defaults'

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

    // Result might be null if not initialized, return default
    return NextResponse.json(settings && Object.keys(settings).length > 0 ? settings : DEFAULT_SETTINGS)



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
    const cleanBody = JSON.parse(JSON.stringify(body || {}))

    // Merge with defaults to avoid missing keys
    const payload = {
      ...DEFAULT_SETTINGS,
      ...cleanBody,
      quiz: { ...DEFAULT_SETTINGS.quiz, ...(cleanBody.quiz || {}) },
      general: { ...DEFAULT_SETTINGS.general, ...(cleanBody.general || {}) },
      ai: { ...DEFAULT_SETTINGS.ai, ...(cleanBody.ai || {}) }
    }

    // Use service role to bypass RLS and persist settings
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!serviceKey || !serviceUrl) {
      return NextResponse.json({ error: 'Missing service credentials' }, { status: 500 })
    }

    const adminClient = createClient<Database>(serviceUrl, serviceKey)

    const { data: updatedSettings, error: updateError } = await adminClient
      .from('system_settings')
      .upsert(
        {
          key: 'APP_SETTINGS',
          value: payload,
          settings: payload,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )
      .select('value')
      .single()

    if (updateError) {
      console.error('❌ Settings API: Error updating settings:', updateError)
      return NextResponse.json({
        error: 'Failed to update settings',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json(updatedSettings?.value || payload)

  } catch (error) {
    console.error('Settings API PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings', details: (error as Error)?.message },
      { status: 500 }
    )
  }
}
