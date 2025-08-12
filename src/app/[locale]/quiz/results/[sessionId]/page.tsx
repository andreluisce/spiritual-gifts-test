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
  useSpiritualGifts,
  useCategories,
  type SpiritualGiftData,
} from '@/hooks/use-quiz-queries'
import { useLocale } from 'next-intl'
import { formatScore, formatPercentage } from '@/data/quiz-data'


export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const sessionId = params.sessionId as string
  const [activeTab, setActiveTab] = useState('overview')

  const { data: result, isLoading: loadingResults, error: resultsError } = useResultBySessionId(sessionId)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)

  const loading = loadingResults || loadingSpiritualGifts || loadingCategories

  // const getGiftByKey = (key: string): SpiritualGiftData | undefined => {
  //   return spiritualGiftsData?.find(gift => gift.gift_key === key)
  // }

  // Get the top gift data from the database function
  // const getTopGiftData = (): TopGiftDetail | undefined => {
  //   return topGiftDetails?.[0] // Return the highest scoring gift
  // }

  const getScorePercentage = (score: number, maxPossibleScore: number = 25): number => {
    return (score / maxPossibleScore) * 100
  }

  // Removed unused handlers for cleaner code

  const retakeQuiz = () => {
    router.push('/quiz')
  }

  // Get the complete top gift data
  // const getTopGiftWithCompleteData = (): SpiritualGiftData | null => {
  //   const topGiftData = getTopGiftData()
  //   if (!topGiftData || !spiritualGiftsData) return null
  //   
  //   return spiritualGiftsData.find(gift => gift.gift_key === topGiftData.gift_key) || null
  // }

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

  const allScores = spiritualGiftsData
    ? spiritualGiftsData.map(gift => ({
        giftKey: gift.gift_key,
        giftName: gift.name,
        definition: gift.definition,
        score: result.totalScore[gift.gift_key] || 0,
      }))
    : [];

  const sortedScores = allScores.sort((a, b) => b.score - a.score);

  // const topGiftWithCompleteData = getTopGiftWithCompleteData()
  // const topGiftDetail = getTopGiftData()

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
              {sortedScores.slice(0, 5).map((scoreData, index) => (
                <div key={scoreData.giftKey} className="text-center">
                  <Badge
                    variant={index === 0 ? "default" : "secondary"}
                    className="text-sm px-3 py-1 mb-2"
                  >
                    #{index + 1}
                  </Badge>
                  <p className="font-semibold">{scoreData.giftName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatScore(scoreData.score, 1)} pontos
                  </p>
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
                {sortedScores.map(({ giftKey, giftName, definition, score }, index) => {
                  const percentage = getScorePercentage(score)

                  return (
                    <div key={giftKey}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{giftName}</h3>
                          <p className="text-sm text-gray-600">{definition}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{formatScore(score, 0)}</div>
                          <div className="text-sm text-gray-500">pontos</div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-3 mb-2" />
                      <div className="text-sm text-gray-500 mb-4">
                        {formatPercentage(percentage)} de afinidade
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
                  <Card key={category.key}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Características Detalhadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Dados completos do dom principal não disponíveis. Mostrando informações básicas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualities" className="space-y-6 mt-[70px] md:mt-[40px]">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Dados de qualidades não disponíveis para análise completa.
              </AlertDescription>
            </Alert>
          </TabsContent>


          <TabsContent value="guidance" className="space-y-6 mt-[70px] md:mt-[40px]">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Orientações detalhadas não disponíveis para análise completa.
              </AlertDescription>
            </Alert>
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
