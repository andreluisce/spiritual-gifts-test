'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, BookOpen, Heart, Star, 
  AlertTriangle, Target, Lightbulb,
  Users, Crown
} from 'lucide-react'
import Link from 'next/link'
import { 
  useSpiritualGifts, 
  useCategories, 
  useMinistries, 
  useManifestations,
  type ExtendedSpiritualGift 
} from '@/hooks/use-quiz-queries'

export default function GiftsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGift, setSelectedGift] = useState<ExtendedSpiritualGift | null>(null)
  const [activeSection, setActiveSection] = useState('motivations')

  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts()
  const { data: categories, isLoading: loadingCategories } = useCategories()
  const { data: ministries } = useMinistries()
  const { data: manifestations } = useManifestations()

  const loading = loadingSpiritualGifts || loadingCategories

  const filteredGifts = spiritualGiftsData?.filter(gift =>
    gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Dons Espirituais
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            As Três Categorias: Motivações, Ministérios e Manifestações
          </p>
          
          {/* Call to Action */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/quiz">
              <Button size="lg" className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Descobrir Meus Dons
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Meu Histórico
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories Overview */}
        {categories && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {categories.map((category) => (
              <Card key={category.id} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    {category.name === 'MOTIVAÇÕES' && <Heart className="h-8 w-8 text-red-500" />}
                    {category.name === 'MINISTÉRIOS' && <Users className="h-8 w-8 text-green-500" />}
                    {category.name === 'MANIFESTAÇÕES' && <Crown className="h-8 w-8 text-purple-500" />}
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
              placeholder="Buscar dons, ministérios ou manifestações..."
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
              Motivações
            </TabsTrigger>
            <TabsTrigger value="ministries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ministérios
            </TabsTrigger>
            <TabsTrigger value="manifestations" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Manifestações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="motivations" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Gifts List */}
              <div className="lg:col-span-2">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredGifts.map((gift) => (
                    <Card 
                      key={gift.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedGift?.id === gift.id ? 'ring-2 ring-blue-500' : ''
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
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {gift.description}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                          <Badge variant="secondary" className="text-xs">
                            {gift.category?.greek_term || 'Karismation'}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {gift.characteristics.length} características
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Gift Detail Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {selectedGift ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">{selectedGift.name}</CardTitle>
                        <p className="text-sm text-gray-500">{selectedGift.category?.greek_term}</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Descrição
                          </h3>
                          <p className="text-gray-700">{selectedGift.description}</p>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Qualidades a Desenvolver
                          </h3>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedGift.qualities.map((quality, index) => (
                              <div key={quality.id} className="flex items-start gap-2">
                                <Badge variant="outline" className="text-xs mt-1">
                                  {index + 1}
                                </Badge>
                                <span className="text-gray-700 text-sm">{quality.quality_name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Características
                          </h3>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedGift.characteristics.slice(0, 5).map((char, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm">{char}</span>
                              </div>
                            ))}
                            {selectedGift.characteristics.length > 5 && (
                              <p className="text-xs text-gray-500 pl-4">
                                +{selectedGift.characteristics.length - 5} características adicionais
                              </p>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Cuidados
                          </h3>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {selectedGift.dangers.slice(0, 3).map((danger) => (
                              <Alert key={danger.id} className="py-2">
                                <AlertDescription className="text-xs">
                                  {danger.danger}
                                </AlertDescription>
                              </Alert>
                            ))}
                            {selectedGift.dangers.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{selectedGift.dangers.length - 3} cuidados adicionais
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-4">
                          <Link href="/quiz">
                            <Button className="w-full">
                              Descobrir Se Tenho Este Dom
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
                          Selecione um dom espiritual para ver mais detalhes
                        </p>
                        <p className="text-sm text-gray-400">
                          Os dons de motivação são impulsos básicos implantados por Deus
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
                <Card key={ministry.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-500" />
                      {ministry.name}
                    </CardTitle>
                    <Badge 
                      variant={ministry.type === 'PRIMARY' ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {ministry.type === 'PRIMARY' ? 'Principal' : 'Outros'}
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
                        <Card key={manifestation.id}>
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
            Pronto para descobrir seus dons?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nosso teste foi desenvolvido com base nas Escrituras e no documento &ldquo;Dons Espirituais - As Três Categorias&rdquo; 
            para ajudar você a identificar e compreender os dons que Deus lhe concedeu.
          </p>
          <Link href="/quiz">
            <Button size="lg" className="flex items-center gap-2 mx-auto">
              <Star className="h-5 w-5" />
              Fazer o Teste Agora
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}