import createMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { staticRouting, isValidLocale } from './i18n/dynamic-routing';

// Runtime will be automatically handled by Vercel

// Create static middleware - use static routing for better Edge Runtime compatibility
const intlMiddleware = createMiddleware(staticRouting);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Skip processing for specific routes to avoid infinite loops
    const pathname = request.nextUrl.pathname;
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticFile = pathname.includes('.') && !isApiRoute;
    const isSpecialRoute = pathname.includes('/_next/') || 
                          pathname.includes('/favicon.ico') ||
                          pathname.includes('/robots.txt') ||
                          pathname.includes('/sitemap.xml');

    if (isStaticFile || isSpecialRoute) {
      return response;
    }

    // Create Supabase client with better error handling
    let user = null;
    try {
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

      // Get user with timeout to prevent hanging
      const { data: { user: authUser } } = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 3000)
        )
      ]) as { data: { user: unknown } };
      
      user = authUser;
    } catch (authError) {
      console.error('Auth check failed in middleware:', authError);
      // Continue without user to allow public routes
    }

    // Check if this is an auth callback (just need code parameter)
    const isAuthCallback = request.nextUrl.searchParams.has('code');


    // Public routes and auth callbacks don't need authentication
    const publicRoutes = ['/login', '/auth/callback', '/gifts'];
    const isPublicRoute = publicRoutes.some(route =>
      request.nextUrl.pathname.includes(route)
    );
    
    // Protected routes that absolutely require authentication
    const protectedRoutes = ['/dashboard', '/profile', '/quiz', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route =>
      request.nextUrl.pathname.includes(route)
    );

    // Allow access to dashboard when coming from auth callback or with fresh session
    const isDashboardAfterAuth = request.nextUrl.pathname.includes('/dashboard') && 
      (isAuthCallback || request.nextUrl.searchParams.has('access_token') || request.nextUrl.searchParams.has('refresh_token'));
      
    // Check if user is accessing login while already authenticated
    const isLoginWhileAuthenticated = user && request.nextUrl.pathname.includes('/login');

    // Use static default language for Edge Runtime compatibility
    const defaultLanguage = staticRouting.defaultLocale;

    // If user is authenticated but trying to access login, redirect to dashboard
    if (isLoginWhileAuthenticated) {
      const pathLocale = request.nextUrl.pathname.split('/')[1];
      const locale = isValidLocale(pathLocale) ? pathLocale : defaultLanguage;
      const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Force redirect to login for protected routes without authentication
    if (isProtectedRoute && !user && !isAuthCallback) {
      const pathLocale = request.nextUrl.pathname.split('/')[1];
      const locale = isValidLocale(pathLocale) ? pathLocale : defaultLanguage;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If accessing any other route (except public, static files, auth callback, or dashboard after auth) without authentication, redirect to login
    if (!isPublicRoute && !isAuthCallback && !isStaticFile && !isDashboardAfterAuth && !user) {
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
