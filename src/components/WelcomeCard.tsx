'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'
import { User } from '@supabase/supabase-js'

interface WelcomeCardProps {
  user: User
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  const t = useTranslations('welcome')
  
  // Debug: log user data to see what Google provides
  console.log('User data from Google Auth:', {
    user,
    metadata: user.user_metadata,
    email: user.email
  })
  
  // Extract data from user metadata (Google Auth data)
  const userData = user.user_metadata || {}
  const displayName = userData.full_name || userData.name || user.email?.split('@')[0] || 'Friend'
  const avatarUrl = userData.avatar_url || userData.picture || null
  
  // Extract first name from full name or use email prefix
  const getFirstName = (name: string) => {
    return name.split(' ')[0]
  }
  
  const firstName = getFirstName(displayName)
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }
  
  const initials = getInitials(displayName)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-white/30">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-1">{t('greeting')}</p>
              <h2 className="text-white text-2xl font-bold">
                {t('hello', { name: firstName })}
              </h2>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}