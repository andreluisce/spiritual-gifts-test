'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
    ArrowLeft, Heart, Star, Users, Crown, Sparkles, Target,
    AlertTriangle, HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { useSpiritualGifts } from '@/hooks/use-quiz-queries'

export default function GiftDetailPage() {
    const params = useParams()
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations('gifts')
    const [activeTab, setActiveTab] = useState('qualities')

    const giftKey = (params.giftKey as string)?.toUpperCase()
    const { data: gifts, isLoading } = useSpiritualGifts(locale)

    const gift = gifts?.find(g => g.gift_key === giftKey)

    useEffect(() => {
        if (!isLoading && !gift) {
            router.push(`/${locale}/gifts`)
        }
    }, [gift, isLoading, router, locale])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Carregando...</div>
            </div>
        )
    }

    if (!gift) {
        return null
    }

    const getCategoryIcon = () => {
        if (gift.category_key === 'motivational' || gift.category_key === 'motivations') {
            return <Heart className="h-8 w-8 text-white" />
        }
        if (gift.category_key === 'ministries') {
            return <Users className="h-8 w-8 text-white" />
        }
        return <Crown className="h-8 w-8 text-white" />
    }

    const getCategoryGradient = () => {
        if (gift.category_key === 'motivational' || gift.category_key === 'motivations') {
            return 'from-rose-500 to-pink-600'
        }
        if (gift.category_key === 'ministries') {
            return 'from-emerald-500 to-teal-600'
        }
        return 'from-violet-500 to-purple-600'
    }

    const tabs = [
        {
            id: 'qualities',
            label: 'Qualidades',
            icon: Sparkles,
            items: gift.qualities?.map(q => q.quality_name) || []
        },
        {
            id: 'characteristics',
            label: 'Características',
            icon: Target,
            items: gift.characteristics?.map(c => c.characteristic) || []
        },
        {
            id: 'dangers',
            label: 'Perigos',
            icon: AlertTriangle,
            items: gift.dangers?.map(d => d.danger) || []
        },
        {
            id: 'misunderstandings',
            label: 'Mal-entendidos',
            icon: HelpCircle,
            items: gift.misunderstandings?.map(m => m.misunderstanding) || []
        }
    ].filter(tab => tab.items.length > 0)

    const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0]

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Header with Gradient */}
            <div className={`bg-gradient-to-br ${getCategoryGradient()} text-white`}>
                <div className="max-w-4xl mx-auto px-6 py-16">
                    <Link href={`/${locale}/gifts`}>
                        <Button variant="ghost" size="sm" className="mb-8 text-white hover:bg-white/20 -ml-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                {getCategoryIcon()}
                            </div>
                        </div>

                        <div className="text-sm font-medium mb-4 opacity-90">
                            {gift.category_name}
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                            {gift.name}
                        </h1>

                        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                            {gift.definition}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id
                            const Icon = tab.icon

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap
                    ${isActive
                                            ? 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium">{tab.label}</span>
                                    <span className="text-xs opacity-60">({tab.items.length})</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="space-y-4">
                            {activeTabData.items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed flex-1">
                                        {item}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* CTA */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-16 pt-12 border-t border-gray-100"
                >
                    <div className="text-center">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                            Descubra seus dons espirituais
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                            Faça o teste completo e receba um relatório personalizado
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href={`/${locale}/quiz`}>
                                <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
                                    <Star className="h-4 w-4 mr-2" />
                                    Fazer o Teste
                                </Button>
                            </Link>
                            <Link href={`/${locale}/gifts`}>
                                <Button size="lg" variant="outline">
                                    Ver Todos os Dons
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
