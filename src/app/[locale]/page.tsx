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

export default function HomePage() {
  const [selectedFeature, setSelectedFeature] = useState(0)
  const { user } = useAuth()
  const { allowGuestQuiz } = usePublicSettings()

  const features = [
    {
      icon: BookOpen,
      title: "Baseado nas Escrituras",
      description: "Fundamentado em textos bíblicos e estudos teológicos sólidos"
    },
    {
      icon: Heart,
      title: "Autoconhecimento Espiritual",
      description: "Descubra como Deus trabalha através de você de forma única"
    },
    {
      icon: Users,
      title: "Crescimento na Comunidade",
      description: "Entenda seu papel no Corpo de Cristo e na Igreja"
    },
    {
      icon: Trophy,
      title: "Histórico Personalizado",
      description: "Acompanhe sua jornada espiritual e crescimento ao longo do tempo"
    }
  ]

  const categories = [
    {
      name: "Motivações",
      greek: "Karismation",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "7 dons fundamentais que são a base da personalidade cristã"
    },
    {
      name: "Ministérios",
      greek: "Diakonion",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "12 ministérios para servir ao Corpo de Cristo"
    },
    {
      name: "Manifestações",
      greek: "Energias Planerosis",
      icon: Crown,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "9 manifestações do poder sobrenatural de Deus"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
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
            Descubra Seus
            <span className="block text-slate-600">Dons Espirituais</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Um teste abrangente baseado nas três categorias bíblicas de dons espirituais.
            Compreenda como Deus trabalha através de você e encontre seu lugar no Corpo de Cristo.
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
                {user ? "Começar" : allowGuestQuiz ? "Preview Gratuito" : "Fazer Login"}
              </Button>
            </Link>

            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-slate-300">
                  <Trophy className="mr-2 h-5 w-5" />
                  Meu Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/gifts">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-slate-300">
                  Conhecer os Dons
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
              <span>3-5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Biblicamente fundamentado</span>
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
              As Três Categorias de Dons
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Baseado na classificação bíblica dos dons espirituais, nosso teste avalia todas as dimensões
              de como Deus trabalha através de cada pessoa.
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
              Por Que Fazer Este Teste?
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
              Pronto Para Descobrir Seus Dons?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              {user
                ? "Continue sua jornada de autoconhecimento espiritual com nosso teste completo."
                : allowGuestQuiz 
                  ? "Comece com nosso preview gratuito e descubra uma amostra do que Deus colocou em você."
                  : "Faça login para acessar o teste completo de dons espirituais."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user || allowGuestQuiz ? "/quiz" : "/login?from=home"}>
                <Button size="lg" className="px-8 py-4 text-lg bg-white text-slate-800 hover:bg-slate-100">
                  <Star className="mr-2 h-5 w-5" />
                  {user ? "Fazer Teste Completo" : allowGuestQuiz ? "Começar Preview" : "Fazer Login"}
                </Button>
              </Link>

              {!user && allowGuestQuiz && (
                <p className="text-slate-400 text-sm">
                  • Preview de 3 perguntas • Sem cadastro necessário
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}