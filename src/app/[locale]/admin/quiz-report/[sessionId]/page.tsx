'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQuizReport } from '@/hooks/useQuizReport'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ArrowLeft,
  Printer,
  Trophy,
  Calendar,
  CheckCircle2,
  TrendingUp,
  User,
  List
} from 'lucide-react'
import { GIFT_HEX_COLORS } from '@/utils/report-colors'

export default function QuizReportPage() {
  const t = useTranslations('quizReport')
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { report, loading, error, fetchReport } = useQuizReport()

  useEffect(() => {
    if (sessionId) {
      fetchReport(sessionId)
    }
  }, [sessionId, fetchReport])

  const handlePrint = () => {
    window.print()
  }

  // Derived Data for Charts
  const chartData = useMemo(() => {
    if (!report?.spiritual_gifts) return []
    return report.spiritual_gifts.map(g => ({
      name: g.gift_name,
      score: g.score || 0,
      color: GIFT_HEX_COLORS[g.gift_name] || GIFT_HEX_COLORS['default']
    }))
  }, [report])

  const maxScore = useMemo(() => {
    return Math.max(...(chartData.map(d => d.score) || [0])) || 1
  }, [chartData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
          <p className="text-red-500 mb-4">{error || t('error')}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
        </div>
      </div>
    )
  }

  const { session_info, spiritual_gifts, questions_and_answers } = report
  const topGift = spiritual_gifts[0]
  const topGiftColor = topGift ? (GIFT_HEX_COLORS[topGift.gift_name] || '#6B46C1') : '#6B46C1'

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans text-slate-800 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto print:max-w-none">

        {/* Header Actions - Hidden in Print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
          <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Printer className="h-4 w-4 mr-2" />
            {t('print')}
          </Button>
        </div>

        {/* REPORT HEADER */}
        <div className="mb-10 text-center print:mb-6">
          <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-widest print:text-2xl">
            {t('reportTitle')}
          </h1>
          <p className="text-slate-500 mt-2 uppercase text-sm tracking-wide">
            {t('reportSubtitle')}
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4 print:mb-6">

          {/* Card 1: User */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 print:border print:shadow-none">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <User size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">{t('sessionInfo.participant')}</p>
              <p className="text-lg font-bold text-slate-800 leading-tight">{session_info.user_name}</p>
              <p className="text-xs text-slate-500">{session_info.user_email}</p>
            </div>
          </div>

          {/* Card 2: Top Gift */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 print:border print:shadow-none">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: topGiftColor }}>
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">{t('sessionInfo.topGift')}</p>
              <p className="text-2xl font-bold" style={{ color: topGiftColor }}>
                {topGift?.gift_name || '-'}
              </p>
            </div>
          </div>

          {/* Card 3: Date */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 print:border print:shadow-none">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">{t('sessionInfo.analysisDate')}</p>
              <p className="text-xl font-bold text-slate-800">
                {new Date(session_info.started_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-6">

          {/* LEFT: BAR CHART (2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-8 print:col-span-2 print:border print:shadow-none">
            <h2 className="text-lg font-semibold text-slate-700 mb-8 border-b pb-4">
              {t('spiritualGifts.performanceTitle')}
            </h2>

            <div className="space-y-6">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-24 text-right text-sm font-medium text-slate-600 print:w-20 print:text-xs">
                    {item.name}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-50 rounded-md overflow-hidden relative print:bg-slate-50 print:h-6">
                      <div
                        className="h-full rounded-md transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                        style={{
                          width: `${(item.score / maxScore) * 100}%`,
                          backgroundColor: item.color,
                          opacity: 1
                        }}
                      >
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-bold text-slate-700 print:text-xs">
                    {item.score}
                  </div>
                </div>
              ))}
            </div>

            {/* X-Axis Labels (Simulated) */}
            <div className="flex pl-28 mt-4 text-xs text-slate-400 justify-between print:pl-24">
              <span>0</span>
              <span>{(maxScore * 0.5).toFixed(0)}</span>
              <span>{maxScore}</span>
            </div>
          </div>

          {/* RIGHT: BREAKDOWN (1/3 width) */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-8 print:col-span-1 print:border print:shadow-none flex flex-col h-full">
            <h2 className="text-lg font-semibold text-slate-700 mb-8 border-b pb-4">
              {t('spiritualGifts.breakdownTitle')}
            </h2>

            <div className="space-y-4 flex-1">
              {spiritual_gifts.map((gift, index) => {
                const giftColor = GIFT_HEX_COLORS[gift.gift_name] || '#94a3b8'
                return (
                  <div key={gift.gift_key} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: giftColor }}
                      ></div>
                      <span className="text-sm font-medium text-slate-700">{gift.gift_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{gift.score}</span>
                      {index === 0 && <TrendingUp size={14} className="text-green-500" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
              <div className="flex items-center text-xs text-slate-400 gap-2">
                <CheckCircle2 size={14} className="text-green-500" />
                <span>{t('spiritualGifts.completeAnalysis')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: INSIGHTS */}
        {report.ai_insights && report.ai_insights.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-8 print:mt-6 print:border print:shadow-none print:break-before-auto">
            <h2 className="text-lg font-semibold text-slate-700 mb-8 border-b pb-4">
              {t('aiInsights.customTitle')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3">
              {report.ai_insights.slice(0, 3).map((insight, idx) => {
                const giftName = insight.gift_name
                const giftColor = GIFT_HEX_COLORS[giftName] || '#6B46C1'
                const score = report.spiritual_gifts.find(g => g.gift_name === giftName)?.score || 0

                return (
                  <div key={idx} className="relative pt-8 p-6 bg-slate-50 rounded-xl text-center print:bg-white print:border print:p-4">
                    <div
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 flex items-center justify-center font-bold text-xl shadow-sm"
                      style={{ borderColor: `${giftColor}20`, color: giftColor }}
                    >
                      {score}
                    </div>
                    <h3 className="mt-6 text-lg font-bold mb-2" style={{ color: giftColor }}>{giftName}</h3>
                    <p className="text-sm text-slate-600 line-clamp-4 print:text-xs text-justify">
                      {insight.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DETAILED Q&A ACCORDION - HIDDEN IN PRINT */}
        {questions_and_answers && questions_and_answers.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6 print:hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="questions-list" className="border-b-0">
                <AccordionTrigger className="text-slate-700 hover:text-purple-700 font-semibold text-lg hover:no-underline">
                  <div className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    {t('questions.title', { count: questions_and_answers.length })}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    {questions_and_answers.map((qa, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{
                              color: GIFT_HEX_COLORS[qa.gift_category] || '#666',
                              backgroundColor: `${GIFT_HEX_COLORS[qa.gift_category]}20` || '#eee'
                            }}
                          >
                            {qa.gift_category}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${qa.answer_value >= 3 ? 'bg-green-100 text-green-700 border-green-200' :
                            qa.answer_value === 2 ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {qa.answer_label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {qa.question_text}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 text-center text-slate-400 text-sm print:mt-8 print:text-xs">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </div>
  )
}
