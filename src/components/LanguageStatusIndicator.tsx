'use client'

import { useEffect, useState } from 'react'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { Badge } from '@/components/ui/badge'
import { Globe, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function LanguageStatusIndicator() {
  const t = useTranslations('languageStatus')
  const { loading, defaultLanguage } = usePublicSettings()
  const [currentPath, setCurrentPath] = useState('')

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'pt': return 'Português'
      case 'en': return 'English'
      case 'es': return 'Español'
      default: return code
    }
  }

  const getCurrentLanguageFromPath = () => {
    const pathSegments = currentPath.split('/')
    const langFromPath = pathSegments[1]
    return ['pt', 'en', 'es'].includes(langFromPath) ? langFromPath : 'pt'
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>{t('loading')}</span>
      </div>
    )
  }

  const currentLang = getCurrentLanguageFromPath()
  const configuredDefault = defaultLanguage

  return (
    <div className="flex items-center gap-2 text-xs">
      <Globe className="h-3 w-3 text-gray-400" />
      <span className="text-gray-500">{t('current')}:</span>
      <Badge variant="secondary">
        {getLanguageName(currentLang)}
      </Badge>
      <span className="text-gray-400">|</span>
      <span className="text-gray-500">{t('default')}:</span>
      <Badge variant={configuredDefault === currentLang ? "default" : "outline"}>
        {getLanguageName(configuredDefault)}
      </Badge>
    </div>
  )
}
