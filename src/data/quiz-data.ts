import type { Database } from '@/lib/database.types'

export interface QuizQuestion {
  id: number;
  question: string;
  gift_key: Database['public']['Enums']['gift_key'];
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
    name: 'Serviço',
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
  },
  {
    key: 'H_EVANGELISM',
    name: 'Evangelismo',
    description: 'A capacidade de comunicar o evangelho de forma clara e persuasiva para os não-crentes.',
    biblicalReferences: ['Efésios 4:11', 'Atos 8:26-40'],
    characteristics: [
      'Paixão por alcançar os perdidos',
      'Habilidade natural para compartilhar a fé',
      'Facilidade em se conectar com não-crentes',
      'Coragem para abordar temas espirituais'
    ]
  },
  {
    key: 'I_PASTOR',
    name: 'Pastor',
    description: 'A capacidade de assumir responsabilidade pessoal de longo prazo pelo bem-estar espiritual de um grupo de crentes.',
    biblicalReferences: ['Efésios 4:11', '1 Pedro 5:1-4'],
    characteristics: [
      'Coração de pastor e cuidado',
      'Capacidade de nutrir espiritualmente',
      'Responsabilidade pelos outros',
      'Habilidade de guiar e proteger'
    ]
  }
];

export const calculateScores = (answers: { gift_key: Database['public']['Enums']['gift_key']; score: number }[], gifts: SpiritualGift[]): Record<string, number> => {
  const scores: Record<string, number> = {};
  
  // Initialize all gift keys with 0
  gifts.forEach(gift => {
    scores[gift.key] = 0;
  });
  
  // Calculate scores for each gift
  answers.forEach(answer => {
    scores[answer.gift_key] = (scores[answer.gift_key] || 0) + answer.score;
  });
  
  return scores;
};

export const getTopGifts = (scores: Record<string, number>, gifts: SpiritualGift[], topCount: number = 5): string[] => {
  return Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, topCount)
    .map(([giftKey]) => {
      const gift = gifts.find(g => g.key === giftKey);
      return gift?.name || giftKey;
    });
};