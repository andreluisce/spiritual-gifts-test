'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, AlertCircle, Layers, Heart, Users, Crown, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useImportantIntro,
  useObstacles,
  useThreeCategories,
  useBiblicalContext,
  useMinistries,
  useManifestations,
  useManifestationPrinciples
} from '@/hooks/useEducationalContent'

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState('intro')

  const { data: importantIntro, isLoading: loadingIntro } = useImportantIntro()
  const { data: obstacles, isLoading: loadingObstacles } = useObstacles()
  const { data: categories, isLoading: loadingCategories } = useThreeCategories()
  const { data: biblicalContext, isLoading: loadingBiblical } = useBiblicalContext()
  const { data: ministries, isLoading: loadingMinistries } = useMinistries()
  const { data: manifestations, isLoading: loadingManifestations } = useManifestations()
  const { data: principles, isLoading: loadingPrinciples } = useManifestationPrinciples()

  const loading = loadingIntro || loadingObstacles || loadingCategories ||
    loadingBiblical || loadingMinistries || loadingManifestations ||
    loadingPrinciples

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo educativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/gifts">
            <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Dons
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Aprenda sobre Dons Espirituais
              </h1>
              <p className="text-xl text-gray-600 mt-2">
                Fundamentos bíblicos e orientações práticas
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 mb-8">
            <TabsTrigger value="intro" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Introdução</span>
            </TabsTrigger>
            <TabsTrigger value="obstacles" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Obstáculos</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Categorias</span>
            </TabsTrigger>
            <TabsTrigger value="biblical" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Bíblico</span>
            </TabsTrigger>
            <TabsTrigger value="ministries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Ministérios</span>
            </TabsTrigger>
            <TabsTrigger value="manifestations" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Manifestações</span>
            </TabsTrigger>
            <TabsTrigger value="principles" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Princípios</span>
            </TabsTrigger>
          </TabsList>

          {/* IMPORTANTE - Introdução */}
          <TabsContent value="intro" className="space-y-6">
            {importantIntro?.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <CardTitle className="text-2xl">{item.title}</CardTitle>
                      {item.biblical_reference && (
                        <Badge variant="outline" className="mt-2">
                          {item.biblical_reference}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Obstáculos */}
          <TabsContent value="obstacles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  O que impede de descobrir seu dom espiritual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {obstacles?.map((obstacle, index) => (
                    <div key={obstacle.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {obstacle.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {obstacle.content}
                        </p>
                        {obstacle.biblical_reference && (
                          <Badge variant="outline" className="mt-2">
                            {obstacle.biblical_reference}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* As 3 Categorias */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Layers className="h-6 w-6 text-blue-600" />
                  As Três Categorias de Dons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {categories?.map((category) => (
                    <Card key={category.id} className="border-2">
                      <CardHeader>
                        <div className="flex justify-center mb-3">
                          {category.title.includes('Motivação') && <Heart className="h-10 w-10 text-red-500" />}
                          {category.title.includes('Ministério') && <Users className="h-10 w-10 text-green-500" />}
                          {category.title.includes('Manifestação') && <Crown className="h-10 w-10 text-purple-500" />}
                        </div>
                        <CardTitle className="text-center text-xl">
                          {category.title}
                        </CardTitle>
                        {category.biblical_reference && (
                          <Badge variant="outline" className="w-fit mx-auto mt-2">
                            {category.biblical_reference}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {category.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contexto Bíblico */}
          <TabsContent value="biblical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Contexto Bíblico: O que todos devem fazer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {biblicalContext?.map((item) => (
                    <Card key={item.id} className="bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.biblical_reference && (
                          <Badge variant="secondary" className="w-fit">
                            {item.biblical_reference}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {item.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ministérios */}
          <TabsContent value="ministries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  Os 12 Ministérios
                </CardTitle>
                <p className="text-gray-600">
                  Dons de serviço dados pelo Cristo ressurreto à Igreja
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ministries?.map((ministry) => (
                    <Card key={ministry.id} className="bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
                          {ministry.title}
                        </CardTitle>
                        {ministry.biblical_reference && (
                          <Badge variant="secondary" className="w-fit">
                            {ministry.biblical_reference}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {ministry.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manifestações */}
          <TabsContent value="manifestations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Crown className="h-6 w-6 text-purple-600" />
                  As 9 Manifestações do Espírito
                </CardTitle>
                <p className="text-gray-600">
                  Capacitações sobrenaturais do Espírito Santo
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {manifestations?.map((manifestation) => (
                    <Card key={manifestation.id} className="bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="h-5 w-5 text-purple-600" />
                          {manifestation.title}
                        </CardTitle>
                        {manifestation.biblical_reference && (
                          <Badge variant="secondary" className="w-fit">
                            {manifestation.biblical_reference}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {manifestation.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Princípios das Manifestações */}
          <TabsContent value="principles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                  Princípios das Manifestações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {principles?.map((principle, index) => (
                    <Card key={principle.id} className="bg-yellow-50 border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{principle.title}</CardTitle>
                            {principle.biblical_reference && (
                              <Badge variant="outline" className="mt-2">
                                {principle.biblical_reference}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {principle.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para descobrir seus dons?
            </h2>
            <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
              Agora que você entende os fundamentos, faça o teste e descubra como Deus te capacitou para servir.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/quiz">
                <Button size="lg" variant="secondary" className="text-blue-700">
                  Fazer o Teste
                </Button>
              </Link>
              <Link href="/gifts">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Ver Todos os Dons
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
