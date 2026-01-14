'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

export default function AdminAnalyticsPage() {
  const { user, isAdmin, isManager, loading } = useAuth()
  const { canViewAnalytics } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    const allowed = isAdmin || isManager || canViewAnalytics
    if (!loading && (!user || !allowed)) {
      router.push('/dashboard')
      return
    }
    
    if (!loading && user && allowed) {
      // Redirect to overview page as the default analytics view
      router.push('/admin/analytics/overview')
    }
  }, [user, isAdmin, isManager, canViewAnalytics, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !(isAdmin || isManager || canViewAnalytics)) {
    return null
  }

  // This page now serves as a redirect to /admin/analytics/overview
  return null
}
