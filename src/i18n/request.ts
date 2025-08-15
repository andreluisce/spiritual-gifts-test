// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { getDynamicRouting, staticRouting, getSupportedLocales } from './dynamic-routing';
import { getDefaultLanguage } from '@/lib/server-settings';

export default getRequestConfig(async ({ requestLocale }) => {
  try {
    const requested = await requestLocale;
    const supportedLocales = getSupportedLocales();
    const defaultLanguage = await getDefaultLanguage();
    
    // Check if requested locale is supported
    const locale = hasLocale(supportedLocales, requested)
      ? requested
      : defaultLanguage;

    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default
    };
  } catch (error) {
    console.error('Error in request config:', error);
    
    // Fallback to static configuration
    const requested = await requestLocale;
    const locale = hasLocale(staticRouting.locales, requested)
      ? requested
      : staticRouting.defaultLocale;

    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default
    };
  }
});
