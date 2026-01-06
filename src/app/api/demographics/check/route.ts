import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Check if a user has demographics data
 * GET /api/demographics/check?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

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

    // Check if user has any demographics data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('age_range, country, city, state_province')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error checking demographics:', error)
      return NextResponse.json(
        { hasDemographics: false },
        { status: 200 }
      )
    }

    // Consider user has demographics if they have at least country or age_range
    const hasDemographics = !!(profile?.country || profile?.age_range)

    return NextResponse.json({
      hasDemographics,
      profile: hasDemographics ? profile : null
    })
  } catch (error) {
    console.error('Error in demographics check endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', hasDemographics: false },
      { status: 500 }
    )
  }
}
