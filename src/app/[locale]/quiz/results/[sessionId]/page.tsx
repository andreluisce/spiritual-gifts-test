'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Gift, RotateCcw,
  BookOpen, AlertTriangle, Heart,
  Target, Lightbulb,
  Award, Users, Church, ArrowLeft
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  useResultBySessionId,
  useGifts,
  useSpiritualGifts,
  useCategories,
  type ExtendedSpiritualGift
} from '@/hooks/use-quiz-queries'
import type { SpiritualGift } from '@/data/quiz-data'

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: result, isLoading: loadingResults, error: resultsError } = useResultBySessionId(sessionId)
  const { data: gifts, isLoading: loadingGifts } = useGifts()
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts()
  const { data: categories, isLoading: loadingCategories } = useCategories()

  const loading = loadingResults || loadingGifts || loadingSpiritualGifts || loadingCategories

  const getGiftByKey = (key: string): SpiritualGift | undefined => {
    return gifts?.find(gift => gift.key === key)
  }

  // Get extended spiritual gift data based on quiz results
  const getExtendedGiftData = (giftName: string): ExtendedSpiritualGift | undefined => {
    return spiritualGiftsData?.find(gift => gift.name.toLowerCase().includes(giftName.toLowerCase()))
  }

  const getScorePercentage = (score: number, maxPossibleScore: number = 25): number => {
    return (score / maxPossibleScore) * 100
  }

  // Removed unused handlers for cleaner code

  const retakeQuiz = () => {
    router.push('/quiz')
  }

  // Get the top gift with extended data
  const getTopGiftWithData = () => {
    if (!result || !spiritualGiftsData || result.topGifts.length === 0) return null

    const topGiftName = result.topGifts[0]
    return getExtendedGiftData(topGiftName)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (resultsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Erro ao carregar resultados: {resultsError.message}</p>
          <Button onClick={() => router.push('/quiz')}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Nenhum resultado encontrado</p>
          <Button onClick={() => router.push('/quiz')}>
            Fazer o Teste
          </Button>
        </div>
      </div>
    )
  }

  const allScores = gifts
    ? gifts.map(gift => ({
        giftKey: gift.key,
        score: result.totalScore[gift.key] || 0,
      }))
    : [];

  const sortedScores = allScores.sort((a, b) => b.score - a.score);

  const topGiftWithData = getTopGiftWithData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Back button */}
          <div className="absolute left-0 top-0">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </div>
          
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Seus Dons Espirituais
          </h1>
          <p className="text-gray-600">
            Resultado do teste realizado em {new Date(result.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Top Gifts Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Seus Principais Dons Espirituais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {result.topGifts.map((giftName, index) => (
                <div key={index} className="text-center">
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className="text-sm px-3 py-1 mb-2"
                  >
                    #{index + 1}
                  </Badge>
                  <p className="font-semibold">{giftName}</p>
                  {index === 0 && topGiftWithData && (
                    <p className="text-xs text-gray-500 mt-1">
                      {topGiftWithData.category?.greek_term}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-2 w-full mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="characteristics">Características</TabsTrigger>
            <TabsTrigger value="qualities">Qualidades</TabsTrigger>
            <TabsTrigger value="dangers">Cuidados</TabsTrigger>
            <TabsTrigger value="guidance">Orientações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-[70px] md:mt-[40px]">
            {/* Detailed Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pontuação Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sortedScores.map(({ giftKey, score }, index) => {
                  const gift = getGiftByKey(giftKey)
                  if (!gift) return null

                  const percentage = getScorePercentage(score)

                  return (
                    <div key={giftKey}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{gift.name}</h3>
                          <p className="text-sm text-gray-600">{gift.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{score}</div>
                          <div className="text-sm text-gray-500">pontos</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3 mb-2" />
                      <div className="text-sm text-gray-500 mb-4">
                        {percentage.toFixed(0)}% de afinidade
                      </div>
                      {index < sortedScores.length - 1 && <Separator />}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Categories Overview */}
            {categories && (
              <div className="grid md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {category.name === 'MOTIVAÇÕES' && <Heart className="h-5 w-5" />}
                        {category.name === 'MINISTÉRIOS' && <Users className="h-5 w-5" />}
                        {category.name === 'MANIFESTAÇÕES' && <Church className="h-5 w-5" />}
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{category.greek_term}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-2">{category.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{category.purpose}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="characteristics" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Características do Dom de {topGiftWithData.name}
                  </CardTitle>
                  <p className="text-gray-600">{topGiftWithData.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {topGiftWithData.characteristics.map((char, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          {index + 1}
                        </Badge>
                        <p className="text-gray-700 flex-1">{char}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados completos do dom principal não disponíveis. Mostrando informações básicas.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="qualities" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Qualidades a Desenvolver
                  </CardTitle>
                  <p className="text-gray-600">
                    Sete qualidades importantes para desenvolver no dom de {topGiftWithData.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {topGiftWithData.qualities.map((quality, index) => (
                      <div key={quality.id} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {quality.quality_name}
                          </h4>
                          {quality.description && (
                            <p className="text-sm text-gray-600">{quality.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados de qualidades não disponíveis para análise completa.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="dangers" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Cuidados e Perigos
                  </CardTitle>
                  <p className="text-gray-600">
                    Aspectos importantes a observar para um exercício saudável do dom
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topGiftWithData.dangers.map((danger, index) => (
                      <Alert key={danger.id} className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                          <span className="font-semibold text-amber-800 mr-2">
                            {index + 1}.
                          </span>
                          <span className="text-amber-700">{danger.danger}</span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Dados de cuidados não disponíveis para análise completa.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="guidance" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Possíveis Mal-entendidos
                    </CardTitle>
                    <p className="text-gray-600">
                      Como seu dom pode ser interpretado pelos outros
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topGiftWithData.misunderstandings.map((misunderstanding, index) => (
                        <div key={misunderstanding.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="secondary">
                            {index + 1}
                          </Badge>
                          <p className="text-gray-700 flex-1">{misunderstanding.misunderstanding}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Biblical References */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Referências Bíblicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topGiftWithData.biblicalReferences.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {topGiftWithData.biblicalReferences.map((reference, index) => (
                          <Badge key={index} variant="outline" className="text-blue-600">
                            {reference}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Referências bíblicas específicas em desenvolvimento.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Orientações detalhadas não disponíveis para análise completa.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/dashboard">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <ArrowLeft size={16} />
              Voltar ao Dashboard
            </Button>
          </Link>

          <Button variant="outline" onClick={retakeQuiz} className="flex items-center gap-2">
            <RotateCcw size={16} />
            Refazer Teste
          </Button>

          <Link href="/gifts">
            <Button variant="outline">
              Ver Todos os Dons
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
