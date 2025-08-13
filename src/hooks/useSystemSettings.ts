'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

// Types for system settings
export type QuizSettings = {
  questionsPerGift: number
  shuffleQuestions: boolean
  showProgress: boolean
  allowRetake: boolean
}

export type GeneralSettings = {
  siteName: string
  siteDescription: string
  enableRegistration: boolean
  enableGuestQuiz: boolean
  maintenanceMode: boolean
  contactEmail: string
  defaultLanguage: string
}

export type SystemSettings = {
  quiz: QuizSettings
  general: GeneralSettings
}

// Default settings
const defaultSettings: SystemSettings = {
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

// Hook for managing system settings
export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        
        // Try to fetch settings from database
        const { data: settingsData, error: settingsError } = await supabase
          .from('system_settings')
          .select('*')
          .single()

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError
        }

        if (settingsData && settingsData.settings) {
          setSettings(settingsData.settings)
        } else {
          // Use default settings if none exist
          setSettings(defaultSettings)
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch settings')
        // Fallback to default settings on error
        setSettings(defaultSettings)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const updateSettings = async (newSettings: SystemSettings) => {
    try {
      setUpdating(true)
      setError(null)

      // Use RPC function to update settings
      const { data, error: updateError } = await supabase
        .rpc('update_system_settings', { new_settings: newSettings })

      if (updateError) throw updateError

      setSettings(newSettings)
      return { success: true }
    } catch (err) {
      console.error('Error updating settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      setUpdating(true)
      setError(null)

      // Use RPC function to reset to default settings
      const { data, error: resetError } = await supabase
        .rpc('update_system_settings', { new_settings: defaultSettings })

      if (resetError) throw resetError

      setSettings(defaultSettings)
      return { success: true }
    } catch (err) {
      console.error('Error resetting settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset settings')
      return { success: false, error: err }
    } finally {
      setUpdating(false)
    }
  }


  return {
    settings,
    loading,
    updating,
    error,
    updateSettings,
    resetToDefaults
  }
}