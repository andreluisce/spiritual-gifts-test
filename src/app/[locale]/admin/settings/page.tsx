'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to quiz settings by default
    router.push('/admin/settings/quiz')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}