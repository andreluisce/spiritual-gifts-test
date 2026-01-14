'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface SystemSettings {
  general?: {
    enableRegistration?: boolean
    enableGuestQuiz?: boolean
    defaultLanguage?: string
  }
  quiz?: {
    debugMode?: boolean
    showProgress?: boolean
    allowRetake?: boolean
  }
}

// Hook público para acessar configurações do sistema (somente leitura)
export function usePublicSettings() {

  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => createClient())

  useEffect(() => {

    const fetchSettings = async () => {
      try {
        setLoading(true)

        // Use RPC function to get settings
        const { data: settingsData, error: settingsError } = await supabase
          .rpc('get_system_settings')

        if (settingsError) {
          console.error('Error fetching settings:', settingsError)
          // Use fallback settings if error
          setSettings({
            general: {
              enableRegistration: true,
              enableGuestQuiz: false,
              defaultLanguage: 'pt'
            }
          })
        } else {
          setSettings(settingsData)
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
        // Use fallback settings
        setSettings({
          general: {
            enableRegistration: true,
            enableGuestQuiz: false,
            defaultLanguage: 'pt'
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // supabase client is stable, no need to include in deps

  return {
    settings,
    loading,
    // Helper functions for easy access
    canRegister: settings?.general?.enableRegistration ?? true,
    allowGuestQuiz: settings?.general?.enableGuestQuiz ?? false,
    defaultLanguage: settings?.general?.defaultLanguage ?? 'pt',
    debugMode: settings?.quiz?.debugMode ?? false,
    allowRetake: settings?.quiz?.allowRetake ?? false
  }
}
