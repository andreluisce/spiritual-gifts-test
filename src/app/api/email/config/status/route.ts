import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

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
            try {
              cookieStore.set({ name, value, ...options })
            } catch {
              // Handle setting cookies during initial request
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch {
              // Handle removing cookies during initial request
            }
          },
        },
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check email service configuration
    const hasResendApiKey = !!process.env.RESEND_API_KEY
    const hasFromEmail = !!process.env.RESEND_FROM_EMAIL
    const isConfigured = hasResendApiKey && hasFromEmail

    const config = {
      isConfigured,
      hasResendApiKey,
      hasFromEmail,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@spiritualgifts.app',
      // Don't expose the actual API key for security
      apiKeyConfigured: hasResendApiKey,
      provider: 'Resend'
    }

    return NextResponse.json({
      success: true,
      config
    })

  } catch (error) {
    console.error('❌ Email config status error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}