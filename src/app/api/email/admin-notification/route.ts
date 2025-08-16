import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { emailService, AdminNotificationData } from '@/lib/email'

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  console.log('📧 Admin Notification API: Request received')
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

    // Check authentication (can be called by system or admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Allow system calls without authentication for internal notifications
    const isSystemCall = request.headers.get('x-system-call') === 'true'
    
    if (!isSystemCall && (authError || !user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { type, userName, userEmail, details } = body

    if (!type || !userName || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, userName, userEmail' 
      }, { status: 400 })
    }

    const validTypes = ['new_user', 'quiz_completed', 'report_generated', 'system_alert']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    console.log('📧 Admin Notification API: Sending notification...', { type, userName })

    // Prepare notification data
    const notificationData: AdminNotificationData = {
      type,
      userName,
      userEmail,
      details: details || {},
      timestamp: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    // Send notification email
    const result = await emailService.sendAdminNotification(notificationData)

    if (result.success) {
      console.log('✅ Admin Notification API: Notification sent successfully')
      
      // Log notification in database (optional)
      if (user) {
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'admin_notification_sent',
            activity_data: {
              notification_type: type,
              target_user: userEmail,
              email_id: result.success ? (result as { success: true; id: string }).id : null
            }
          })
      }

      return NextResponse.json({
        success: true,
        message: 'Admin notification sent successfully',
        emailId: (result as { success: true; id: string }).id
      })
    } else {
      console.error('❌ Admin Notification API: Failed to send notification:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

  } catch (error) {
    console.error('Admin Notification API Error:', error)
    return NextResponse.json(
      { error: 'Failed to send admin notification' },
      { status: 500 }
    )
  }
}