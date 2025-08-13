'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  BookOpen,
  Users,
  BarChart3
} from 'lucide-react'
import { useSystemSettings } from '@/hooks/useSystemSettings'

type SettingsCategory = 'quiz' | 'general'

export default function AdminSettingsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.settings')
  const [activeTab, setActiveTab] = useState<SettingsCategory>('quiz')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const {
    settings,
    loading: settingsLoading,
    updateSettings,
    updating,
    resetToDefaults,
    error
  } = useSystemSettings()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const handleSettingChange = (category: string, key: string, value: any) => {
    if (!settings) return

    const newSettings = { ...settings }
    
    // Handle nested keys like "questionsPerGift.prophecy"
    if (key.includes('.')) {
      const keys = key.split('.')
      let current = newSettings[category as keyof typeof newSettings] as any
      
      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      // Set the final value
      current[keys[keys.length - 1]] = value
    } else {
      newSettings[category as keyof typeof newSettings] = {
        ...newSettings[category as keyof typeof newSettings],
        [key]: value
      } as any
    }
    
    // Update settings using the hook's update function
    updateSettings(newSettings)
    setHasUnsavedChanges(true)
  }

  const handleSaveSettings = async () => {
    try {
      if (settings) {
        await updateSettings(settings)
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleResetSettings = async () => {
    try {
      await resetToDefaults()
      setHasUnsavedChanges(false)
      setShowResetDialog(false)
    } catch (error) {
      console.error('Error resetting settings:', error)
    }
  }


  // Calculate total questions (7 gifts × questions per gift)
  const getTotalQuestions = () => {
    return (settings?.quiz?.questionsPerGift || 5) * 7
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-gray-600 text-sm">{t('subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="mr-2">
              {t('unsavedChanges')}
            </Badge>
          )}
          <Button
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || updating}
          >
            {updating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('saveChanges')}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsCategory)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            {t('tabs.quiz')}
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('tabs.general')}
          </TabsTrigger>
        </TabsList>

        {/* Quiz Settings Tab */}
        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {t('quiz.title')}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {t('quiz.subtitle', { total: getTotalQuestions() })}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Questions Per Gift Setting */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Badge variant="secondary">Quiz Length</Badge>
                  {t('quiz.questionsConfig.title')}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t('quiz.questionsConfig.description')}
                </p>
                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('quiz.questionsConfig.label')}
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    {t('quiz.questionsConfig.helperText', { total: (settings?.quiz?.questionsPerGift || 5) * 7 })}
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={settings?.quiz?.questionsPerGift || 5}
                    onChange={(e) => handleSettingChange('quiz', 'questionsPerGift', parseInt(e.target.value) || 5)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('quiz.questionsConfig.recommendation')}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Quiz Options */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">{t('quiz.options.title')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('quiz.options.shuffleQuestions.label')}</label>
                      <p className="text-xs text-gray-500">{t('quiz.options.shuffleQuestions.description')}</p>
                    </div>
                    <Switch
                      checked={settings?.quiz?.shuffleQuestions || false}
                      onCheckedChange={(checked) => handleSettingChange('quiz', 'shuffleQuestions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('quiz.options.showProgress.label')}</label>
                      <p className="text-xs text-gray-500">{t('quiz.options.showProgress.description')}</p>
                    </div>
                    <Switch
                      checked={settings?.quiz?.showProgress || false}
                      onCheckedChange={(checked) => handleSettingChange('quiz', 'showProgress', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('quiz.options.allowRetake.label')}</label>
                      <p className="text-xs text-gray-500">{t('quiz.options.allowRetake.description')}</p>
                    </div>
                    <Switch
                      checked={settings?.quiz?.allowRetake || false}
                      onCheckedChange={(checked) => handleSettingChange('quiz', 'allowRetake', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t('general.userAccess.title')}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {t('general.userAccess.description')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('general.userAccess.enableRegistration.label')}</label>
                    <p className="text-xs text-gray-500">{t('general.userAccess.enableRegistration.description')}</p>
                  </div>
                  <Switch
                    checked={settings?.general?.enableRegistration || false}
                    onCheckedChange={(checked) => handleSettingChange('general', 'enableRegistration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('general.userAccess.allowGuestQuiz.label')}</label>
                    <p className="text-xs text-gray-500">{t('general.userAccess.allowGuestQuiz.description')}</p>
                  </div>
                  <Switch
                    checked={settings?.general?.enableGuestQuiz || false}
                    onCheckedChange={(checked) => handleSettingChange('general', 'enableGuestQuiz', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {t('general.localization.title')}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {t('general.localization.description')}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('general.localization.defaultLanguage.label')}</label>
                <p className="text-xs text-gray-500">{t('general.localization.defaultLanguage.description')}</p>
                <select
                  value={settings?.general?.defaultLanguage || 'pt'}
                  onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pt">{t('general.localization.defaultLanguage.options.pt')}</option>
                  <option value="en">{t('general.localization.defaultLanguage.options.en')}</option>
                  <option value="es">{t('general.localization.defaultLanguage.options.es')}</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
