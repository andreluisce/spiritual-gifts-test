'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, ChevronDown, Check } from 'lucide-react'

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const

type LanguageCode = typeof languages[number]['code']

interface LanguageToggleProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
  className?: string
}

export function LanguageToggle({ 
  variant = 'outline', 
  size = 'default',
  showText = true,
  className = ''
}: LanguageToggleProps) {
  const locale = useLocale() as LanguageCode
  const router = useRouter()
  const pathname = usePathname()
  const [isChanging, setIsChanging] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  const handleLanguageChange = async (newLocale: LanguageCode) => {
    if (newLocale === locale || isChanging) return

    try {
      setIsChanging(true)
      
      // Navigate to the same path but with new locale
      router.push(pathname, { locale: newLocale })
      
      // Small delay to show loading state
      setTimeout(() => {
        setIsChanging(false)
      }, 500)
    } catch (error) {
      console.error('Error changing language:', error)
      setIsChanging(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`${className} ${isChanging ? 'opacity-50' : ''}`}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          {showText && (
            <>
              <span className="ml-2 hidden sm:inline">{currentLanguage.name}</span>
              <span className="ml-2 sm:hidden">{currentLanguage.flag}</span>
              <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center justify-between cursor-pointer ${
              language.code === locale ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {language.code === locale && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Versão compacta para espaços pequenos
export function LanguageToggleCompact({ className = '' }: { className?: string }) {
  return (
    <LanguageToggle 
      variant="ghost" 
      size="sm"
      showText={false}
      className={className}
    />
  )
}

// Versão inline para usar em texto
export function LanguageToggleInline({ className = '' }: { className?: string }) {
  const locale = useLocale() as LanguageCode
  const router = useRouter()
  const pathname = usePathname()
  const [isChanging, setIsChanging] = useState(false)

  const handleLanguageChange = async (newLocale: LanguageCode) => {
    if (newLocale === locale || isChanging) return

    try {
      setIsChanging(true)
      router.push(pathname, { locale: newLocale })
      setTimeout(() => setIsChanging(false), 500)
    } catch (error) {
      console.error('Error changing language:', error)
      setIsChanging(false)
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {languages.map((language, index) => (
        <div key={language.code} className="flex items-center">
          <button
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className={`text-sm px-2 py-1 rounded transition-colors ${
              language.code === locale
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } ${isChanging ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {language.flag} {language.code.toUpperCase()}
          </button>
          {index < languages.length - 1 && (
            <span className="text-gray-300 mx-1">|</span>
          )}
        </div>
      ))}
    </div>
  )
}