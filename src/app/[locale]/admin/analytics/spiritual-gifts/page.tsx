'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain } from 'lucide-react'
import { formatPercentage } from '@/data/quiz-data'
import { useGiftDistribution } from '@/hooks/useAdminData'
import AnalyticsNavigation from '@/components/AnalyticsNavigation'

export default function AnalyticsSpiritualGiftsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.analytics')
  
  // Fetch real data
  const { distribution: realGifts, loading: giftsLoading } = useGiftDistribution()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || giftsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('tabs.spiritualGifts')}</h1>
          <p className="text-gray-600 mt-1">
            {t('spiritualGifts.subtitle')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <AnalyticsNavigation />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t('spiritualGifts.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {realGifts && realGifts.length > 0 ? (
              realGifts.slice(0, 7).map((gift, index) => (
                <div key={gift.gift_name} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{gift.gift_name}</h3>
                        <p className="text-sm text-gray-500">{gift.count} {t('spiritualGifts.identifications')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge variant="secondary" className="whitespace-nowrap">
                        {formatPercentage(gift.percentage, 1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${gift.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('spiritualGifts.noData')}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Dados de distribuição de dons espirituais aparecerão aqui conforme os usuários completem o teste.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional insights card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Insights dos Dons Espirituais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Dom Mais Comum</h4>
              <p className="text-2xl font-bold text-blue-700">
                {realGifts && realGifts.length > 0 ? realGifts[0]?.gift_name : 'N/A'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {realGifts && realGifts.length > 0 ? `${formatPercentage(realGifts[0]?.percentage || 0)} dos usuários` : 'Aguardando dados'}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Diversidade</h4>
              <p className="text-2xl font-bold text-green-700">
                {realGifts ? realGifts.length : 0}/7
              </p>
              <p className="text-sm text-green-600 mt-1">
                Dons identificados
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Total de Identificações</h4>
              <p className="text-2xl font-bold text-purple-700">
                {realGifts ? realGifts.reduce((sum, gift) => sum + gift.count, 0).toLocaleString() : '0'}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Resultados únicos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}