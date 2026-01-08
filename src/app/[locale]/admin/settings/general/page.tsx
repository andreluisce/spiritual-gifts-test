'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSystemSettings, type SystemSettings } from '@/hooks/useSystemSettings'
import { useTranslations } from 'next-intl'
import { Globe, UserPlus, Users, Mail, AlertTriangle, FileText } from 'lucide-react'

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

export default function GeneralSettingsPage() {
  const t = useTranslations('admin.settings.general')
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
  const debouncedSettings = useDebounce(localSettings, 1500)

  // Update server when debounced settings change
  useEffect(() => {
    if (!debouncedSettings || !settings) return

    // Only update if the settings actually changed (deep comparison)
    // Simple JSON stringify comparison is enough for this structure
    const hasChanged = JSON.stringify(debouncedSettings.general) !== JSON.stringify(settings.general)

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
  }, [debouncedSettings, settings, updateSettings])

  const handleSettingChange = useCallback((key: string, value: string | boolean | number) => {
    if (!localSettings) return

    const newSettings = { ...localSettings }
    newSettings.general = {
      ...newSettings.general,
      [key]: value
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

  return (
    <div className="space-y-6">
      {/* Saving indicator */}
      {isSaving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Saving changes...</span>
        </div>
      )}

      {/* User Access Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            {t('userAccess.title')}
          </CardTitle>
          <CardDescription>
            {t('userAccess.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Registration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="h-4 w-4 text-gray-500" />
              <div className="space-y-0.5">
                <Label htmlFor="enable-registration" className="text-sm font-medium cursor-pointer">
                  {t('userAccess.enableRegistration.label')}
                </Label>
                <p className="text-xs text-gray-500">
                  {t('userAccess.enableRegistration.description')}
                </p>
              </div>
            </div>
            <Switch
              id="enable-registration"
              checked={localSettings.general.enableRegistration || false}
              onCheckedChange={(checked) => handleSettingChange('enableRegistration', checked)}
            />
          </div>

          {/* Require Approval */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500" />
              <div className="space-y-0.5">
                <Label htmlFor="require-approval" className="text-sm font-medium cursor-pointer">
                  Require Admin Approval
                </Label>
                <p className="text-xs text-gray-500">
                  Only approved users can access the dashboard and take the test
                </p>
              </div>
            </div>
            <Switch
              id="require-approval"
              checked={localSettings.general.requireApproval || false}
              onCheckedChange={(checked) => handleSettingChange('requireApproval', checked)}
            />
          </div>

          {/* Allow Guest Quiz */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-gray-500" />
              <div className="space-y-0.5">
                <Label htmlFor="allow-guest" className="text-sm font-medium cursor-pointer">
                  {t('userAccess.allowGuestQuiz.label')}
                </Label>
                <p className="text-xs text-gray-500">
                  {t('userAccess.allowGuestQuiz.description')}
                </p>
              </div>
            </div>
            <Switch
              id="allow-guest"
              checked={localSettings.general.enableGuestQuiz || false}
              onCheckedChange={(checked) => handleSettingChange('enableGuestQuiz', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Site Information
          </CardTitle>
          <CardDescription>
            Basic information about your spiritual gifts test platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Site Name */}
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={localSettings.general.siteName || ''}
              onChange={(e) => handleSettingChange('siteName', e.target.value)}
              placeholder="Enter site name"
            />
          </div>

          {/* Site Description */}
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Input
              id="site-description"
              value={localSettings.general.siteDescription || ''}
              onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
              placeholder="Brief description of your site"
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <Input
                id="contact-email"
                type="email"
                value={localSettings.general.contactEmail || ''}
                onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                placeholder="admin@example.com"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            {t('localization.title')}
          </CardTitle>
          <CardDescription>
            {t('localization.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Language */}
          <div className="space-y-2">
            <Label htmlFor="default-language">
              {t('localization.defaultLanguage.label')}
            </Label>
            <Select
              value={localSettings.general.defaultLanguage || 'pt'}
              onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
            >
              <SelectTrigger id="default-language" className="w-full">
                <SelectValue placeholder="Select default language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">
                  {t('localization.defaultLanguage.options.pt')}
                </SelectItem>
                <SelectItem value="en">
                  {t('localization.defaultLanguage.options.en')}
                </SelectItem>
                <SelectItem value="es">
                  {t('localization.defaultLanguage.options.es')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {t('localization.defaultLanguage.description')}
            </p>
          </div>

          {/* Language Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                <strong>Note:</strong> The default language applies to new users and guest sessions.
                Existing users can continue using their preferred language.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            Temporarily disable access to the site for maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode" className="text-sm font-medium cursor-pointer">
                Enable Maintenance Mode
              </Label>
              <p className="text-xs text-gray-500">
                When enabled, only administrators can access the site
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={localSettings.general.maintenanceMode || false}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
            />
          </div>

          {localSettings.general.maintenanceMode && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-xs text-orange-700">
                  <strong>Warning:</strong> Maintenance mode is active.
                  Regular users cannot access the site.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}