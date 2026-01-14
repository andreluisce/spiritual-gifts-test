import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { getGeolocationFromIP, getUserIP } from '@/lib/demographics'

type GeoPayload = {
  lat?: number
  lon?: number
}

export const runtime = 'nodejs'

/**
 * Auto-populate profile location fields using IP-based geolocation.
 * It only fills missing fields; existing values are preserved.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  let payload: GeoPayload = {}

  try {
    payload = await request.json()
  } catch {
    // no body is fine
  }

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

  // Require auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isPresent = (value?: string | null) => {
    if (!value) return false
    const lower = value.toLowerCase()
    return lower !== 'unknown' && lower !== 'n/a'
  }

  // Resolve IP and geo
  const ipAddress = getUserIP(request)
  const fallbackGeoFromHeaders = () => {
    const country =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country') ||
      ''
    const region =
      request.headers.get('x-vercel-ip-country-region') ||
      request.headers.get('x-region') ||
      ''
    const city =
      request.headers.get('x-vercel-ip-city') ||
      request.headers.get('x-city') ||
      ''

    if (country || region || city) {
      return {
        country: country || 'Unknown',
        region: region || '',
        city: city || '',
        timezone: ''
      }
    }
    return null
  }

  let geolocation = null
  let geoSource: 'ipapi' | 'headers' | 'browser' = 'ipapi'

  // Prefer browser-provided coordinates when available
  if (payload.lat && payload.lon) {
    try {
      const reverseUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${payload.lat}&longitude=${payload.lon}&localityLanguage=en`
      const resp = await fetch(reverseUrl)
      if (resp.ok) {
        const data = await resp.json()
        geolocation = {
          country: data.countryName || data.countryCode || data.localityInfo?.administrative?.[0]?.isoName || 'Unknown',
          region: data.principalSubdivision || data.localityInfo?.administrative?.[0]?.name || '',
          city: data.city || data.locality || '',
          timezone: data.timezone || ''
        }
        geoSource = 'browser'
      } else {
        console.warn('[auto-locate] reverse geocode failed', resp.status)
      }
    } catch (error) {
      console.error('[auto-locate] reverse geocode error', error)
    }
  }

  if (!geolocation) {
    geolocation = await getGeolocationFromIP(ipAddress)
    geoSource = 'ipapi'
  }

  if (!geolocation) {
    geolocation = fallbackGeoFromHeaders()
    geoSource = geolocation ? 'headers' : 'ipapi'
  }

  if (!geolocation) {
    return NextResponse.json(
      { updated: false, reason: 'geolocation-unavailable' },
      { status: 200 }
    )
  }

  // Fetch current profile so we don't overwrite existing fields
  const { data: currentProfile, error: profileError } = await supabase.rpc('get_user_profile')
  if (profileError) {
    console.error('auto-locate: failed to read profile', profileError)
  }

  // Type assertion for the profile data
  type ProfileData = {
    country?: string | null;
    city?: string | null;
    state_province?: string | null;
    birth_date?: string | null;
    age_range?: string | null;
  }

  const profile = currentProfile as ProfileData | null

  const country = isPresent(profile?.country) ? profile?.country : geolocation.country
  const city = isPresent(profile?.city) ? profile?.city : geolocation.city
  const state = isPresent(profile?.state_province) ? profile?.state_province : geolocation.region

  // Nothing new to update
  if (
    isPresent(profile?.country) &&
    isPresent(profile?.city) &&
    isPresent(profile?.state_province)
  ) {
    return NextResponse.json({
      updated: false,
      reason: 'already-populated',
      location: {
        country: profile?.country ?? 'Unknown',
        state: profile?.state_province ?? '',
        city: profile?.city ?? ''
      }
    })
  }

  const { error: updateError } = await supabase.rpc('upsert_user_profile', {
    p_country: country || undefined,
    p_city: city || undefined,
    p_state_province: state || undefined,
    p_birth_date: profile?.birth_date || undefined,
    p_age_range: profile?.age_range || undefined
  })

  if (updateError) {
    console.error('auto-locate: failed to upsert profile', updateError)
    return NextResponse.json({ updated: false, error: 'failed-to-update' }, { status: 500 })
  }

  return NextResponse.json({
    updated: true,
    location: { country: country ?? undefined, state: state ?? undefined, city: city ?? undefined },
    source: geoSource,
    ipAddress
  })
}
