'use client'

import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LanguageToggleCompact } from '@/components/LanguageToggle'
import {
  Home,
  User,
  Settings,
  Award,
  Heart
} from 'lucide-react'
import Image from 'next/image'

export function AppHeader() {
  const { user, signOut, isAdmin } = useAuth()
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')

  // Don't render if no user (login/landing pages)
  if (!user) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 m-2 sm:m-4">
          {/* Combined Header Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            {/* Left side: User info and navigation */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              {/* User Avatar and Info */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-slate-800">
                        {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500">{t('title')}</p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                      {tCommon('signOut')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Divider */}
              <div className="hidden sm:block h-8 w-px bg-slate-200 mx-2" />

              {/* Navigation Menu */}
              <nav className="flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <Home className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">{t('home')}</span>
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <User className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">{t('profile')}</span>
                  </Button>
                </Link>
                <Link href="/gifts">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <Heart className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Dons</span>
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      <Settings className="h-4 w-4 sm:mr-1.5" />
                      <span className="hidden sm:inline">{t('admin')}</span>
                    </Button>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side: Language toggle and Take Test button */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Link href="/quiz" className="flex-1 lg:flex-none order-2 lg:order-1">
                <Button variant="default" size="sm" className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <Award className="h-4 w-4 mr-2" />
                  {t('takeTest')}
                </Button>
              </Link>
              <div className="order-1 lg:order-2">
                <LanguageToggleCompact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}