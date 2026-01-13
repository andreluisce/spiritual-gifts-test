import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { staticRouting } from './i18n/dynamic-routing'

// Minimal middleware: only i18n and root redirect.
const intlMiddleware = createMiddleware(staticRouting)

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const redirectUrl = new URL(`/${staticRouting.defaultLocale}`, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico|.*\\.).*)']
}
