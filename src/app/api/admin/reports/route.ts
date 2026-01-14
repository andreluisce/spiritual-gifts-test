import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'

// GET endpoint to retrieve generated reports list
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

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is manager or admin
    const { data: isAllowed, error: adminError } = await supabase
      .rpc('is_user_manager')

    if (adminError || !isAllowed) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
    }

    // Clean up expired reports first
    await supabase.rpc('cleanup_expired_reports')

    // Get all reports ordered by creation date
    const { data: reports, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Reports API: Error fetching reports:', error)
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reports: reports || []
    })

  } catch (error) {
    console.error('Reports API GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve reports' },
      { status: 500 }
    )
  }
}

// POST endpoint to generate a new report
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

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is manager or admin
    const { data: isAllowed, error: adminError } = await supabase
      .rpc('is_user_manager')

    if (adminError || !isAllowed) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const {
      title,
      description,
      reportType = 'comprehensive',
      format = 'json',
      dateRange = '30d'
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }


    // Get comprehensive analytics data
    const { data: analyticsData, error: dataError } = await supabase
      .rpc('get_comprehensive_analytics_data', { p_date_range: dateRange })

    if (dataError) {
      console.error('❌ Reports API: Error fetching analytics data:', dataError)
      return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
    }

    // Create report record
    const reportData = {
      title,
      description: description || `${reportType} report for ${dateRange}`,
      report_type: reportType,
      format,
      date_range: dateRange,
      data: analyticsData || {},
      generated_by: user.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      file_size: JSON.stringify(analyticsData || {}).length
    }

    const { data: newReport, error: insertError } = await supabase
      .from('analytics_reports')
      .insert(reportData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Reports API: Error creating report:', insertError)
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report: newReport
    })

  } catch (error) {
    console.error('Reports API POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove a report
export async function DELETE(request: NextRequest) {
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

    // Check if user is manager or admin
    const { data: isAllowed, error: adminError } = await supabase
      .rpc('is_user_manager')

    if (adminError || !isAllowed) {
      return NextResponse.json({ error: 'Manager access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('analytics_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      console.error('❌ Reports API: Error deleting report:', error)
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Reports API DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}