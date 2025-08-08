export interface QuizQuestion {
  id: number;
  question: string;
  gift_key: string;
}

export interface SpiritualGift {
  key: string;
  name: string;
  description: string;
  biblicalReferences: string[];
  characteristics: string[];
}

export const spiritualGifts: SpiritualGift[] = [
  {
    key: 'administration',
    name: 'Administração',
    description: 'A capacidade de organizar e administrar pessoas e recursos para alcançar objetivos do Reino de Deus.',
    biblicalReferences: ['1 Coríntios 12:28'],
    characteristics: [
      'Habilidade natural para organizar',
      'Capacidade de delegar tarefas eficientemente',
      'Visão para planos de longo prazo',
      'Facilidade em coordenar pessoas e recursos'
    ]
  },
  {
    key: 'apostleship',
    name: 'Apostolado',
    description: 'A capacidade de plantar igrejas e supervisionar o desenvolvimento de várias igrejas.',
    biblicalReferences: ['1 Coríntios 12:28', 'Efésios 4:11'],
    characteristics: [
      'Visão missionária forte',
      'Capacidade de estabelecer novas obras',
      'Liderança natural e autoridade espiritual',
      'Coração para alcançar os não alcançados'
    ]
  },
  {
    key: 'discernment',
    name: 'Discernimento de Espíritos',
    description: 'A capacidade de distinguir entre verdade e erro, bem e mal, e entre a obra de Deus e de Satanás.',
    biblicalReferences: ['1 Coríntios 12:10'],
    characteristics: [
      'Sensibilidade espiritual aguçada',
      'Capacidade de identificar motivações ocultas',
      'Discernimento entre o verdadeiro e o falso',
      'Proteção espiritual para a comunidade'
    ]
  },
  {
    key: 'evangelism',
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
    key: 'exhortation',
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
    key: 'faith',
    name: 'Fé',
    description: 'A capacidade de acreditar em Deus para o impossível e inspirar outros a confiar em Deus.',
    biblicalReferences: ['1 Coríntios 12:9'],
    characteristics: [
      'Confiança inabalável em Deus',
      'Capacidade de ver além das circunstâncias',
      'Influência que fortalece a fé dos outros',
      'Coragem diante de desafios impossíveis'
    ]
  },
  {
    key: 'giving',
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
    key: 'healing',
    name: 'Cura',
    description: 'A capacidade de ser instrumento de Deus para trazer cura física, emocional ou espiritual.',
    biblicalReferences: ['1 Coríntios 12:9', '1 Coríntios 12:28'],
    characteristics: [
      'Fé específica para cura',
      'Compaixão pelos doentes',
      'Sensibilidade às necessidades de saúde',
      'Experiência com orações respondidas por cura'
    ]
  },
  {
    key: 'helps',
    name: 'Socorro',
    description: 'A capacidade de assistir outros membros do corpo de Cristo para que possam desempenhar seus ministérios de forma mais eficaz.',
    biblicalReferences: ['1 Coríntios 12:28'],
    characteristics: [
      'Alegria em servir nos bastidores',
      'Capacidade de identificar necessidades práticas',
      'Disponibilidade para ajudar',
      'Humildade no serviço'
    ]
  },
  {
    key: 'hospitality',
    name: 'Hospitalidade',
    description: 'A capacidade de proporcionar um ambiente acolhedor e cuidar de visitantes e necessitados.',
    biblicalReferences: ['1 Pedro 4:9', 'Romanos 12:13'],
    characteristics: [
      'Amor por receber pessoas',
      'Capacidade de criar ambiente acolhedor',
      'Sensibilidade às necessidades dos outros',
      'Alegria em servir e cuidar'
    ]
  },
  {
    key: 'knowledge',
    name: 'Conhecimento',
    description: 'A capacidade de descobrir, acumular, analisar e clarificar informações que são vitais para o crescimento do corpo de Cristo.',
    biblicalReferences: ['1 Coríntios 12:8'],
    characteristics: [
      'Sede de conhecimento bíblico',
      'Capacidade analítica',
      'Habilidade para pesquisar e estudar',
      'Dom de compartilhar conhecimento claramente'
    ]
  },
  {
    key: 'leadership',
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
    key: 'mercy',
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
    key: 'miracles',
    name: 'Milagres',
    description: 'A capacidade de servir como intermediário humano através do qual Deus realiza atos poderosos que são percebidos pelos observadores como tendo alterado o curso natural das coisas.',
    biblicalReferences: ['1 Coríntios 12:10', '1 Coríntios 12:28'],
    characteristics: [
      'Fé para o sobrenatural',
      'Experiências com intervenções divinas',
      'Coragem para orar por impossíveis',
      'Testemunho de milagres'
    ]
  },
  {
    key: 'pastoring',
    name: 'Pastor',
    description: 'A capacidade de assumir responsabilidade pessoal de longo prazo pelo bem-estar espiritual de um grupo de crentes.',
    biblicalReferences: ['Efésios 4:11', '1 Pedro 5:1-4'],
    characteristics: [
      'Coração de pastor e cuidado',
      'Capacidade de nutrir espiritualmente',
      'Responsabilidade pelos outros',
      'Habilidade de guiar e proteger'
    ]
  },
  {
    key: 'prophecy',
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
    key: 'service',
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
    key: 'teaching',
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
    key: 'tongues',
    name: 'Línguas',
    description: 'A capacidade de falar numa língua nunca aprendida para comunicar uma mensagem de Deus a seu povo.',
    biblicalReferences: ['1 Coríntios 12:10', '1 Coríntios 14:1-25'],
    characteristics: [
      'Capacidade sobrenatural de comunicação',
      'Sensibilidade ao Espírito Santo',
      'Experiência com manifestações espirituais',
      'Coração para edificação da igreja'
    ]
  },
  {
    key: 'wisdom',
    name: 'Sabedoria',
    description: 'A capacidade de conhecer a mente de Deus de tal modo que você receba uma visão de como determinado conhecimento pode ser aplicado a necessidades específicas que surgem no corpo de Cristo.',
    biblicalReferences: ['1 Coríntios 12:8'],
    characteristics: [
      'Discernimento para situações complexas',
      'Capacidade de dar conselhos sábios',
      'Visão para aplicar conhecimento',
      'Maturidade espiritual e experiência'
    ]
  }
];

export interface QuizAnswer {
  user_id: string;
  question_id: number;
  gift_key: string;
  score: number;
}

export interface QuizResult {
  id: string;
  user_id: string;
  total_score: Record<string, number>;
  top_gifts: string[];
  created_at: string;
}

export const calculateScores = (answers: QuizAnswer[], gifts: SpiritualGift[]): Record<string, number> => {
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