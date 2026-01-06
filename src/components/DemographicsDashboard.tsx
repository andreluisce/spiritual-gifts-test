'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Globe, 
  Users, 
  PieChart,
  MapPin,
  Calendar,
  TrendingUp,
  Info
} from 'lucide-react'
import { useDemographics, useAgeDemographics, useGeographicDemographics } from '@/hooks/useDemographics'
import { useTranslations } from 'next-intl'

interface DemographicsDashboardProps {
  className?: string
}

export default function DemographicsDashboard({ className }: DemographicsDashboardProps) {
  const { data: fullData, loading: fullLoading, error: fullError } = useDemographics()
  const { data: ageData, loading: ageLoading } = useAgeDemographics()
  const { data: geoData, loading: geoLoading } = useGeographicDemographics()
  const t = useTranslations('demographics')

  if (fullLoading || ageLoading || geoLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (fullError) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('error', { error: fullError })}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fullData?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('registeredUsers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('usersWithData')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fullData?.usersWithDemographicData || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('completedProfiles')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dataCompleteness')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fullData?.totalUsers ? 
                Math.round((fullData.usersWithDemographicData / fullData.totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('profileCompletion')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('ageDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ageData.length > 0 ? (
              <div className="space-y-4">
                {ageData.map((item) => (
                  <div key={item.age_range} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t(`ageRanges.${item.age_range}`)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.user_count} {t('users')}
                        </span>
                        <Badge variant="outline">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('noAgeData')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('geographicDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geoData.length > 0 ? (
              <div className="space-y-4">
                {geoData.map((item, index) => (
                  <div key={`${item.country}-${item.state_province}-${item.city}-${index}`} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="font-medium">{item.city}</div>
                          <div className="text-muted-foreground">
                            {item.state_province}, {item.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.user_count} {t('users')}
                        </span>
                        <Badge variant="outline">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('noGeographicData')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      {(ageData.length > 0 || geoData.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('insights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ageData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('dominantAgeGroup')}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {t(`ageRanges.${ageData[0]?.age_range}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {ageData[0]?.percentage}% {t('ofUsers')}
                    </span>
                  </div>
                </div>
              )}
              
              {geoData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('topLocation')}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {geoData[0]?.city}, {geoData[0]?.country}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {geoData[0]?.percentage}% {t('ofUsers')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}