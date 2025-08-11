import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const intl = createMiddleware(routing);

// Rotas públicas (sem exigir sessão)
const PUBLIC_SEGMENTS = new Set(['login']);

// Rotas que requerem admin
const ADMIN_SEGMENTS = new Set(['admin']);

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();


  const { pathname } = req.nextUrl;          // ex: "/en/gifts"
  const [, maybeLocale, ...rest] = pathname.split('/');
  const locale = routing.locales.includes(maybeLocale as typeof routing.locales[number])
    ? maybeLocale
    : routing.defaultLocale;
  const segment = rest.join('/');          // ex: "gifts", "" (home), "login", etc.

  // 3) Supabase SSR (API nova: getAll/setAll)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        })
      }
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  console.log(`Middleware: ${pathname} | segment: "${segment}" | session: ${!!session}`);

  // Check if user is admin for admin routes
  let isAdmin = false;
  if (session && ADMIN_SEGMENTS.has(segment)) {
    // For now, hardcode admin check based on email
    isAdmin = session.user.email === 'andremluisce@gmail.com';
  }

  // 4) Regras
  // 4a) Se não logado e NÃO for página pública => manda pra login
  if (!session && !PUBLIC_SEGMENTS.has(segment)) {
    console.log(`Redirecting to login: segment "${segment}" not in public segments`);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // 4a1) Se logado mas não é admin e tenta acessar rota admin => manda pra dashboard
  if (session && ADMIN_SEGMENTS.has(segment) && !isAdmin) {
    console.log(`Redirecting to dashboard: user is not admin`);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // 4a2) Se não logado e estiver na home => manda pra login
  if (!session && segment === '') {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // 4b) Se logado e estiver em /:locale/login => manda pra dashboard
  if (session && segment === 'login') {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // 5) i18n negotiation (ex.: / → /pt) - só depois da auth
  const intlRes = intl(req);
  if (intlRes) return intlRes;

  return res;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
