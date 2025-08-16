import type { Database } from '@/lib/database.types'
import { spiritualGifts } from '@/data/quiz-data'

export interface GiftCompatibility {
  primaryGift: string
  secondaryGifts: string[]
  compatibilityScore: number
  strengthAreas: string[]
  potentialChallenges: string[]
  synergyDescription: string
}

export interface MinistryRecommendation {
  ministryName: string
  description: string
  requiredGifts: string[]
  optimalGifts: string[]
  compatibilityScore: number
  responsibilities: string[]
  growthAreas: string[]
}

// Gift compatibility matrix - defines which gifts work well together
const GIFT_SYNERGIES: Record<string, {
  strongSynergies: string[]
  moderateSynergies: string[]
  challenges: string[]
  descriptions: Record<string, string>
}> = {
  'A_PROPHECY': {
    strongSynergies: ['C_TEACHING', 'D_EXHORTATION', 'F_LEADERSHIP'],
    moderateSynergies: ['G_MERCY', 'B_SERVICE'],
    challenges: ['E_GIVING'],
    descriptions: {
      'C_TEACHING': 'Profecia + Ensino: Capacidade única de revelar verdades bíblicas profundas e ensiná-las claramente',
      'D_EXHORTATION': 'Profecia + Exortação: Poder para confrontar e encorajar com autoridade espiritual',
      'F_LEADERSHIP': 'Profecia + Liderança: Visão profética combinada com capacidade de guiar outros'
    }
  },
  'B_SERVICE': {
    strongSynergies: ['G_MERCY', 'E_GIVING', 'D_EXHORTATION'],
    moderateSynergies: ['C_TEACHING', 'F_LEADERSHIP'],
    challenges: ['A_PROPHECY'],
    descriptions: {
      'G_MERCY': 'Serviço + Misericórdia: Combinação poderosa para ministérios de cuidado e assistência',
      'E_GIVING': 'Serviço + Contribuição: Capacidade de servir e prover recursos simultaneamente',
      'D_EXHORTATION': 'Serviço + Exortação: Servir enquanto encoraja e motiva outros'
    }
  },
  'C_TEACHING': {
    strongSynergies: ['A_PROPHECY', 'F_LEADERSHIP', 'D_EXHORTATION'],
    moderateSynergies: ['B_SERVICE', 'G_MERCY'],
    challenges: ['E_GIVING'],
    descriptions: {
      'A_PROPHECY': 'Ensino + Profecia: Revelação divina comunicada com clareza pedagógica',
      'F_LEADERSHIP': 'Ensino + Liderança: Capacidade de ensinar e guiar simultaneamente',
      'D_EXHORTATION': 'Ensino + Exortação: Educação que transforma e motiva'
    }
  },
  'D_EXHORTATION': {
    strongSynergies: ['G_MERCY', 'A_PROPHECY', 'C_TEACHING'],
    moderateSynergies: ['B_SERVICE', 'F_LEADERSHIP'],
    challenges: ['E_GIVING'],
    descriptions: {
      'G_MERCY': 'Exortação + Misericórdia: Encorajamento compassivo e cura emocional',
      'A_PROPHECY': 'Exortação + Profecia: Poder para exortar com autoridade profética',
      'C_TEACHING': 'Exortação + Ensino: Educação motivacional e transformadora'
    }
  },
  'E_GIVING': {
    strongSynergies: ['B_SERVICE', 'G_MERCY', 'F_LEADERSHIP'],
    moderateSynergies: ['D_EXHORTATION'],
    challenges: ['A_PROPHECY', 'C_TEACHING'],
    descriptions: {
      'B_SERVICE': 'Contribuição + Serviço: Generosidade prática que supre necessidades diretamente',
      'G_MERCY': 'Contribuição + Misericórdia: Compaixão expressa através de generosidade',
      'F_LEADERSHIP': 'Contribuição + Liderança: Liderança que inspira generosidade e provisão'
    }
  },
  'F_LEADERSHIP': {
    strongSynergies: ['A_PROPHECY', 'C_TEACHING', 'E_GIVING'],
    moderateSynergies: ['D_EXHORTATION', 'B_SERVICE'],
    challenges: ['G_MERCY'],
    descriptions: {
      'A_PROPHECY': 'Liderança + Profecia: Liderança visionária guiada por revelação divina',
      'C_TEACHING': 'Liderança + Ensino: Capacidade de liderar através do ensino e discipulado',
      'E_GIVING': 'Liderança + Contribuição: Liderança que mobiliza recursos e generosidade'
    }
  },
  'G_MERCY': {
    strongSynergies: ['B_SERVICE', 'D_EXHORTATION', 'E_GIVING'],
    moderateSynergies: ['C_TEACHING', 'A_PROPHECY'],
    challenges: ['F_LEADERSHIP'],
    descriptions: {
      'B_SERVICE': 'Misericórdia + Serviço: Compaixão ativa que se manifesta em ações concretas',
      'D_EXHORTATION': 'Misericórdia + Exortação: Encorajamento profundamente compassivo',
      'E_GIVING': 'Misericórdia + Contribuição: Generosidade motivada pela compaixão'
    }
  }
}

// Ministry recommendations based on gift combinations
const MINISTRY_RECOMMENDATIONS: MinistryRecommendation[] = [
  {
    ministryName: 'Ensino e Pregação',
    description: 'Ministério focado no ensino da Palavra e pregação expositiva',
    requiredGifts: ['C_TEACHING'],
    optimalGifts: ['C_TEACHING', 'A_PROPHECY', 'F_LEADERSHIP'],
    compatibilityScore: 0,
    responsibilities: [
      'Preparar e ministrar estudos bíblicos',
      'Pregar sermões expositivos',
      'Desenvolver materiais didáticos',
      'Discipular novos convertidos'
    ],
    growthAreas: [
      'Desenvolver habilidades de comunicação',
      'Aprofundar conhecimento bíblico',
      'Praticar hermenêutica'
    ]
  },
  {
    ministryName: 'Liderança',
    description: 'Coordenação de ministérios e liderança organizacional',
    requiredGifts: ['F_LEADERSHIP'],
    optimalGifts: ['F_LEADERSHIP', 'C_TEACHING', 'A_PROPHECY'],
    compatibilityScore: 0,
    responsibilities: [
      'Coordenar equipes ministeriais',
      'Planejar estratégias de crescimento',
      'Desenvolver líderes',
      'Tomar decisões administrativas'
    ],
    growthAreas: [
      'Desenvolver habilidades de gestão',
      'Estudar princípios de liderança bíblica',
      'Praticar delegação eficaz'
    ]
  },
  {
    ministryName: 'Aconselhamento e Cuidado Pastoral',
    description: 'Ministério de cuidado, aconselhamento e restauração',
    requiredGifts: ['G_MERCY'],
    optimalGifts: ['G_MERCY', 'D_EXHORTATION', 'B_SERVICE'],
    compatibilityScore: 0,
    responsibilities: [
      'Oferecer aconselhamento bíblico',
      'Visitação hospitalar e domiciliar',
      'Cuidar de pessoas em crise',
      'Ministrar cura emocional'
    ],
    growthAreas: [
      'Estudar princípios de aconselhamento bíblico',
      'Desenvolver habilidades de escuta ativa',
      'Aprender sobre psicologia bíblica'
    ]
  },
  {
    ministryName: 'Ministério Social e Diaconia',
    description: 'Serviço prático e assistência às necessidades da comunidade',
    requiredGifts: ['B_SERVICE'],
    optimalGifts: ['B_SERVICE', 'G_MERCY', 'E_GIVING'],
    compatibilityScore: 0,
    responsibilities: [
      'Organizar projetos sociais',
      'Distribuir alimentos e recursos',
      'Manutenção da igreja',
      'Apoiar famílias necessitadas'
    ],
    growthAreas: [
      'Desenvolver habilidades práticas',
      'Estudar responsabilidade social cristã',
      'Aprender gestão de recursos'
    ]
  },
  {
    ministryName: 'Evangelismo e Missões',
    description: 'Compartilhamento do evangelho e expansão do Reino',
    requiredGifts: ['A_PROPHECY', 'D_EXHORTATION'],
    optimalGifts: ['A_PROPHECY', 'D_EXHORTATION', 'F_LEADERSHIP'],
    compatibilityScore: 0,
    responsibilities: [
      'Evangelizar não-convertidos',
      'Organizar campanhas evangelísticas',
      'Treinar evangelistas',
      'Plantar igrejas'
    ],
    growthAreas: [
      'Estudar métodos evangelísticos',
      'Desenvolver coragem para testemunhar',
      'Aprender sobre diferentes culturas'
    ]
  },
  {
    ministryName: 'Ministério de Intercessão',
    description: 'Oração intercessória e guerra espiritual',
    requiredGifts: ['A_PROPHECY', 'G_MERCY'],
    optimalGifts: ['A_PROPHECY', 'G_MERCY', 'D_EXHORTATION'],
    compatibilityScore: 0,
    responsibilities: [
      'Liderar reuniões de oração',
      'Interceder pelos necessitados',
      'Ensinar sobre oração',
      'Ministrar cura através da oração'
    ],
    growthAreas: [
      'Aprofundar vida de oração pessoal',
      'Estudar princípios de intercessão',
      'Desenvolver sensibilidade espiritual'
    ]
  },
  {
    ministryName: 'Administração Financeira',
    description: 'Gestão de recursos e promoção da mordomia cristã',
    requiredGifts: ['E_GIVING'],
    optimalGifts: ['E_GIVING', 'F_LEADERSHIP', 'B_SERVICE'],
    compatibilityScore: 0,
    responsibilities: [
      'Gerenciar finanças da igreja',
      'Ensinar sobre dizimo e ofertas',
      'Desenvolver projetos de arrecadação',
      'Administrar fundos de missões'
    ],
    growthAreas: [
      'Estudar princípios de mordomia bíblica',
      'Desenvolver habilidades financeiras',
      'Aprender sobre gestão de recursos'
    ]
  }
]

export function analyzeGiftCompatibility(
  giftScores: Record<string, number>, 
  topGiftsCount: number = 3
): GiftCompatibility[] {
  const sortedGifts = Object.entries(giftScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topGiftsCount)
    .map(([key]) => key)

  const compatibilities: GiftCompatibility[] = []

  sortedGifts.forEach(primaryGift => {
    const synergy = GIFT_SYNERGIES[primaryGift]
    if (!synergy) return

    const secondaryGifts = sortedGifts.filter(gift => gift !== primaryGift)
    
    let compatibilityScore = 0
    const strengthAreas: string[] = []
    const potentialChallenges: string[] = []
    let synergyDescription = ''

    secondaryGifts.forEach(secondaryGift => {
      if (synergy.strongSynergies.includes(secondaryGift)) {
        compatibilityScore += 3
        strengthAreas.push(synergy.descriptions[secondaryGift] || `Forte sinergia entre ${getPrimaryGiftName(primaryGift)} e ${getPrimaryGiftName(secondaryGift)}`)
      } else if (synergy.moderateSynergies.includes(secondaryGift)) {
        compatibilityScore += 2
      } else if (synergy.challenges.includes(secondaryGift)) {
        compatibilityScore -= 1
        potentialChallenges.push(`Possível tensão entre ${getPrimaryGiftName(primaryGift)} e ${getPrimaryGiftName(secondaryGift)} - requer equilíbrio`)
      }
    })

    // Normalize score to 0-100
    const maxPossibleScore = (secondaryGifts.length * 3)
    const normalizedScore = maxPossibleScore > 0 ? Math.max(0, (compatibilityScore / maxPossibleScore) * 100) : 0

    if (strengthAreas.length > 0) {
      synergyDescription = `O dom de ${getPrimaryGiftName(primaryGift)} se combina bem com seus outros dons, criando oportunidades únicas de ministério.`
    }

    compatibilities.push({
      primaryGift,
      secondaryGifts,
      compatibilityScore: Math.round(normalizedScore),
      strengthAreas,
      potentialChallenges,
      synergyDescription
    })
  })

  return compatibilities.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
}

export function getMinistryRecommendations(
  giftScores: Record<string, number>,
  topGiftsCount: number = 3
): MinistryRecommendation[] {
  const userGifts = Object.entries(giftScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topGiftsCount)
    .map(([key]) => key)

  const recommendations: MinistryRecommendation[] = []

  MINISTRY_RECOMMENDATIONS.forEach(ministry => {
    let compatibilityScore = 0
    let matchedRequired = 0
    let matchedOptimal = 0

    // Check required gifts
    ministry.requiredGifts.forEach(requiredGift => {
      if (userGifts.includes(requiredGift)) {
        matchedRequired += 1
        compatibilityScore += 40 // High weight for required gifts
      }
    })

    // Check optimal gifts
    ministry.optimalGifts.forEach(optimalGift => {
      if (userGifts.includes(optimalGift)) {
        matchedOptimal += 1
        compatibilityScore += 20 // Medium weight for optimal gifts
      }
    })

    // Only recommend if at least one required gift is present
    if (matchedRequired > 0) {
      // Bonus for having multiple gifts from the optimal list
      const optimalBonus = Math.min(matchedOptimal * 10, 30)
      compatibilityScore += optimalBonus

      // Normalize to 0-100
      const maxPossibleScore = (ministry.requiredGifts.length * 40) + (ministry.optimalGifts.length * 20) + 30
      const normalizedScore = Math.min(100, (compatibilityScore / maxPossibleScore) * 100)

      recommendations.push({
        ...ministry,
        compatibilityScore: Math.round(normalizedScore)
      })
    }
  })

  return recommendations
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 5) // Return top 5 recommendations
}

function getPrimaryGiftName(giftKey: string): string {
  const gift = spiritualGifts.find(g => g.key === giftKey)
  return gift?.name || giftKey
}

export function getGiftCombinationInsights(giftScores: Record<string, number>): {
  dominantPattern: string
  balanceAnalysis: string
  developmentSuggestions: string[]
} {
  const sortedGifts = Object.entries(giftScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const [primary, secondary, tertiary] = sortedGifts
  
  let dominantPattern = 'Perfil Equilibrado'
  let balanceAnalysis = ''
  const developmentSuggestions: string[] = []

  // Analyze dominance pattern
  if (primary && secondary) {
    const scoreDifference = primary[1] - secondary[1]
    
    if (scoreDifference > 20) {
      dominantPattern = 'Especialista'
      balanceAnalysis = `Você possui um dom claramente dominante (${getPrimaryGiftName(primary[0])}), o que indica especialização natural nesta área.`
      developmentSuggestions.push(
        `Desenvolva profundamente seu dom de ${getPrimaryGiftName(primary[0])} através de estudo e prática`,
        'Busque oportunidades de ministério que maximizem seu dom principal',
        'Considere mentorar outros na área de seu dom dominante'
      )
    } else if (scoreDifference < 10) {
      dominantPattern = 'Multifacetado'
      balanceAnalysis = 'Seus dons estão bem equilibrados, indicando versatilidade ministerial e capacidade de atuar em múltiplas áreas.'
      developmentSuggestions.push(
        'Explore ministérios que combinem seus múltiplos dons',
        'Desenvolva cada dom individualmente para maximizar seu potencial',
        'Considere posições de liderança que utilizem sua versatilidade'
      )
    } else {
      balanceAnalysis = `Você tem um dom principal (${getPrimaryGiftName(primary[0])}) com forte apoio de ${getPrimaryGiftName(secondary[0])}.`
      developmentSuggestions.push(
        `Foque no desenvolvimento do seu dom de ${getPrimaryGiftName(primary[0])}`,
        `Use seu dom de ${getPrimaryGiftName(secondary[0])} para complementar e enriquecer seu ministério principal`
      )
    }
  }

  return {
    dominantPattern,
    balanceAnalysis,
    developmentSuggestions
  }
}