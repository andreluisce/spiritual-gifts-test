import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { collectUserDemographics, getUserIP } from '@/lib/demographics'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {

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

    // Get user's IP address
    const ipAddress = getUserIP(request)

    // Get user metadata from auth
    const rawUserMetaData = user.user_metadata || {}

    // Collect demographics data
    const demographicsData = await collectUserDemographics(ipAddress, rawUserMetaData)

    // Store in database using our RPC function
    const { data: result, error: dbError } = await supabase.rpc('upsert_user_demographics', {
      p_user_id: user.id,
      p_country: demographicsData.country,
      p_region: demographicsData.region,
      p_city: demographicsData.city,
      p_birth_year: demographicsData.birthYear,
      p_gender: demographicsData.gender
    })

    if (dbError) {
      console.error('❌ Error storing demographics data:', dbError)
      return NextResponse.json({ error: 'Failed to store demographics data' }, { status: 500 })
    }


    return NextResponse.json({
      success: true,
      demographics: result,
      collected: {
        country: demographicsData.country,
        age: demographicsData.age,
        hasLocation: !!demographicsData.country && demographicsData.country !== 'Unknown',
        hasAge: !!demographicsData.age
      }
    })

  } catch (error) {
    console.error('❌ Demographics Collection API Error:', error)
    return NextResponse.json(
      { error: 'Failed to collect demographics' },
      { status: 500 }
    )
  }
}