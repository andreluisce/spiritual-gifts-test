import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { staticRouting, getDynamicRouting, isValidLocale } from './i18n/dynamic-routing';
import { getDefaultLanguage } from './lib/server-settings';

// Create static middleware as fallback
const staticIntlMiddleware = createMiddleware(staticRouting);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Get dynamic routing configuration
    const dynamicRouting = await getDynamicRouting();
    const intlMiddleware = createMiddleware(dynamicRouting);
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
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

    // Get default language from database for redirects
    const defaultLanguage = await getDefaultLanguage();

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
    return staticIntlMiddleware(request);
  }
}

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico|.*\\.).*)']
};