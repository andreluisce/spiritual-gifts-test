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
import { useState } from 'react'

export default function AISettingsPage() {
  const t = useTranslations('admin.settings.ai')
  const { settings, updateSettings } = useSystemSettings()
  const [testingAI, setTestingAI] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return

    const newSettings = { ...settings }
    newSettings.ai = {
      ...newSettings.ai,
      [key]: value
    }

    updateSettings(newSettings)
  }

  const handleTestAI = async () => {
    setTestingAI(true)
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          giftScores: { leadership: 5, administration: 4, teaching: 3, evangelism: 2, prophecy: 1, shepherding: 3, mercy: 2 }
        })
      })
      
      if (response.ok) {
        alert('AI service is working correctly!')
      } else {
        alert('AI service test failed. Check console for details.')
      }
    } catch (error) {
      alert('Error testing AI service: ' + error)
    } finally {
      setTestingAI(false)
    }
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
            AI Analysis Configuration
          </CardTitle>
          <CardDescription>
            Configure when and how AI analysis is available to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show AI Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-4 w-4 text-gray-500" />
              <div className="space-y-0.5">
                <Label htmlFor="show-ai-button" className="text-sm font-medium cursor-pointer">
                  Show AI Analysis Button
                </Label>
                <p className="text-xs text-gray-500">
                  When enabled, users will see the "Generate AI Analysis" button on their results page
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
                  Auto-Generate Analysis
                </Label>
                <p className="text-xs text-gray-500">
                  Automatically generate AI analysis for all completed quizzes
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
              <Label className="text-sm font-medium">Cache Strategy</Label>
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
                  By Gift Scores - Reuse analysis for users with identical gift scores
                </SelectItem>
                <SelectItem value="session">
                  By Session - Unique analysis for each quiz session
                </SelectItem>
                <SelectItem value="user">
                  By User - One analysis per user (latest results)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose how AI analyses are cached and reused to optimize performance and costs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Service Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-blue-600" />
            AI Service Settings
          </CardTitle>
          <CardDescription>
            Configure AI service parameters and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-model">AI Model</Label>
            <Select
              value={settings.ai.model || 'gpt-3.5-turbo'}
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, Cost-effective)</SelectItem>
                <SelectItem value="gpt-4">GPT-4 (Higher Quality, More Expensive)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Best Balance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <Label htmlFor="max-tokens">Max Response Tokens</Label>
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
              Maximum length of AI-generated analysis (100-4000 tokens)
            </p>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">Response Creativity (Temperature)</Label>
            <Select
              value={settings.ai.temperature?.toString() || '0.7'}
              onValueChange={(value) => handleSettingChange('temperature', parseFloat(value))}
            >
              <SelectTrigger id="temperature">
                <SelectValue placeholder="Select creativity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">Very Conservative (0.1)</SelectItem>
                <SelectItem value="0.3">Conservative (0.3)</SelectItem>
                <SelectItem value="0.5">Balanced (0.5)</SelectItem>
                <SelectItem value="0.7">Creative (0.7)</SelectItem>
                <SelectItem value="0.9">Very Creative (0.9)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Higher values make responses more creative but less predictable
            </p>
          </div>

          <Separator />

          {/* Test AI Service */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <Label className="text-sm font-medium">Test AI Service</Label>
            </div>
            <p className="text-xs text-gray-500">
              Test the AI service configuration with sample data
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
                  Testing AI Service...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Test AI Analysis
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
            Analysis Content Settings
          </CardTitle>
          <CardDescription>
            Configure what information is included in AI analyses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Include Personal Development */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include-development" className="text-sm font-medium cursor-pointer">
                Include Personal Development Suggestions
              </Label>
              <p className="text-xs text-gray-500">
                AI will provide specific suggestions for developing spiritual gifts
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
                Include Ministry Opportunities
              </Label>
              <p className="text-xs text-gray-500">
                AI will suggest specific ways to use gifts in ministry contexts
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
                Include Biblical References
              </Label>
              <p className="text-xs text-gray-500">
                AI will include relevant Bible verses and passages
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
            <Label htmlFor="analysis-language">Analysis Language</Label>
            <Select
              value={settings.ai.analysisLanguage || 'auto'}
              onValueChange={(value) => handleSettingChange('analysisLanguage', value)}
            >
              <SelectTrigger id="analysis-language">
                <SelectValue placeholder="Select analysis language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect from user preference</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
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
            Usage Overview
          </CardTitle>
          <CardDescription>
            Current AI analysis usage and cache statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">--</p>
              <p className="text-xs text-gray-500">Total Analyses</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">--</p>
              <p className="text-xs text-gray-500">Cache Hits</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600">--</p>
              <p className="text-xs text-gray-500">API Calls</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">
                {settings.ai.showAIButton ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-gray-500">AI Button Status</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Detailed usage statistics will be available once the analytics system is implemented.
              Current settings are being saved automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}