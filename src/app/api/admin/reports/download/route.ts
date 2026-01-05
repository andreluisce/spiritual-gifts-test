import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

interface ReportData {
  overview?: Record<string, string | number>
  spiritualGifts?: Array<{
    giftKey: string
    giftName: string
    count: number
    percentage: number
  }>
  aiAnalytics?: Record<string, string | number>
  userStatistics?: Record<string, string | number>
  metadata?: Record<string, string | number>
}

interface ReportRecord {
  id: string
  title: string
  description: string | null
  report_type: string
  date_range: string
  created_at: string
  download_count: number
  result: ReportData // Changed from data to result to match DB
}

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'

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

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    const format = searchParams.get('format') || 'json'

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // Get report data
    const { data: report, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (error || !report) {
      console.error('❌ Reports Download API: Report not found:', error)
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Record download
    await supabase.rpc('record_report_download', { p_report_id: reportId })

    // Format data based on requested format
    let content: string
    let contentType: string
    let fileName: string

    const timestamp = new Date().toISOString().split('T')[0]
    const baseFileName = `analytics-report-${report.report_type}-${timestamp}`

    switch (format.toLowerCase()) {
      case 'csv':
        content = formatAsCSV(report.result as unknown as ReportData)
        contentType = 'text/csv'
        fileName = `${baseFileName}.csv`
        break

      case 'json':
        content = JSON.stringify(report.result, null, 2)
        contentType = 'application/json'
        fileName = `${baseFileName}.json`
        break

      case 'txt':
        content = formatAsText(report.result as unknown as ReportData, report as unknown as ReportRecord)
        contentType = 'text/plain'
        fileName = `${baseFileName}.txt`
        break

      default:
        content = JSON.stringify(report.result, null, 2)
        contentType = 'application/json'
        fileName = `${baseFileName}.json`
    }


    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': content.length.toString()
      }
    })

  } catch (error) {
    console.error('Reports Download API Error:', error)
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    )
  }
}

function formatAsCSV(data: ReportData): string {
  const lines: string[] = []

  // Add header
  lines.push('Analytics Report CSV Export')
  lines.push(`Generated at: ${new Date().toISOString()}`)
  lines.push('')

  // Overview section
  if (data.overview) {
    lines.push('=== OVERVIEW ===')
    lines.push('Metric,Value')
    Object.entries(data.overview).forEach(([key, value]) => {
      lines.push(`${key},${value}`)
    })
    lines.push('')
  }

  // Spiritual Gifts section
  if (data.spiritualGifts && Array.isArray(data.spiritualGifts)) {
    lines.push('=== SPIRITUAL GIFTS DISTRIBUTION ===')
    lines.push('Gift Key,Gift Name,Count,Percentage')
    data.spiritualGifts.forEach((gift) => {
      lines.push(`${gift.giftKey},${gift.giftName},${gift.count},${gift.percentage}`)
    })
    lines.push('')
  }

  // AI Analytics section
  if (data.aiAnalytics) {
    lines.push('=== AI ANALYTICS ===')
    lines.push('Metric,Value')
    Object.entries(data.aiAnalytics).forEach(([key, value]) => {
      lines.push(`${key},${value}`)
    })
    lines.push('')
  }

  // User Statistics section
  if (data.userStatistics) {
    lines.push('=== USER STATISTICS ===')
    lines.push('Metric,Value')
    Object.entries(data.userStatistics).forEach(([key, value]) => {
      lines.push(`${key},${value}`)
    })
  }

  return lines.join('\n')
}

function formatAsText(data: ReportData, report: ReportRecord): string {
  const lines: string[] = []

  // Header
  lines.push('SPIRITUAL GIFTS ANALYTICS REPORT')
  lines.push('='.repeat(50))
  lines.push('')
  lines.push(`Report Title: ${report.title}`)
  lines.push(`Description: ${report.description || 'N/A'}`)
  lines.push(`Report Type: ${report.report_type}`)
  lines.push(`Date Range: ${report.date_range}`)
  lines.push(`Generated: ${new Date(report.created_at).toLocaleString()}`)
  lines.push(`Downloads: ${report.download_count}`)
  lines.push('')

  // Overview
  if (data.overview) {
    lines.push('OVERVIEW STATISTICS')
    lines.push('-'.repeat(30))
    Object.entries(data.overview).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      lines.push(`${formattedKey}: ${value}`)
    })
    lines.push('')
  }

  // Spiritual Gifts
  if (data.spiritualGifts && Array.isArray(data.spiritualGifts)) {
    lines.push('SPIRITUAL GIFTS DISTRIBUTION')
    lines.push('-'.repeat(35))
    data.spiritualGifts.forEach((gift, index: number) => {
      lines.push(`${index + 1}. ${gift.giftName}`)
      lines.push(`   Count: ${gift.count}`)
      lines.push(`   Percentage: ${gift.percentage}%`)
      lines.push('')
    })
  }

  // AI Analytics
  if (data.aiAnalytics) {
    lines.push('AI ANALYTICS')
    lines.push('-'.repeat(20))
    Object.entries(data.aiAnalytics).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      lines.push(`${formattedKey}: ${value}`)
    })
    lines.push('')
  }

  // User Statistics
  if (data.userStatistics) {
    lines.push('USER STATISTICS')
    lines.push('-'.repeat(20))
    Object.entries(data.userStatistics).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      lines.push(`${formattedKey}: ${value}`)
    })
    lines.push('')
  }

  // Metadata
  if (data.metadata) {
    lines.push('REPORT METADATA')
    lines.push('-'.repeat(20))
    Object.entries(data.metadata).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      lines.push(`${formattedKey}: ${value}`)
    })
  }

  lines.push('')
  lines.push('='.repeat(50))
  lines.push('Report generated by Spiritual Gifts Test Admin System')

  return lines.join('\n')
}