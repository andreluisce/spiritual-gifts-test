'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search, BookOpen, Heart, Star,
  Target, Lightbulb,
  Users, Crown, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import {
  useSpiritualGifts,
  useCategories,
  useMinistries,
  useManifestations,
  type SpiritualGiftData
} from '@/hooks/use-quiz-queries'

export default function GiftsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGift, setSelectedGift] = useState<SpiritualGiftData | null>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { user } = useAuth()
  const locale = useLocale()
  const t = useTranslations('gifts')

  const handleDiscoverGifts = useCallback(() => {
    if (!user) {
      router.push(`/${locale}/login?from=gifts`)
    } else {
      router.push(`/${locale}/quiz`)
    }
  }, [user, router, locale])
  const [activeSection, setActiveSection] = useState('motivations')

  // Scroll to detail panel when gift is selected
  useEffect(() => {
    if (selectedGift && detailPanelRef.current) {
      detailPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [selectedGift])

  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts, error: spiritualGiftsError } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories, error: categoriesError } = useCategories(locale)
  const { data: ministries, error: ministriesError } = useMinistries(locale)
  const { data: manifestations, error: manifestationsError } = useManifestations(locale)

  const loading = loadingSpiritualGifts || loadingCategories
  const hasError = spiritualGiftsError || categoriesError || ministriesError || manifestationsError

  // Filter motivational gifts only (for the motivations tab)
  const motivationalGifts = spiritualGiftsData?.filter(gift =>
    gift.category_key === 'motivations'
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

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Erro ao carregar dados
            </h2>
            <p className="text-red-600 mb-4">
              Não foi possível carregar as informações dos dons espirituais.
              Tente recarregar a página.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="p-2 sm:p-4 m-1 sm:m-4">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-4">
            {user && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            )}
            <div className="ml-auto">
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Heart className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {t('subtitle')}
            </p>

            {/* Call to Action */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="flex items-center gap-2" onClick={handleDiscoverGifts}>
                <Star className="h-5 w-5" />
                {t('discoverMyGifts')}
              </Button>
              <Link href={`/${locale}/gifts/learn`}>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Aprenda sobre Dons
                </Button>
              </Link>
              <Link href={`/${locale}/dashboard`}>
                <Button variant="outline" size="lg">
                  {t('myHistory')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Overview */}
          {categories && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => (
                <Card key={category.key} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-2">
                      {category.key === 'motivational' && <Heart className="h-8 w-8 text-red-500" />}
                      {category.key === 'ministries' && <Users className="h-8 w-8 text-green-500" />}
                      {category.key === 'manifestations' && <Crown className="h-8 w-8 text-purple-500" />}
                    </div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <p className="text-sm text-gray-600 italic">{category.greek_term}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm mb-3">{category.description}</p>
                    <p className="text-xs text-blue-600 font-medium">{category.purpose}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="motivations" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {t('categories.motivations')}
              </TabsTrigger>
              <TabsTrigger value="ministries" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('categories.ministries')}
              </TabsTrigger>
              <TabsTrigger value="manifestations" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                {t('categories.manifestations')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="motivations" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Gifts List */}
                <div className="lg:col-span-2">
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredGifts.map((gift) => (
                      <Card
                        key={gift.gift_key}
                        className={`cursor-pointer transition-all hover:shadow-lg ${selectedGift?.gift_key === gift.gift_key ? 'ring-2 ring-blue-500' : ''
                          }`}
                        onClick={() => setSelectedGift(gift)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{gift.name}</span>
                            <Heart className="h-5 w-5 text-red-500" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">
                            {gift.definition}
                          </p>
                          <div className="mt-4 flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {gift.category_name}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {gift.characteristics?.length || 0} {t('giftDetails.characteristics')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Gift Detail Panel */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8" ref={detailPanelRef}>
                    {selectedGift ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-2xl">{selectedGift.name}</CardTitle>
                          <p className="text-sm text-gray-500">{t('title')}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {t('giftDetails.description')}
                            </h3>
                            <p className="text-gray-700">{selectedGift.definition}</p>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              {t('giftDetails.qualitiesToDevelop')}
                            </h3>
                            <div className="space-y-2 md:max-h-none md:overflow-visible max-h-40 overflow-y-auto">
                              {selectedGift.qualities?.map((quality, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {index + 1}
                                  </Badge>
                                  <div className="text-gray-700 text-sm">
                                    <span className="font-medium">{quality.quality_name}</span>
                                    {quality.description && (
                                      <p className="text-xs text-gray-600 mt-1">{quality.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              {t('giftDetails.characteristics')}
                            </h3>
                            <div className="space-y-2 md:max-h-none md:overflow-visible max-h-40 overflow-y-auto">
                              {selectedGift.characteristics?.map((char, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 text-sm">{char.characteristic}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-600" />
                              {t('giftDetails.precautions')}
                            </h3>
                            <div className="space-y-2 md:max-h-none md:overflow-visible max-h-40 overflow-y-auto">
                              {selectedGift.dangers?.map((danger, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 text-sm">{danger.danger}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-red-600" />
                              {t('giftDetails.misunderstandings')}
                            </h3>
                            <div className="space-y-2 md:max-h-none md:overflow-visible max-h-40 overflow-y-auto">
                              {selectedGift.misunderstandings?.map((misunderstanding, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-700 text-sm">{misunderstanding.misunderstanding}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div className="pt-4">
                            <Link href="/quiz">
                              <Button className="w-full">
                                {t('giftDetails.discoverIfIHave')}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">
                            {t('giftDetails.selectGift')}
                          </p>
                          <p className="text-sm text-gray-400">
                            {t('giftDetails.motivationsDescription')}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ministries" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMinistries.map((ministry) => (
                  <Card key={ministry.key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        {ministry.name}
                      </CardTitle>
                      <Badge
                        variant={ministry.type === 'PRIMARY' ? 'default' : 'secondary'}
                        className="w-fit"
                      >
                        {ministry.type}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm mb-4">{ministry.definition}</p>
                      {ministry.biblical_references && (
                        <Badge variant="outline" className="text-xs">
                          {ministry.biblical_references}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="manifestations" className="space-y-6">
              <div className="space-y-6">
                {['DISCERNIMENTO', 'PODER', 'DECLARACAO'].map((classification) => (
                  <div key={classification}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      Dons de {classification === 'DECLARACAO' ? 'Declaração' : classification}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredManifestations
                        .filter(m => m.classification === classification)
                        .map((manifestation) => (
                          <Card key={manifestation.key}>
                            <CardHeader>
                              <CardTitle className="text-lg">{manifestation.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 text-sm mb-4">{manifestation.definition}</p>
                              {manifestation.biblical_references && (
                                <Badge variant="outline" className="text-xs">
                                  {manifestation.biblical_references}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="flex items-center gap-2" onClick={handleDiscoverGifts}>
                <Star className="h-5 w-5" />
                {t('cta.button')}
              </Button>
              <Link href={`/${locale}/gifts/learn`}>
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Fundamentos Bíblicos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}