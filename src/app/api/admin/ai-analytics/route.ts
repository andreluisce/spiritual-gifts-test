import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'

// GET endpoint to retrieve AI analytics data (admin only)
export async function GET(request: NextRequest) {
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

    // Check if user is admin using our database function
    const { data: isAdminData, error: adminError } = await supabase
      .rpc('is_user_admin_safe')
    
    if (adminError || !isAdminData) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }


    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    let data = {}

    switch (type) {
      case 'overview':
        const { data: overviewStats, error: overviewError } = await supabase
          .rpc('get_ai_usage_stats')

        if (overviewError) {
          console.error('❌ AI Analytics API: Error fetching overview stats:', overviewError)
          return NextResponse.json({ error: 'Failed to fetch overview stats' }, { status: 500 })
        }

        data = {
          overview: overviewStats?.[0] || {
            total_analyses: 0,
            cache_hits: 0,
            api_calls: 0,
            unique_users: 0,
            analyses_today: 0,
            analyses_this_week: 0,
            analyses_this_month: 0,
            avg_confidence_score: 0,
            most_analyzed_gift: 'N/A',
            cache_hit_rate: 0
          }
        }
        break

      case 'timeline':
        const { data: timelineData, error: timelineError } = await supabase
          .rpc('get_ai_usage_timeline')

        if (timelineError) {
          console.error('❌ AI Analytics API: Error fetching timeline:', timelineError)
          return NextResponse.json({ error: 'Failed to fetch timeline data' }, { status: 500 })
        }

        data = { timeline: timelineData || [] }
        break

      case 'by-gift':
        const { data: giftData, error: giftError } = await supabase
          .rpc('get_ai_analysis_by_gift')

        if (giftError) {
          console.error('❌ AI Analytics API: Error fetching gift breakdown:', giftError)
          return NextResponse.json({ error: 'Failed to fetch gift breakdown' }, { status: 500 })
        }

        data = { byGift: giftData || [] }
        break

      case 'recent-activity':
        const limit = parseInt(searchParams.get('limit') || '10')
        const { data: activityData, error: activityError } = await supabase
          .rpc('get_recent_ai_activity', { limit_count: limit })

        if (activityError) {
          console.error('❌ AI Analytics API: Error fetching recent activity:', activityError)
          return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 })
        }

        data = { recentActivity: activityData || [] }
        break

      case 'system-status':
        const { data: statusData, error: statusError } = await supabase
          .rpc('get_ai_system_status')

        if (statusError) {
          console.error('❌ AI Analytics API: Error fetching system status:', statusError)
          return NextResponse.json({ error: 'Failed to fetch system status' }, { status: 500 })
        }

        data = { systemStatus: statusData?.[0] || {} }
        break

      case 'all':
        // Fetch all data types
        const [overviewResult, timelineResult, giftResult, activityResult, statusResult] = await Promise.allSettled([
          supabase.rpc('get_ai_usage_stats'),
          supabase.rpc('get_ai_usage_timeline'),
          supabase.rpc('get_ai_analysis_by_gift'),
          supabase.rpc('get_recent_ai_activity', { limit_count: 5 }),
          supabase.rpc('get_ai_system_status')
        ])

        data = {
          overview: overviewResult.status === 'fulfilled' && overviewResult.value.data?.[0] || {},
          timeline: timelineResult.status === 'fulfilled' && timelineResult.value.data || [],
          byGift: giftResult.status === 'fulfilled' && giftResult.value.data || [],
          recentActivity: activityResult.status === 'fulfilled' && activityResult.value.data || [],
          systemStatus: statusResult.status === 'fulfilled' && statusResult.value.data?.[0] || {}
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    )
  }
}