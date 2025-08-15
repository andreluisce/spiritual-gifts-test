// src/lib/server-settings.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { getCache, setCache, isCacheValid, CACHE_DURATION } from './cache-invalidation'

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
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // We can't set cookies in this context, but that's ok for read operations
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