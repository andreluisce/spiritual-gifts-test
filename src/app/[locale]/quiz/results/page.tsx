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
  Award, Users, Church, FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import {
  useLatestResult,
  useSpiritualGifts,
  useCategories,
  type SpiritualGiftData
} from '@/hooks/use-quiz-queries'

import { useAuth } from '@/context/AuthContext'
import { formatScore, formatPercentage } from '@/data/quiz-data'

export default function ResultsPage() {
  const router = useRouter()
  const locale = useLocale()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: latestResult, isLoading: loadingResults, error: resultsError } = useLatestResult(user?.id || null)
  const { data: spiritualGiftsData, isLoading: loadingSpiritualGifts } = useSpiritualGifts(locale)
  const { data: categories, isLoading: loadingCategories } = useCategories(locale)

  const loading = loadingResults || loadingSpiritualGifts || loadingCategories

  const getGiftByKey = (key: string): SpiritualGiftData | undefined => {
    return spiritualGiftsData?.find(gift => gift.gift_key === key)
  }

  // Get extended spiritual gift data based on quiz results
  const getExtendedGiftData = (giftName: string): SpiritualGiftData | undefined => {
    if (!giftName || !spiritualGiftsData) return undefined;
    return spiritualGiftsData?.find(gift => 
      gift.name?.toLowerCase().includes(giftName.toLowerCase())
    )
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
    if (!latestResult || !spiritualGiftsData || latestResult.topGifts.length === 0) return null

    // Since the new RPC returns gift names in Portuguese, we need to use the gift keys from totalScore
    // to find the corresponding gift data
    const scores = Object.entries(latestResult.totalScore)
    if (scores.length === 0) return null

    // Get the highest scoring gift key
    const topGiftKey = scores.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    const topGift = getGiftByKey(topGiftKey)
    
    console.log('🔍 DEBUG - Top gift key:', topGiftKey)
    console.log('🔍 DEBUG - Top gift data:', topGift)
    console.log('🔍 DEBUG - Top gift characteristics:', topGift?.characteristics)
    
    return topGift
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
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

  console.log('🔍 DEBUG - user:', user);
  console.log('🔍 DEBUG - latestResult exists:', !!latestResult);
  console.log('🔍 DEBUG - spiritualGiftsData:', spiritualGiftsData);

  if (!latestResult) {
    console.log('🔍 DEBUG - No latestResult, returning no results page');
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

  // Debug: log the data to understand the issue
  console.log('🔍 DEBUG - latestResult:', latestResult);
  console.log('🔍 DEBUG - latestResult.totalScore:', latestResult?.totalScore);

  const allScores = spiritualGiftsData
    ? spiritualGiftsData.map(gift => {
        console.log(`🔍 DEBUG - Processing gift:`, gift);
        const score = latestResult.totalScore[gift.gift_key] || 0;
        console.log(`🔍 DEBUG - Gift ${gift.gift_key}: score = ${score}`);
        return {
          giftKey: gift.gift_key,
          score: score,
        };
      }).filter(scoreData => {
        const giftFound = getGiftByKey(scoreData.giftKey) !== undefined;
        console.log(`🔍 DEBUG - Gift ${scoreData.giftKey} found: ${giftFound}`);
        return giftFound;
      })
    : [];

  // Sort scores by score value (descending) since we have totalScore directly
  const sortedScores = allScores.sort((a, b) => {
    return b.score - a.score
  });

  const topGiftWithData = getTopGiftWithData()

  // Calculate rankings considering tied scores
  const calculateRankings = () => {
    const rankingsMap = new Map<string, number>()
    let currentRank = 1
    let previousScore: number | null = null
    let sameRankCount = 0

    sortedScores.forEach((scoreData) => {
      const currentScore = scoreData.score

      if (previousScore !== null && currentScore !== previousScore) {
        // Score changed, update rank
        currentRank += sameRankCount
        sameRankCount = 1
      } else {
        // Same score or first item
        sameRankCount++
      }

      const gift = getGiftByKey(scoreData.giftKey)
      if (gift) {
        rankingsMap.set(gift.name, currentRank)
      }

      previousScore = currentScore
    })

    return rankingsMap
  }

  const rankingsMap = calculateRankings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Gift className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Seus Dons Espirituais
          </h1>
          <p className="text-gray-600">
            Resultado do teste realizado em {new Date(latestResult.createdAt).toLocaleDateString('pt-BR')}
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
              {latestResult.topGifts.map((giftName, index) => {
                const rank = rankingsMap.get(giftName) || index + 1
                return (
                  <div key={index} className="text-center">
                    <Badge
                      variant={rank === 1 ? "default" : "secondary"}
                      className="text-sm px-3 py-1 mb-2"
                    >
                      #{rank}
                    </Badge>
                    <p className="font-semibold">{giftName}</p>
                    {rank === 1 && topGiftWithData && (
                      <p className="text-xs text-gray-500 mt-1">
Dom Espiritual
                      </p>
                    )}
                  </div>
                )
              })}
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
                  const gift = getGiftByKey(giftKey)!  // Safe now due to filter above

                  const percentage = getScorePercentage(score)

                  return (
                    <div key={giftKey}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{gift.name}</h3>
                          <p className="text-sm text-gray-600">{gift.definition}</p>
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
                    {topGiftWithData.characteristics?.map((char, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Badge variant="outline" className="mt-1">
                          {index + 1}
                        </Badge>
                        <p className="text-gray-700 flex-1">{char.characteristic}</p>
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
                    Qualidades importantes para desenvolver no dom de {topGiftWithData.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {topGiftWithData.qualities?.map((quality, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <Badge variant="outline" className="mt-1 bg-green-100 text-green-800">
                          {index + 1}
                        </Badge>
                        <div className="flex-1">
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


          <TabsContent value="guidance" className="space-y-6 mt-[70px] md:mt-[40px]">
            {topGiftWithData ? (
              <>

                {/* Biblical References */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Referências Bíblicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(topGiftWithData.biblicalReferences?.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {topGiftWithData.biblicalReferences?.map((reference, index) => (
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
          <Link href={`/${locale}/quiz/report`}>
            <Button variant="default" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <FileText size={16} />
              Relatório Completo (PDF)
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

          <Link href="/dashboard">
            <Button variant="outline">
              Meu Histórico
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}