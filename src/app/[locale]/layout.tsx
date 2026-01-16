import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/toast';
import { AppHeader } from '@/components/AppHeader';
import { LangSetter } from '@/components/LangSetter';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { routing } from '@/i18n/routing';
import '../globals.css';

// Force dynamic rendering for all locale routes since they use authentication
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;   // ✅ await it
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LangSetter locale={locale} />
      <AuthProvider>
        <QueryProvider>
          <ToastProvider>
            <AnalyticsProvider>
              <AppHeader />
              <main className="min-h-screen">
                {children}
              </main>
            </AnalyticsProvider>
          </ToastProvider>
        </QueryProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
