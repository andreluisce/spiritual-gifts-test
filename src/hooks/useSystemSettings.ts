import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export interface SystemSettings {
  quiz: {
    debugMode: boolean
    allowRetake: boolean
    showProgress: boolean
    questionsPerGift: number
    shuffleQuestions: boolean
  }
  general: {
    siteName: string
    contactEmail: string
    defaultLanguage: string
    enableGuestQuiz: boolean
    maintenanceMode: boolean
    siteDescription: string
    enableRegistration: boolean
  }
  ai: {
    enableAIAnalysis: boolean
    aiAnalysisDescription: string
    showAIButton: boolean
  }
}

export function useSystemSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      console.log('🔧 useSystemSettings: Fetching settings...')
      setLoading(true)
      setError(null)

      const response = await fetch('/api/settings', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ useSystemSettings: Settings fetched successfully')
      setSettings(data)
    } catch (err) {
      console.error('❌ useSystemSettings: Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: SystemSettings) => {
    try {
      console.log('🔧 useSystemSettings: Updating settings...')
      setError(null)

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ useSystemSettings: Settings updated successfully')
      setSettings(data)
      return data
    } catch (err) {
      console.error('❌ useSystemSettings: Error updating settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings
  }
}

// Hook specifically for AI analysis setting (public access)
export function useAIAnalysisSettings() {
  const [showAIButton, setShowAIButton] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAISettings = async () => {
      try {
        console.log('🤖 useAIAnalysisSettings: Fetching AI settings...')
        const response = await fetch('/api/settings', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          const aiSettings = data.ai || { showAIButton: false }
          console.log('✅ useAIAnalysisSettings: AI settings fetched:', aiSettings)
          setShowAIButton(aiSettings.showAIButton || false)
        } else {
          console.log('❌ useAIAnalysisSettings: Failed to fetch settings, defaulting to false')
          setShowAIButton(false)
        }
      } catch (error) {
        console.warn('❌ useAIAnalysisSettings: Error fetching AI settings:', error)
        setShowAIButton(false)
      } finally {
        setLoading(false)
      }
    }

    fetchAISettings()
  }, [])

  return {
    showAIButton,
    loading
  }
}