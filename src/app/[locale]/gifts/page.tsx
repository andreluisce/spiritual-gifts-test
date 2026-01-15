'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search, BookOpen, Heart, Star,
  Users, Crown, ArrowLeft, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import {
  useSpiritualGifts,
  useCategories,
  useMinistries,
  useManifestations
} from '@/hooks/use-quiz-queries'
import { useQuizAccess } from '@/hooks/useQuizAccess'

export default function GiftsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('motivations')

  const router = useRouter()
  const { user } = useAuth()
  const locale = useLocale()
  const t = useTranslations('gifts')
  const { canTakeQuiz } = useQuizAccess()

  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)
  const { data: ministries, isLoading: loadingMinistries } = useMinistries(locale)
  const { data: manifestations, isLoading: loadingManifestations } = useManifestations(locale)

  const loading = loadingSpiritualGifts || loadingCategories || loadingMinistries || loadingManifestations

  // Filter motivational gifts only
  const motivationalGifts = spiritualGiftsData?.filter(gift =>
    gift.category_key === 'motivational' || gift.category_key === 'motivations'
  ) || []

  const filteredGifts = motivationalGifts.filter(gift =>
    gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMinistries = ministries?.filter(ministry =>
    ministry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ministry.definition?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredManifestations = manifestations?.filter(manifestation =>
    manifestation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifestation.definition?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dons espirituais...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          {user && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>

          {/* Call to Action */}
          <div className="flex flex-wrap gap-4 justify-center">
            {canTakeQuiz && (
              <Link href={`/${locale}/quiz`}>
                <Button size="lg" className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t('discoverMyGifts')}
                </Button>
              </Link>
            )}
            <Link href={`/${locale}/gifts/learn`}>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Aprenda sobre Dons
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories Overview */}
        {categories && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => (
              <Card key={category.key} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-3">
                    {category.key === 'motivational' && <Heart className="h-10 w-10 text-red-500" />}
                    {category.key === 'ministries' && <Users className="h-10 w-10 text-green-500" />}
                    {category.key === 'manifestations' && <Crown className="h-10 w-10 text-purple-500" />}
                  </div>
                  <CardTitle className="text-2xl">{category.name}</CardTitle>
                  <p className="text-sm text-gray-600 italic mt-1">{category.greek_term}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="motivations" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{t('categories.motivations')}</span>
              <span className="sm:hidden">Motivações</span>
            </TabsTrigger>
            <TabsTrigger value="ministries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('categories.ministries')}</span>
              <span className="sm:hidden">Ministérios</span>
            </TabsTrigger>
            <TabsTrigger value="manifestations" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">{t('categories.manifestations')}</span>
              <span className="sm:hidden">Manifestações</span>
            </TabsTrigger>
          </TabsList>

          {/* Motivational Gifts */}
          <TabsContent value="motivations">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGifts.map((gift) => (
                <Card
                  key={gift.gift_key}
                  className="hover:shadow-xl transition-all cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{gift.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {gift.category_name}
                        </Badge>
                      </div>
                      <Heart className="h-6 w-6 text-red-500 flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {gift.definition}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:bg-blue-50"
                      onClick={() => router.push(`/${locale}/gifts/${gift.gift_key.toLowerCase()}`)}
                    >
                      Ver Detalhes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ministries */}
          <TabsContent value="ministries">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMinistries.map((ministry) => (
                <Card
                  key={ministry.key}
                  className="hover:shadow-xl transition-all cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{ministry.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Ministério
                        </Badge>
                      </div>
                      <Users className="h-6 w-6 text-green-500 flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {ministry.definition}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:bg-green-50"
                      onClick={() => router.push(`/${locale}/gifts/${ministry.key.toLowerCase()}`)}
                    >
                      Ver Detalhes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Manifestations */}
          <TabsContent value="manifestations">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredManifestations.map((manifestation) => (
                <Card
                  key={manifestation.key}
                  className="hover:shadow-xl transition-all cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{manifestation.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          Manifestação
                        </Badge>
                      </div>
                      <Crown className="h-6 w-6 text-purple-500 flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {manifestation.definition}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:bg-purple-50"
                      onClick={() => router.push(`/${locale}/gifts/${manifestation.key.toLowerCase()}`)}
                    >
                      Ver Detalhes
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Footer */}
        {canTakeQuiz && (
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">
                Pronto para descobrir seus dons?
              </h2>
              <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
                Faça o teste completo e receba um relatório personalizado sobre seus dons espirituais
              </p>
              <Link href={`/${locale}/quiz`}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <Star className="h-5 w-5 mr-2" />
                  Fazer o Teste Agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
