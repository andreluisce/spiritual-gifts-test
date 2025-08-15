'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Heart,
  Users,
  Crown,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Trophy,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { usePublicSettings } from '@/hooks/usePublicSettings'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const [selectedFeature, setSelectedFeature] = useState(0)
  const { user } = useAuth()
  const { allowGuestQuiz } = usePublicSettings()
  const t = useTranslations('home')
  const tCommon = useTranslations('common')

  const features = t.raw('features.items').map((feature: any, index: number) => ({
    icon: [BookOpen, Heart, Users, Trophy][index],
    title: feature.title,
    description: feature.description
  }))

  const categories = t.raw('categories.items').map((category: any, index: number) => ({
    name: category.name,
    greek: category.greek,
    icon: [Heart, Users, Crown][index],
    color: ["text-red-500", "text-green-500", "text-purple-500"][index],
    bgColor: ["bg-red-50", "bg-green-50", "bg-purple-50"][index],
    borderColor: ["border-red-200", "border-green-200", "border-purple-200"][index],
    description: category.description
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100">
      {/* Header with Language Toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-slate-600" />
            <span className="font-semibold text-slate-800 hidden sm:inline">{t('title')} {t('titleHighlight')}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <LanguageToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden mt-16">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-slate-200 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-stone-200 rounded-full opacity-30 blur-xl"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white rounded-full p-6 shadow-lg">
              <BookOpen className="h-16 w-16 text-slate-600" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-slate-800 mb-6"
          >
            {t('title')}
            <span className="block text-slate-600">{t('titleHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href={user || allowGuestQuiz ? "/quiz" : "/login?from=home"}>
              <Button size="lg" className="px-8 py-4 text-lg bg-slate-700 hover:bg-slate-800">
                <Sparkles className="mr-2 h-5 w-5" />
                {user ? t('cta.primary') : allowGuestQuiz ? t('cta.primary') : t('cta.secondary')}
              </Button>
            </Link>

            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-slate-300">
                  <Trophy className="mr-2 h-5 w-5" />
                  {tCommon('dashboard')}
                </Button>
              </Link>
            ) : (
              <Link href="/gifts">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-slate-300">
                  {t('features.title')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>3-5 {t('stats.tests')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('features.items.0.title')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link href="/gifts" key={category.name}>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Card className={`h-full border-2 ${category.borderColor} ${category.bgColor} hover:shadow-lg transition-all duration-300`}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${category.bgColor}`}>
                          <category.icon className={`h-8 w-8 ${category.color}`} />
                        </div>
                      </div>
                      <CardTitle className="text-2xl text-slate-800">
                        {category.name}
                      </CardTitle>
                      <Badge variant="outline" className="w-fit mx-auto text-slate-600">
                        {category.greek}
                      </Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-slate-700">{category.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {t('features.title')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link href={feature.title === 'Histórico Personalizado' ? '/dashboard' : '/gifts'} key={index}>
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setSelectedFeature(index)}
                  className="cursor-pointer h-full"
                >
                  <Card className={`h-full transition-all duration-300 hover:shadow-lg ${selectedFeature === index ? 'ring-2 ring-slate-300 shadow-lg' : ''
                    }`}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <feature.icon className="h-12 w-12 text-slate-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-slate-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {user
                ? t('subtitle')
                : allowGuestQuiz 
                  ? t('subtitle')
                  : t('subtitle')
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user || allowGuestQuiz ? "/quiz" : "/login?from=home"}>
                <Button size="lg" className="px-8 py-4 text-lg bg-white text-slate-800 hover:bg-slate-100">
                  <Star className="mr-2 h-5 w-5" />
                  {user ? t('cta.primary') : allowGuestQuiz ? t('cta.primary') : t('cta.secondary')}
                </Button>
              </Link>

              {!user && allowGuestQuiz && (
                <p className="text-slate-400 text-sm">
                  • {t('stats.questions')} • {t('cta.secondary')}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}