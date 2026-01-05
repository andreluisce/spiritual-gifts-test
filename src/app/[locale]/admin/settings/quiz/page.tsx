'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useSystemSettings, type SystemSettings } from '@/hooks/useSystemSettings'
import { useTranslations } from 'next-intl'
import { HelpCircle, Settings2, Shuffle, Eye, RefreshCw } from 'lucide-react'

// Debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function QuizSettingsPage() {
  const t = useTranslations('admin.settings.quiz')
  const { settings, updateSettings } = useSystemSettings()
  const [localSettings, setLocalSettings] = useState<SystemSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Sync local settings with fetched settings
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  // Debounce local settings changes
  const debouncedSettings = useDebounce(localSettings, 1000)

  // Update server when debounced settings change
  useEffect(() => {
    if (!debouncedSettings || !settings) return

    // Only update if the settings actually changed (deep comparison)
    const hasChanged = JSON.stringify(debouncedSettings) !== JSON.stringify(settings)

    if (hasChanged) {
      setIsSaving(true)
      updateSettings(debouncedSettings)
        .then(() => {
          setIsSaving(false)
        })
        .catch((error) => {
          console.error('Failed to update settings:', error)
          setIsSaving(false)
          // Revert to previous settings on error
          setLocalSettings(settings)
        })
    }
  }, [debouncedSettings])

  const handleSettingChange = useCallback((key: string, value: string | boolean | number) => {
    if (!localSettings) return

    const newSettings = { ...localSettings }
    
    if (key.includes('.')) {
      const keys = key.split('.')
      let current = newSettings.quiz as Record<string, unknown>
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]] as Record<string, unknown>
      }
      
      current[keys[keys.length - 1]] = value
    } else {
      newSettings.quiz = {
        ...newSettings.quiz,
        [key]: value
      }
    }

    setLocalSettings(newSettings)
  }, [localSettings])

  if (!localSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Helper function to get questions per gift value
  const getQuestionsPerGift = () => {
    const questionsPerGift = localSettings?.quiz?.questionsPerGift
    if (typeof questionsPerGift === 'number') {
      return questionsPerGift
    }
    if (typeof questionsPerGift === 'object' && questionsPerGift) {
      // Return the first value from the object as default
      return Object.values(questionsPerGift)[0] || 5
    }
    return 5
  }

  const questionsPerGiftValue = getQuestionsPerGift()
  const totalQuestions = questionsPerGiftValue * 7

  return (
    <div className="space-y-6">
      {/* Saving indicator */}
      {isSaving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Saving changes...</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            Quiz Configuration
          </CardTitle>
          <CardDescription>
            {t('subtitle', { total: totalQuestions })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Questions Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold">{t('questionsConfig.title')}</h3>
            </div>
            <p className="text-sm text-gray-600">
              {t('questionsConfig.description')}
            </p>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="questions-per-gift">
                  {t('questionsConfig.label')}
                </Label>
                <Input
                  id="questions-per-gift"
                  type="number"
                  min="1"
                  max="10"
                  value={questionsPerGiftValue}
                  onChange={(e) => handleSettingChange('questionsPerGift', parseInt(e.target.value))}
                  className="w-32"
                />
                <p className="text-xs text-gray-500">
                  {t('questionsConfig.helperText', { total: totalQuestions })}
                </p>
                <p className="text-xs text-blue-600">
                  {t('questionsConfig.recommendation')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiz Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('options.title')}</h3>
            
            <div className="space-y-4">
              {/* Shuffle Questions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shuffle className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label htmlFor="shuffle-questions" className="text-sm font-medium cursor-pointer">
                      {t('options.shuffleQuestions.label')}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {t('options.shuffleQuestions.description')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="shuffle-questions"
                  checked={localSettings.quiz.shuffleQuestions || false}
                  onCheckedChange={(checked) => handleSettingChange('shuffleQuestions', checked)}
                />
              </div>

              {/* Show Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label htmlFor="show-progress" className="text-sm font-medium cursor-pointer">
                      {t('options.showProgress.label')}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {t('options.showProgress.description')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="show-progress"
                  checked={localSettings.quiz.showProgress || false}
                  onCheckedChange={(checked) => handleSettingChange('showProgress', checked)}
                />
              </div>

              {/* Allow Retake */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-retake" className="text-sm font-medium cursor-pointer">
                      {t('options.allowRetake.label')}
                    </Label>
                    <p className="text-xs text-gray-500">
                      {t('options.allowRetake.description')}
                    </p>
                  </div>
                </div>
                <Switch
                  id="allow-retake"
                  checked={localSettings.quiz.allowRetake || false}
                  onCheckedChange={(checked) => handleSettingChange('allowRetake', checked)}
                />
              </div>

              {/* Debug Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-mode" className="text-sm font-medium cursor-pointer">
                      Debug Mode
                    </Label>
                    <p className="text-xs text-gray-500">
                      Show debug information during quiz
                    </p>
                  </div>
                </div>
                <Switch
                  id="debug-mode"
                  checked={localSettings.quiz.debugMode || false}
                  onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Configuration</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-blue-700">
                <span className="font-medium">Total Questions:</span> {totalQuestions}
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Questions per Gift:</span> {questionsPerGiftValue}
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Shuffle:</span> {localSettings.quiz.shuffleQuestions ? 'Yes' : 'No'}
              </div>
              <div className="text-blue-700">
                <span className="font-medium">Retakes:</span> {localSettings.quiz.allowRetake ? 'Allowed' : 'Not Allowed'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}