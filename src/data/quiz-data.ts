import type { Database } from '@/lib/database.types'

export interface QuizQuestion {
  id: number;
  question: string;
  gift_key: Database['public']['Enums']['gift_key'];
  // Additional metadata from backend
  weight_class?: string;
  question_order?: number;
  quiz_id?: string;
}

export interface SpiritualGift {
  key: Database['public']['Enums']['gift_key'];
  name: string;
  description: string;
  biblicalReferences: string[];
  characteristics: string[];
}

export const spiritualGifts: SpiritualGift[] = [
  {
    key: 'A_PROPHECY',
    name: 'Profecia',
    description: 'A capacidade de receber e comunicar uma mensagem imediata de Deus ao seu povo através de uma declaração divinamente ungida.',
    biblicalReferences: ['1 Coríntios 12:10', 'Romanos 12:6', 'Efésios 4:11'],
    characteristics: [
      'Sensibilidade à voz de Deus',
      'Coragem para falar a verdade',
      'Capacidade de revelar o coração de Deus',
      'Unção para edificar e exortar'
    ]
  },
  {
    key: 'B_SERVICE',
    name: 'Ministério (Serviço)',
    description: 'A capacidade de identificar necessidades não atendidas envolvidas numa tarefa relacionada com a obra de Deus e usar os recursos disponíveis para satisfazer essas necessidades.',
    biblicalReferences: ['Romanos 12:7'],
    characteristics: [
      'Olhar atento para necessidades',
      'Iniciativa para servir',
      'Alegria no trabalho prático',
      'Capacidade de trabalhar com as mãos'
    ]
  },
  {
    key: 'C_TEACHING',
    name: 'Ensino',
    description: 'A capacidade de comunicar informações relevantes para a saúde e ministério do corpo e de seus membros de tal modo que outros aprendam.',
    biblicalReferences: ['1 Coríntios 12:28', 'Romanos 12:7', 'Efésios 4:11'],
    characteristics: [
      'Clareza na comunicação',
      'Capacidade de explicar conceitos complexos',
      'Paixão por ensinar e ver outros aprender',
      'Habilidade para organizar informações'
    ]
  },
  {
    key: 'D_EXHORTATION',
    name: 'Exortação',
    description: 'A capacidade de encorajar, consolar e motivar outros a crescer espiritualmente.',
    biblicalReferences: ['Romanos 12:8'],
    characteristics: [
      'Habilidade de encorajar outros',
      'Sensibilidade às necessidades emocionais',
      'Facilidade em motivar pessoas',
      'Dom de trazer esperança e ânimo'
    ]
  },
  {
    key: 'E_GIVING',
    name: 'Contribuição',
    description: 'A capacidade de contribuir com recursos materiais para a obra de Deus com generosidade e alegria.',
    biblicalReferences: ['Romanos 12:8'],
    characteristics: [
      'Generosidade natural e alegre',
      'Sabedoria para investir no Reino',
      'Capacidade de gerar recursos',
      'Coração sensível às necessidades'
    ]
  },
  {
    key: 'F_LEADERSHIP',
    name: 'Liderança',
    description: 'A capacidade de definir metas de acordo com a vontade de Deus e comunicar essas metas para motivar outros a trabalharem juntos harmoniosamente.',
    biblicalReferences: ['Romanos 12:8'],
    characteristics: [
      'Visão clara e comunicação eficaz',
      'Capacidade de motivar e inspirar',
      'Habilidade para tomar decisões',
      'Influência natural sobre outros'
    ]
  },
  {
    key: 'G_MERCY',
    name: 'Misericórdia',
    description: 'A capacidade de sentir empatia genuína e compaixão por indivíduos que sofrem física, mental ou emocionalmente.',
    biblicalReferences: ['Romanos 12:8'],
    characteristics: [
      'Compaixão profunda pelos que sofrem',
      'Sensibilidade às dores dos outros',
      'Capacidade de confortar e consolar',
      'Coração quebrantado pela injustiça'
    ]
  }
];

export const calculateScores = (answers: { gift_key: Database['public']['Enums']['gift_key']; score: number }[], gifts: SpiritualGift[]): Record<string, number> => {
  const scores: Record<string, number> = {};
  const giftCounts: Record<string, number> = {};

  // Initialize all gift keys with 0
  gifts.forEach(gift => {
    scores[gift.key] = 0;
    giftCounts[gift.key] = 0;
  });

  // Group scores by gift for trimmed mean calculation
  const giftScores: Record<string, number[]> = {};
  
  // Initialize arrays for each gift
  gifts.forEach(gift => {
    giftScores[gift.key] = [];
  });

  // Collect weighted scores for each gift
  answers.forEach((answer, index) => {
    // Use question ID from answers array index + 1, or apply default weight
    const questionId = index + 1;
    const weight = QUESTION_WEIGHTS[questionId] || 1.0;
    const weightedScore = answer.score * weight;
    
    giftScores[answer.gift_key].push(weightedScore);
  });

  // Calculate trimmed mean (exclude highest and lowest score per gift)
  gifts.forEach(gift => {
    const giftScoreArray = giftScores[gift.key];
    
    if (giftScoreArray.length >= 3) {
      // Sort scores and remove highest and lowest
      const sortedScores = [...giftScoreArray].sort((a, b) => a - b);
      const trimmedScores = sortedScores.slice(1, -1); // Remove first (lowest) and last (highest)
      
      scores[gift.key] = trimmedScores.reduce((sum, score) => sum + score, 0);
      giftCounts[gift.key] = trimmedScores.length;
    } else {
      // If less than 3 scores, use all scores (can't trim)
      scores[gift.key] = giftScoreArray.reduce((sum, score) => sum + score, 0);
      giftCounts[gift.key] = giftScoreArray.length;
    }
  });

  // Normalize scores to account for different numbers of questions per gift
  // and apply exponential scaling to amplify differences
  const normalizedScores: Record<string, number> = {};
  
  gifts.forEach(gift => {
    const questionCount = giftCounts[gift.key];
    if (questionCount > 0) {
      // Calculate average score for this gift
      const averageScore = scores[gift.key] / questionCount;
      
      // Apply exponential scaling to amplify differences (power of 1.5)
      // This makes higher scores grow faster than lower ones
      const scaledScore = Math.pow(averageScore, 1.5);
      
      // Add slight randomization to break ties (±2% variation)
      const randomFactor = 0.98 + (Math.random() * 0.04);
      
      normalizedScores[gift.key] = Math.round((scaledScore * randomFactor) * 100) / 100;
    } else {
      normalizedScores[gift.key] = 0;
    }
  });

  return normalizedScores;
};

// Utility function to format scores consistently
export const formatScore = (score: number, decimals: number = 0): string => {
  return score.toFixed(decimals);
};

// Utility function to format percentages consistently
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

// Question weights based on their position and importance
const QUESTION_WEIGHTS: Record<number, number> = {
  // First questions of each gift (higher weight - more decisive)
  1: 1.3, 2: 1.3, 3: 1.3, 4: 1.3, 5: 1.3, 6: 1.3, 7: 1.3,
  // Second questions (moderate weight)
  10: 1.1, 11: 1.1, 12: 1.1, 13: 1.1, 14: 1.1, 15: 1.1, 16: 1.1,
  // Third questions (standard weight)
  19: 1.0, 20: 1.0, 21: 1.0, 22: 1.0, 23: 1.0, 24: 1.0, 25: 1.0,
  // Fourth questions (slightly lower weight)
  28: 0.9, 29: 0.9, 30: 0.9, 31: 0.9, 32: 0.9, 33: 0.9, 34: 0.9,
  // Last questions (lowest weight - less decisive)
  37: 0.8, 38: 0.8, 39: 0.8, 40: 0.8, 41: 0.8, 42: 0.8, 43: 0.8,
  // Extra questions (moderate weight)
  8: 1.1, 9: 1.1, 17: 1.0, 18: 1.0, 26: 0.9, 27: 0.9, 35: 1.0, 36: 1.0, 44: 1.1, 45: 1.1
};

export const getTopGifts = (scores: Record<string, number>, gifts: SpiritualGift[]): string[] => {
  const allScores = gifts.map(gift => ({
    name: gift.name,
    score: scores[gift.key] || 0,
  }));

  // Apply additional score differentiation
  const processedScores = allScores.map(item => {
    // Add slight variation based on gift characteristics length
    const gift = gifts.find(g => g.name === item.name);
    const complexityBonus = gift ? gift.characteristics.length * 0.05 : 0;
    
    return {
      ...item,
      score: item.score + complexityBonus
    };
  });

  // Sort and ensure minimum gap between consecutive scores
  const sorted = processedScores.sort((a, b) => b.score - a.score);
  
  // Adjust scores to create clearer ranking
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i-1].score - sorted[i].score;
    if (gap < 0.5 && sorted[i-1].score > 0) {
      // Ensure minimum gap of 0.5 between ranks
      sorted[i].score = sorted[i-1].score - 0.5;
    }
  }

  return sorted.map(item => item.name);
};