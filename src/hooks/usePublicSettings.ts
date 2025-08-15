'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

// Hook público para acessar configurações do sistema (somente leitura)
export function usePublicSettings() {
  const [settings, setSettings] = useState<any>(null)
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
  }, [supabase])

  return {
    settings,
    loading,
    // Helper functions for easy access
    canRegister: settings?.general?.enableRegistration ?? true,
    allowGuestQuiz: settings?.general?.enableGuestQuiz ?? false,
    defaultLanguage: settings?.general?.defaultLanguage ?? 'pt',
    debugMode: settings?.quiz?.debugMode ?? false
  }
}