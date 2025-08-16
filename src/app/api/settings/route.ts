import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// GET endpoint to retrieve system settings
export async function GET(request: NextRequest) {
  console.log('🔧 Settings API: GET request received')
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
    console.log('🔐 Settings API: Checking authentication...')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.log('❌ Settings API: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Settings API: User authenticated:', session.user.id)

    // Get system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('settings')
      .eq('id', 1)
      .single()

    if (settingsError) {
      console.error('❌ Settings API: Error fetching settings:', settingsError)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    console.log('✅ Settings API: Settings retrieved successfully')
    return NextResponse.json(settings.settings)

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
  console.log('🔧 Settings API: PUT request received')
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
    console.log('🔐 Settings API: Checking admin authentication...')
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.log('❌ Settings API: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      console.log('❌ Settings API: Non-admin user attempted to update settings')
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('✅ Settings API: Admin user authenticated:', session.user.id)

    // Parse request body
    const body = await request.json()
    console.log('📥 Settings API: Update data received')

    // Update settings
    const { data: updatedSettings, error: updateError } = await supabase
      .from('system_settings')
      .update({ 
        settings: body,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select('settings')
      .single()

    if (updateError) {
      console.error('❌ Settings API: Error updating settings:', updateError)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    console.log('✅ Settings API: Settings updated successfully')
    return NextResponse.json(updatedSettings.settings)

  } catch (error) {
    console.error('Settings API PUT Error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}