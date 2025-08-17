import createMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { staticRouting, isValidLocale } from './i18n/dynamic-routing';

// Create static middleware - use static routing for better Edge Runtime compatibility
const intlMiddleware = createMiddleware(staticRouting);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set(name, value, options)
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    );

    // Refresh session and get user
    const { data: { user } } = await supabase.auth.getUser();

    // Check if this is an auth callback (just need code parameter)
    const isAuthCallback = request.nextUrl.searchParams.has('code');

    // Skip static files and assets
    const isStaticFile = request.nextUrl.pathname.includes('.') &&
      !request.nextUrl.pathname.includes('/api/');

    // Public routes and auth callbacks don't need authentication
    const publicRoutes = ['/login'];
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname.includes(route)
    );

    // Use static default language for Edge Runtime compatibility
    const defaultLanguage = staticRouting.defaultLocale;

    // If accessing any route (except public, static files, or auth callback) without authentication, redirect to login
    if (!isPublicRoute && !isAuthCallback && !isStaticFile && !user) {
      const pathLocale = request.nextUrl.pathname.split('/')[1];
      const locale = isValidLocale(pathLocale) ? pathLocale : defaultLanguage;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Handle root path redirect to default language
    if (request.nextUrl.pathname === '/') {
      const redirectUrl = new URL(`/${defaultLanguage}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Apply internationalization middleware
    return intlMiddleware(request);
  } catch (error) {
    console.error('Error in middleware:', error);
    // Fallback to static middleware if there's an error
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico|.*\\.).*)']
};