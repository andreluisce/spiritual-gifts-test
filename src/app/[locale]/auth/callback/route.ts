import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    // Await params to access locale
    const { locale } = await params
    // Use 'pt' as fallback if locale is somehow missing/invalid, though middleware should handle it
    const currentLocale = locale || 'pt'

    // Destination after auth
    const next = searchParams.get('next') ?? `/${currentLocale}/dashboard`

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
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

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Optional: Collect demographics or perform other setup actions here
            // or rely on a middleware/redirect to prompt for it later.

            return NextResponse.redirect(new URL(next, request.url))
        }

        console.error('Auth code exchange error:', error)
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL(`/${currentLocale}/login?error=auth_code_error`, request.url))
}
