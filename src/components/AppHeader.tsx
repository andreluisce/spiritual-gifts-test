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
import { usePathname } from 'next/navigation'

export function AppHeader() {
  const { user, signOut, isAdmin } = useAuth()
  const t = useTranslations('dashboard')
  const tCommon = useTranslations('common')
  const pathname = usePathname()

  // Don't render if no user, on homepage, or on login pages
  if (!user) {
    return null
  }
  
  // Don't render on homepage (has its own header)
  if (pathname === '/' || pathname.match(/^\/[a-z]{2}$/) || pathname.match(/^\/[a-z]{2}\/$/) || pathname.includes('/login')) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-2 sm:p-4 m-1 sm:m-4">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Top Row: Avatar + Language Toggle */}
            <div className="flex items-center justify-between">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                      </p>
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
              <LanguageToggleCompact />
            </div>

            {/* Bottom Row: Navigation + Fazer Teste Button */}
            <div className="flex items-center justify-between gap-2">
              <nav className="flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 p-2">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 p-2">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/gifts">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 p-2">
                    <Heart className="h-4 w-4" />
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 p-2">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </nav>
              <Link href="/quiz">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4">
                  <Award className="h-4 w-4 mr-1" />
                  {t('takeTest')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
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
                    <div>
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

              <div className="h-8 w-px bg-slate-200 mx-2" />

              <nav className="flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <Home className="h-4 w-4 mr-1.5" />
                    {t('home')}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <User className="h-4 w-4 mr-1.5" />
                    {t('profile')}
                  </Button>
                </Link>
                <Link href="/gifts">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                    <Heart className="h-4 w-4 mr-1.5" />
                    Dons
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                      <Settings className="h-4 w-4 mr-1.5" />
                      {t('admin')}
                    </Button>
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/quiz">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Award className="h-4 w-4 mr-2" />
                  {t('takeTest')}
                </Button>
              </Link>
              <LanguageToggleCompact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}