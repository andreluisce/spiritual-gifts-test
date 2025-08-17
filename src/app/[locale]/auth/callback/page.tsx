'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase-client'
import { useTranslations } from 'next-intl'

export default function AuthCallbackPage() {
  const router = useRouter()
  const t = useTranslations('common')
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth callback error:', error)
            router.push('/login?error=auth_failed')
            return
          }

          if (data.session) {
            // Successfully authenticated, collect demographics and redirect
            
            // Collect demographics in the background (don't await to avoid delaying redirect)
            fetch('/api/demographics/collect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => response.json())
            .then(() => {
              // Demographics collected successfully
            })
            .catch(error => {
              console.warn('Demographics collection failed (non-critical):', error)
            })
            
            router.push('/dashboard')
          } else {
            router.push('/login?error=no_session')
          }
        } else {
          // No code parameter, check if we already have a session
          const { data } = await supabase.auth.getSession()
          
          if (data.session) {
            router.push('/dashboard')
          } else {
            router.push('/login?error=no_code')
          }
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('processing')}...</p>
      </div>
    </div>
  )
}