'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, BookOpen, Heart, Star } from 'lucide-react'
import Link from 'next/link'
import { spiritualGifts } from '@/data/quiz-data'
import type { SpiritualGift } from '@/data/quiz-data'

export default function GiftsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGift, setSelectedGift] = useState<SpiritualGift | null>(null)

  const filteredGifts = spiritualGifts.filter(gift =>
    gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gift.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            Descubra e entenda os diversos dons que Deus concede ao Seu povo
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

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar dons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Gifts List */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredGifts.map((gift) => (
                <Card 
                  key={gift.key}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedGift?.key === gift.key ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{gift.name}</span>
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {gift.description}
                    </p>
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {gift.biblicalReferences.slice(0, 2).map((ref, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {ref}
                          </Badge>
                        ))}
                        {gift.biblicalReferences.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{gift.biblicalReferences.length - 2}
                          </Badge>
                        )}
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
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Descrição</h3>
                      <p className="text-gray-700">{selectedGift.description}</p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">Características</h3>
                      <ul className="space-y-2">
                        {selectedGift.characteristics.map((characteristic, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm">{characteristic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-3">Referências Bíblicas</h3>
                      <div className="space-y-2">
                        {selectedGift.biblicalReferences.map((reference, index) => (
                          <Badge key={index} variant="outline" className="mr-2 mb-2">
                            {reference}
                          </Badge>
                        ))}
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
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Selecione um dom espiritual para ver mais detalhes
                    </p>
                    <p className="text-sm text-gray-400">
                      Clique em qualquer card à esquerda para começar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pronto para descobrir seus dons?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nosso teste foi desenvolvido com base nas Escrituras para ajudar você a identificar 
            e compreender os dons espirituais que Deus lhe concedeu.
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