import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  console.log('📧 Welcome Email API: Request received')
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
    
    // Allow system calls for new user registration
    const isSystemCall = request.headers.get('x-system-call') === 'true'
    
    if (!isSystemCall && (authError || !user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    let { userName, userEmail } = body

    // If no explicit data provided, use current user
    if (!userName || !userEmail) {
      if (!user) {
        return NextResponse.json({ 
          error: 'User data required when not authenticated' 
        }, { status: 400 })
      }
      
      userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
      userEmail = user.email!
    }

    console.log('📧 Welcome Email API: Sending welcome email to:', userEmail)

    // Send welcome email
    const result = await emailService.sendWelcomeEmail(userName, userEmail)

    if (result.success) {
      console.log('✅ Welcome Email API: Welcome email sent successfully')
      
      // Log email in database (optional)
      if (user) {
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'email_sent',
            activity_data: {
              type: 'welcome',
              email_id: result.id,
              sent_to: userEmail
            }
          })
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
        emailId: result.id
      })
    } else {
      console.error('❌ Welcome Email API: Failed to send email:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

  } catch (error) {
    console.error('Welcome Email API Error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}