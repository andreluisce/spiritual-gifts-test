import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

export interface SystemSettings {
  quiz: {
    debugMode?: boolean
    allowRetake?: boolean
    showProgress?: boolean
    questionsPerGift?: number | {
      prophecy: number
      ministry: number
      teaching: number
      exhortation: number
      giving: number
      administration: number
      mercy: number
      apostle: number
      prophet: number
      evangelist: number
      pastor: number
      teacher: number
      wisdom: number
      knowledge: number
      faith: number
      healing: number
      miracles: number
      discernment: number
      tongues: number
      interpretation: number
    }
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
    requireApproval: boolean
  }
  ai: {
    enableAIAnalysis: boolean
    aiAnalysisDescription: string
    showAIButton: boolean
    autoGenerate: boolean
    cacheStrategy: 'gift_scores' | 'session' | 'user'
    model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo'
    maxTokens: number
    temperature: number
    includePersonalDevelopment: boolean
    includeMinistryOpportunities: boolean
    includeBiblicalReferences: boolean
    analysisLanguage: 'auto' | 'pt' | 'en' | 'es'
  }
}

export function useSystemSettings() {
  const { user } = useAuth()
  const { isAdmin, isManager } = usePermissions()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/settings', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      console.error('❌ useSystemSettings: Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: SystemSettings) => {
    if (!isAdmin && !isManager) {
      const err = new Error('Not authorized')
      console.error('❌ useSystemSettings: Error updating settings:', err)
      setError('Not authorized')
      throw err
    }

    try {
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
        let details = ''
        try {
          const body = await response.json()
          details = body?.details || body?.error || ''
        } catch {
          // ignore
        }
        const message = `Failed to update settings: ${response.status}${details ? ` - ${details}` : ''}`
        throw new Error(message)
      }

      const data = await response.json()
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
        const response = await fetch('/api/settings', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          const aiSettings = data.ai || { showAIButton: false }
          setShowAIButton(aiSettings.showAIButton || false)
        } else {
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
