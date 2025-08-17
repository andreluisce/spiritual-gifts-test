'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from '@/i18n/navigation'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Globe } from 'lucide-react'
import { formatPercentage } from '@/data/quiz-data'
import { 
  useAgeDemographics,
  useGeographicDistribution 
} from '@/hooks/useAdminData'
import AnalyticsNavigation from '@/components/AnalyticsNavigation'

export default function AnalyticsDemographicsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const t = useTranslations('admin.analytics')
  
  // Fetch real data
  const { demographics: ageDemographics, loading: ageLoading } = useAgeDemographics()
  const { distribution: geoDistribution, loading: geoLoading } = useGeographicDistribution()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard')
    }
  }, [user, isAdmin, loading, router])

  if (loading || ageLoading || geoLoading) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('tabs.demographics')}</h1>
          <p className="text-gray-600 mt-1">
            {t('demographics.subtitle')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <AnalyticsNavigation />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Age Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('demographics.ageDistribution.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ageDemographics && ageDemographics.length > 0 ? (
              <div className="space-y-4">
                {ageDemographics.map((group, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-sm font-medium">{group.ageRange}</span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {group.count} ({formatPercentage(group.percentage)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('demographics.ageDistribution.description')}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {t('demographics.ageDistribution.noData')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('demographics.geographicDistribution.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geoDistribution && geoDistribution.length > 0 ? (
              <div className="space-y-4">
                {geoDistribution.map((location, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-sm font-medium">{location.country}</span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {location.count} ({formatPercentage(location.percentage)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${location.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('demographics.geographicDistribution.description')}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {t('demographics.geographicDistribution.noData')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional demographics insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('demographics.summary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900 mb-1">{t('demographics.summary.dominantAgeGroup')}</h4>
              <p className="text-lg font-bold text-blue-700">
                {ageDemographics && ageDemographics.length > 0 
                  ? ageDemographics.reduce((prev, current) => 
                      (prev.count > current.count) ? prev : current
                    ).ageRange
                  : t('demographics.summary.notAvailable')
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900 mb-1">{t('demographics.summary.mainCountry')}</h4>
              <p className="text-lg font-bold text-green-700">
                {geoDistribution && geoDistribution.length > 0 
                  ? geoDistribution[0].country
                  : t('demographics.summary.notAvailable')
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900 mb-1">{t('demographics.summary.geographicDiversity')}</h4>
              <p className="text-lg font-bold text-purple-700">
                {geoDistribution ? geoDistribution.length : 0} {t('demographics.summary.countries')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}