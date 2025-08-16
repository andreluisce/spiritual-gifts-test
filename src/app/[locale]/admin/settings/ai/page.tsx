'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useTranslations } from 'next-intl'
import { Sparkles, Brain, Zap, Database, Settings2, AlertCircle } from 'lucide-react'
import { useAIOverviewStats, useAIServiceTest } from '@/hooks/useAIAnalytics'

export default function AISettingsPage() {
  const t = useTranslations('admin.settings.ai')
  const { settings, updateSettings } = useSystemSettings()
  const { overview: aiStats, loading: statsLoading } = useAIOverviewStats()
  const { testAIService, testing: testingAI, result: testResult } = useAIServiceTest()

  const handleSettingChange = (key: string, value: string | boolean | number) => {
    if (!settings) return

    const newSettings = { ...settings }
    newSettings.ai = {
      ...newSettings.ai,
      [key]: value
    }

    updateSettings(newSettings)
  }

  const handleTestAI = async () => {
    await testAIService()
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t('aiAnalysisConfig.title')}
          </CardTitle>
          <CardDescription>
            {t('aiAnalysisConfig.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show AI Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-4 w-4 text-gray-500" />
              <div className="space-y-0.5">
                <Label htmlFor="show-ai-button" className="text-sm font-medium cursor-pointer">
                  {t('showAIButton.label')}
                </Label>
                <p className="text-xs text-gray-500">
                  {t('showAIButton.description')}
                </p>
              </div>
            </div>
            <Switch
              id="show-ai-button"
              checked={settings.ai.showAIButton || false}
              onCheckedChange={(checked) => handleSettingChange('showAIButton', checked)}
            />
          </div>

          {/* Auto Generate Analysis */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-gray-500" />
              <div className="space-y-0.5">
                <Label htmlFor="auto-generate" className="text-sm font-medium cursor-pointer">
                  {t('autoGenerate.label')}
                </Label>
                <p className="text-xs text-gray-500">
                  {t('autoGenerate.description')}
                </p>
              </div>
            </div>
            <Switch
              id="auto-generate"
              checked={settings.ai.autoGenerate || false}
              onCheckedChange={(checked) => handleSettingChange('autoGenerate', checked)}
            />
          </div>

          {/* Cache Strategy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium">{t('cacheStrategy.label')}</Label>
            </div>
            <Select
              value={settings.ai.cacheStrategy || 'gift_scores'}
              onValueChange={(value) => handleSettingChange('cacheStrategy', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cache strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gift_scores">
                  {t('cacheStrategy.giftScores')}
                </SelectItem>
                <SelectItem value="session">
                  {t('cacheStrategy.session')}
                </SelectItem>
                <SelectItem value="user">
                  {t('cacheStrategy.user')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t('cacheStrategy.description')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-blue-600" />
            {t('serviceSettings.title')}
          </CardTitle>
          <CardDescription>
            {t('serviceSettings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-model">{t('model.label')}</Label>
            <Select
              value={settings.ai.model || 'gpt-3.5-turbo'}
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">{t('model.gpt35')}</SelectItem>
                <SelectItem value="gpt-4">{t('model.gpt4')}</SelectItem>
                <SelectItem value="gpt-4-turbo">{t('model.gpt4turbo')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="max-tokens">{t('maxTokens.label')}</Label>
            <Input
              id="max-tokens"
              type="number"
              min="100"
              max="4000"
              value={settings.ai.maxTokens || 1000}
              onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
              className="w-32"
            />
            <p className="text-xs text-gray-500">
              {t('maxTokens.description')}
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">{t('temperature.label')}</Label>
            <Select
              value={settings.ai.temperature?.toString() || '0.7'}
              onValueChange={(value) => handleSettingChange('temperature', parseFloat(value))}
            >
              <SelectTrigger id="temperature">
                <SelectValue placeholder="Select creativity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">{t('temperature.veryConservative')}</SelectItem>
                <SelectItem value="0.3">{t('temperature.conservative')}</SelectItem>
                <SelectItem value="0.5">{t('temperature.balanced')}</SelectItem>
                <SelectItem value="0.7">{t('temperature.creative')}</SelectItem>
                <SelectItem value="0.9">{t('temperature.veryCreative')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t('temperature.description')}
            </p>
          </div>

          <Separator />

          {/* Test AI Service */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-medium">{t('testAI.label')}</Label>
            </div>
            <p className="text-xs text-gray-500">
              {t('testAI.description')}
            </p>
            <Button 
              onClick={handleTestAI}
              disabled={testingAI}
              variant="outline"
              className="w-full"
            >
              {testingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {t('testAI.testing')}
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  {t('testAI.button')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            {t('contentSettings.title')}
          </CardTitle>
          <CardDescription>
            {t('contentSettings.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Include Personal Development */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-development" className="text-sm font-medium cursor-pointer">
                {t('includePersonalDevelopment.label')}
              </Label>
              <p className="text-xs text-gray-500">
                {t('includePersonalDevelopment.description')}
              </p>
            </div>
            <Switch
              id="include-development"
              checked={settings.ai.includePersonalDevelopment !== false}
              onCheckedChange={(checked) => handleSettingChange('includePersonalDevelopment', checked)}
            />
          </div>

          {/* Include Ministry Opportunities */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-ministry" className="text-sm font-medium cursor-pointer">
                {t('includeMinistryOpportunities.label')}
              </Label>
              <p className="text-xs text-gray-500">
                {t('includeMinistryOpportunities.description')}
              </p>
            </div>
            <Switch
              id="include-ministry"
              checked={settings.ai.includeMinistryOpportunities !== false}
              onCheckedChange={(checked) => handleSettingChange('includeMinistryOpportunities', checked)}
            />
          </div>

          {/* Include Biblical References */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-biblical" className="text-sm font-medium cursor-pointer">
                {t('includeBiblicalReferences.label')}
              </Label>
              <p className="text-xs text-gray-500">
                {t('includeBiblicalReferences.description')}
              </p>
            </div>
            <Switch
              id="include-biblical"
              checked={settings.ai.includeBiblicalReferences !== false}
              onCheckedChange={(checked) => handleSettingChange('includeBiblicalReferences', checked)}
            />
          </div>

          {/* Analysis Language */}
          <div className="space-y-2">
            <Label htmlFor="analysis-language">{t('analysisLanguage.label')}</Label>
            <Select
              value={settings.ai.analysisLanguage || 'auto'}
              onValueChange={(value) => handleSettingChange('analysisLanguage', value)}
            >
              <SelectTrigger id="analysis-language">
                <SelectValue placeholder="Select analysis language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{t('analysisLanguage.auto')}</SelectItem>
                <SelectItem value="pt">{t('analysisLanguage.pt')}</SelectItem>
                <SelectItem value="en">{t('analysisLanguage.en')}</SelectItem>
                <SelectItem value="es">{t('analysisLanguage.es')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            {t('usageOverview.title')}
          </CardTitle>
          <CardDescription>
            {t('usageOverview.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {statsLoading ? '...' : (aiStats?.total_analyses || 0)}
              </p>
              <p className="text-xs text-gray-500">{t('usageOverview.totalAnalyses')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : (aiStats?.cache_hits || 0)}
              </p>
              <p className="text-xs text-gray-500">{t('usageOverview.cacheHits')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600">
                {statsLoading ? '...' : (aiStats?.api_calls || 0)}
              </p>
              <p className="text-xs text-gray-500">{t('usageOverview.apiCalls')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">
                {settings.ai.showAIButton ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-gray-500">{t('usageOverview.aiButtonStatus')}</p>
            </div>
          </div>
          
          {testResult && (
            <div className={`mt-4 p-3 border rounded-lg ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-xs ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                <strong>{testResult.success ? '✅ Teste bem-sucedido:' : '❌ Teste falhou:'}</strong> {testResult.message}
              </p>
            </div>
          )}
          
          {aiStats && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
                <div>
                  <strong>Taxa de Cache:</strong> {aiStats.cache_hit_rate}%
                </div>
                <div>
                  <strong>Confiança Média:</strong> {aiStats.avg_confidence_score || 0}%
                </div>
                <div>
                  <strong>Análises Hoje:</strong> {aiStats.analyses_today}
                </div>
                <div>
                  <strong>Dom Mais Analisado:</strong> {aiStats.most_analyzed_gift}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}