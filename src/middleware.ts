import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
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

  // If accessing any route (except public, static files, or auth callback) without authentication, redirect to login
  if (!isPublicRoute && !isAuthCallback && !isStaticFile && !user) {
    const locale = request.nextUrl.pathname.split('/')[1] || 'pt';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico|.*\\.).*)']
};