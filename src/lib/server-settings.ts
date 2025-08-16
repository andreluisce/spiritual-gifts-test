// src/lib/server-settings.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getCache, setCache, isCacheValid } from './cache-invalidation'

// Static-safe version for build time and initial loads
export async function getServerSettingsStatic() {
  // Check if we have valid cached settings
  const cachedSettings = getCache()
  if (isCacheValid()) {
    return cachedSettings?.data
  }

  try {
    // Create a client without cookies for static generation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() { return undefined },
          set() { /* no-op */ },
          remove() { /* no-op */ },
        },
      }
    )

    const { data: settingsData, error } = await supabase
      .rpc('get_system_settings')

    if (error) {
      console.error('Error fetching server settings (static):', error)
      return getDefaultSettings()
    }

    // Cache the settings
    setCache(settingsData)
    return settingsData || getDefaultSettings()
  } catch (error) {
    console.error('Error in getServerSettingsStatic:', error)
    return getDefaultSettings()
  }
}

// Dynamic version with cookie support for runtime
export async function getServerSettings() {
  // Check if we have valid cached settings
  const cachedSettings = getCache()
  if (isCacheValid()) {
    return cachedSettings?.data
  }

  try {
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

    const { data: settingsData, error } = await supabase
      .rpc('get_system_settings')

    if (error) {
      console.error('Error fetching server settings:', error)
      return getDefaultSettings()
    }

    // Cache the settings
    setCache(settingsData)

    return settingsData || getDefaultSettings()
  } catch (error) {
    console.error('Error in getServerSettings:', error)
    return getDefaultSettings()
  }
}

// Static-safe version for build time
export async function getDefaultLanguageStatic(): Promise<string> {
  try {
    const settings = await getServerSettingsStatic()
    return settings?.general?.defaultLanguage || 'pt'
  } catch (error) {
    console.error('Error getting default language (static):', error)
    return 'pt'
  }
}

// Dynamic version for runtime
export async function getDefaultLanguage(): Promise<string> {
  try {
    const settings = await getServerSettings()
    return settings?.general?.defaultLanguage || 'pt'
  } catch (error) {
    console.error('Error getting default language:', error)
    return 'pt'
  }
}

function getDefaultSettings() {
  return {
    quiz: {
      questionsPerGift: 5,
      shuffleQuestions: true,
      showProgress: true,
      allowRetake: true
    },
    general: {
      siteName: 'Spiritual Gifts Test',
      siteDescription: 'Discover your motivational gifts through biblical assessment',
      enableRegistration: true,
      enableGuestQuiz: false,
      maintenanceMode: false,
      contactEmail: 'admin@spiritualgifts.app',
      defaultLanguage: 'pt'
    }
  }
}

// Function to invalidate cache (useful for when settings are updated)
export async function invalidateSettingsCache() {
  const { invalidateCache } = await import('./cache-invalidation')
  invalidateCache()
}