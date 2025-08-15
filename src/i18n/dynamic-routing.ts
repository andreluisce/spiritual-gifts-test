// src/i18n/dynamic-routing.ts
import { defineRouting } from 'next-intl/routing'
import { getDefaultLanguage } from '@/lib/server-settings'

// Static routing configuration for fallback
export const staticRouting = defineRouting({
  locales: ['en', 'pt', 'es'],
  defaultLocale: 'pt'
})

// Dynamic routing function that gets default language from database
export async function getDynamicRouting() {
  try {
    const defaultLanguage = await getDefaultLanguage()
    
    // Validate that the default language is supported
    const supportedLocales = ['en', 'pt', 'es'] as const
    const validDefaultLocale = supportedLocales.includes(defaultLanguage as (typeof supportedLocales)[number]) 
      ? defaultLanguage as typeof supportedLocales[number]
      : 'pt'

    return defineRouting({
      locales: supportedLocales,
      defaultLocale: validDefaultLocale
    })
  } catch (error) {
    console.error('Error getting dynamic routing config:', error)
    // Fallback to static routing if there's an error
    return staticRouting
  }
}

// Helper function to get supported locales
export function getSupportedLocales() {
  return ['en', 'pt', 'es'] as const
}

// Helper function to validate if a locale is supported
export function isValidLocale(locale: string): locale is 'en' | 'pt' | 'es' {
  return getSupportedLocales().includes(locale as 'en' | 'pt' | 'es')
}