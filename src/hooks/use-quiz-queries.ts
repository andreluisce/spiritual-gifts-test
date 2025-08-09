'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import type { QuizQuestion, SpiritualGift } from '@/data/quiz-data'
import { getTopGifts } from '@/data/quiz-data'

type DbAnswer = Database['public']['Tables']['answers']['Insert']

// Query Keys
const QUERY_KEYS = {
  questions: ['quiz', 'questions'] as const,
  gifts: ['gifts'] as const,
  userResults: (userId: string) => ['quiz', 'results', userId] as const,
  latestResult: (userId: string) => ['quiz', 'results', 'latest', userId] as const,
} as const

// Hooks for fetching data

// Fallback questions for when Supabase is not available - complete 45 questions
const fallbackQuestions: QuizQuestion[] = [
  { id: 1, question: 'Gosto de apresentar a verdade de Deus numa forma interessante e entusiasta.', gift_key: 'A_PROPHECY' },
  { id: 2, question: 'Estou sempre pronto para colocar em posição secundária meu conforto pessoal a fim de que as necessidades alheias sejam satisfeitas.', gift_key: 'B_SERVICE' },
  { id: 3, question: 'Tenho facilidade para explorar a verdade de um texto dentro do seu contexto.', gift_key: 'C_TEACHING' },
  { id: 4, question: 'Procuro incentivar individualmente os que vacilam e tem problemas espirituais.', gift_key: 'D_EXHORTATION' },
  { id: 5, question: 'Administro meu dinheiro, mesmo quando pouco, de modo a separar uma quantia generosa para o trabalho de Deus.', gift_key: 'E_GIVING' },
  { id: 6, question: 'Acho fácil delegar responsabilidades e preparar outras pessoas para realizações no campo espiritual.', gift_key: 'F_LEADERSHIP' },
  { id: 7, question: 'Sou muito sensível às necessidades dos outros.', gift_key: 'G_MERCY' },
  { id: 8, question: 'Acho fácil falar de Jesus para não crentes.', gift_key: 'A_PROPHECY' },
  { id: 9, question: 'Gosto de acompanhar cristãos para ajudá-los no seu crescimento espiritual.', gift_key: 'B_SERVICE' },
  { id: 10, question: 'Quando tento persuadir pessoas a respeito de suas reais motivações, faço-o de modo muito convincente.', gift_key: 'A_PROPHECY' },
  { id: 11, question: 'Consigo levar pessoas a se sentirem à vontade na minha presença.', gift_key: 'B_SERVICE' },
  { id: 12, question: 'Sinto grande impulso para descobrir conceitos bíblicos e repassá-los a outros.', gift_key: 'C_TEACHING' },
  { id: 13, question: 'Sempre estou interessado e procuro ajudar o crescimento espiritual das pessoas e levá-las a serem ativas na obra de Deus.', gift_key: 'D_EXHORTATION' },
  { id: 14, question: 'Alegro-me em dar recursos materiais, de sorte que a obra do Senhor possa ser promovida.', gift_key: 'E_GIVING' },
  { id: 15, question: 'Sou eficiente em supervisionar as atividades dos outros.', gift_key: 'F_LEADERSHIP' },
  { id: 16, question: 'Gosto de visitar pessoas hospitalizadas ou que não podem sair de casa.', gift_key: 'G_MERCY' },
  { id: 17, question: 'Já tive experiências de levar outros à fé em Jesus.', gift_key: 'A_PROPHECY' },
  { id: 18, question: 'Tenho experiência de levar cristãos a permanecerem firmes na fé devido ao meu acompanhamento.', gift_key: 'B_SERVICE' },
  { id: 19, question: 'Posso apresentar a Palavra de Deus a uma congregação de pessoas com clareza a ponto de serem trazidas à luz verdades escondidas.', gift_key: 'A_PROPHECY' },
  { id: 20, question: 'Sinto-me feliz quando solicitado a dar assistência a outros na obra do Senhor sem necessariamente ser indicado para um posto de liderança.', gift_key: 'B_SERVICE' },
  { id: 21, question: 'Sou muito interessado em apresentar conceitos bíblicos de modo bem claro, dando especial atenção a definição de palavras importantes no texto.', gift_key: 'C_TEACHING' },
  { id: 22, question: 'Sinto-me feliz por poder tratar as pessoas feridas espiritualmente.', gift_key: 'D_EXHORTATION' },
  { id: 23, question: 'Não tenho nenhum problema em confiar os meus recursos a outros para a obra do ministério.', gift_key: 'E_GIVING' },
  { id: 24, question: 'Posso planejar as ações de outras pessoas, com calma, e dar-lhes os detalhes que as capacitem a trabalhar com eficiência.', gift_key: 'F_LEADERSHIP' },
  { id: 25, question: 'Tenho grande interesse pelos que se acham envolvidos em dificuldades.', gift_key: 'G_MERCY' },
  { id: 26, question: 'Considero um grande problema o fato de muitos cristãos não falarem aos outros da sua fé em Jesus.', gift_key: 'A_PROPHECY' },
  { id: 27, question: 'Preocupo-me com o fato de que muitos cristãos não receberem um acompanhamento na sua vida pessoal e espiritual.', gift_key: 'B_SERVICE' },
  { id: 28, question: 'Esforço-me grandemente para obter resultados, sempre que apresento as verdades da Palavra de Deus.', gift_key: 'A_PROPHECY' },
  { id: 29, question: 'Sinto-me bem quando proporciono um agradável acolhimento aos hóspedes.', gift_key: 'B_SERVICE' },
  { id: 30, question: 'Sou diligente em meu estudo da Bíblia e dispenso cuidadosa atenção à necessária pesquisa, não apenas para mostrar sabedoria, mas porque eu gosto.', gift_key: 'C_TEACHING' },
  { id: 31, question: 'Julgo poder ajudar os que têm necessidades de aconselhamento sobre problemas pessoais.', gift_key: 'D_EXHORTATION' },
  { id: 32, question: 'Preocupo-me em saber que o trabalho de assistência social está sendo suprido de recursos.', gift_key: 'E_GIVING' },
  { id: 33, question: 'Procuro estar ciente dos recursos disponíveis para a execução das tarefas que tenho que realizar.', gift_key: 'F_LEADERSHIP' },
  { id: 34, question: 'Sinto-me feliz quando consigo atingir pessoas geralmente esquecidas pelos outros.', gift_key: 'G_MERCY' },
  { id: 35, question: 'Para mim é fácil perceber quando uma pessoa está aberta a aceitar o evangelho.', gift_key: 'A_PROPHECY' },
  { id: 36, question: 'É fácil, para mim, acompanhar pessoalmente um grupo de cristãos e me empenhar pela sua unidade.', gift_key: 'B_SERVICE' },
  { id: 37, question: 'Verifico que minha pregação leve pessoas a um ponto de decisão definido.', gift_key: 'A_PROPHECY' },
  { id: 38, question: 'Gosto de aliviar a carga das pessoas que ocupam uma posição-chave, de sorte que possam esforçar-se mais em tarefas a elas concernentes.', gift_key: 'B_SERVICE' },
  { id: 39, question: 'Posso explicar bem como a Bíblia mantém sua unidade.', gift_key: 'C_TEACHING' },
  { id: 40, question: 'Sou agudamente consciente das coisas que impedem as pessoas em seu desenvolvimento espiritual e anseio por ajudá-las a vencer seus problemas.', gift_key: 'D_EXHORTATION' },
  { id: 41, question: 'Sou cuidadoso com a questão de dinheiro e oro continuamente acerca de sua distribuição adequada na obra do Senhor.', gift_key: 'E_GIVING' },
  { id: 42, question: 'Tenho objetivos bem definidos e consigo levar outros a assumirem meus objetivos.', gift_key: 'F_LEADERSHIP' },
  { id: 43, question: 'Posso relacionar-me com outras pessoas emocionalmente e me disponho a ajudá-las quando for necessário.', gift_key: 'G_MERCY' },
  { id: 44, question: 'Estou disposto a freqüentar um curso preparatório para o evangelismo.', gift_key: 'A_PROPHECY' },
  { id: 45, question: 'Estou disposto a assumir a responsabilidade por um grupo de irmãos.', gift_key: 'F_LEADERSHIP' }
]

export function useQuizQuestions() {
  return useQuery({
    queryKey: QUERY_KEYS.questions,
    queryFn: async (): Promise<QuizQuestion[]> => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(
            `
            id,
            text,
            question_gift_map ( gift )
            `
          )
          .order('id')

        if (error) {
          console.error("Supabase fetch error:", error);
          console.warn('Database tables may not exist. Using fallback questions.');
          return fallbackQuestions;
        }

        if (data && data.length > 0) {
          return data.map(q => ({
            id: q.id,
            question: q.text,
            gift_key: (q.question_gift_map?.gift || '') as QuizQuestion['gift_key']
          }))
        } else {
          // If no data from Supabase, use fallback questions
          return fallbackQuestions
        }
      } catch (error) {
        console.warn('Failed to fetch questions from Supabase, using fallback questions:', error)
        // Return fallback questions if Supabase fails
        return fallbackQuestions
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Extended type for complete gift information from database
export type ExtendedSpiritualGift = {
  key: string // Will map to gift_key enum
  name: string
  description: string
  biblicalReferences: string[]
  characteristics: string[] // Keep original format for compatibility
  id: number
  category: {
    id: number
    name: string
    greek_term: string | null
    description: string | null
    purpose: string | null
  } | null
  qualities: Array<{
    id: number
    quality_name: string
    description: string | null
    order_sequence: number | null
  }>
  dangers: Array<{
    id: number
    danger: string
    order_sequence: number | null
  }>
  misunderstandings: Array<{
    id: number
    misunderstanding: string
    order_sequence: number | null
  }>
}

export function useGifts() {
  return useQuery({
    queryKey: QUERY_KEYS.gifts,
    queryFn: async (): Promise<SpiritualGift[]> => {
      const { data, error } = await supabase
        .from('gifts')
        .select('*')
        .order('name')

      if (error) throw error

      // For now, merge with static data to get additional info like biblical references
      const { spiritualGifts } = await import('@/data/quiz-data')

      return data.map(dbGift => {
        const staticGift = spiritualGifts.find(g => g.key === dbGift.key)
        return {
          key: dbGift.key,
          name: dbGift.name,
          description: dbGift.description || '',
          biblicalReferences: staticGift?.biblicalReferences || [],
          characteristics: staticGift?.characteristics || []
        }
      })
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// New hook for complete spiritual gifts data
export function useSpiritualGifts() {
  return useQuery({
    queryKey: ['spiritual_gifts', 'complete'],
    queryFn: async (): Promise<ExtendedSpiritualGift[]> => {
      try {
        const { data, error } = await supabase
          .from('spiritual_gifts')
          .select(`
            id,
            name,
            definition,
            biblical_references,
            category:category_id(
              id,
              name,
              greek_term,
              description,
              purpose
            ),
            qualities (
              id,
              quality_name,
              description,
              order_sequence
            ),
            characteristics (
              id,
              characteristic,
              order_sequence
            ),
            dangers (
              id,
              danger,
              order_sequence
            ),
            misunderstandings (
              id,
              misunderstanding,
              order_sequence
            )
          `)
          .order('id')

        if (error) {
          console.warn('Spiritual gifts table not found:', error);
          return [];
        }

        return data.map(gift => ({
          key: gift.name.toUpperCase(), // Use gift name as key
          name: gift.name,
          description: gift.definition || '',
          biblicalReferences: gift.biblical_references ? [gift.biblical_references] : [],
          characteristics: gift.characteristics
            ?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0))
            .map(c => c.characteristic) || [],
          id: gift.id,
          category: gift.category,
          qualities: gift.qualities?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
          dangers: gift.dangers?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
          misunderstandings: gift.misunderstandings?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || []
        }))
      } catch (error) {
        console.warn('Failed to fetch spiritual gifts:', error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for getting single gift with all details
export function useSpiritualGift(giftId: number) {
  return useQuery({
    queryKey: ['spiritual_gift', giftId],
    queryFn: async (): Promise<ExtendedSpiritualGift | null> => {
      try {
        const { data, error } = await supabase
          .from('spiritual_gifts')
          .select(`
            id,
            name,
            definition,
            biblical_references,
            category:category_id(
              id,
              name,
              greek_term,
              description,
              purpose
            ),
            qualities (
              id,
              quality_name,
              description,
              order_sequence
            ),
            characteristics (
              id,
              characteristic,
              order_sequence
            ),
            dangers (
              id,
              danger,
              order_sequence
            ),
            misunderstandings (
              id,
              misunderstanding,
              order_sequence
            )
          `)
          .eq('id', giftId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') return null // No rows found
          console.warn('Failed to fetch spiritual gift:', error);
          return null;
        }

        return {
          key: data.name.toUpperCase(),
          name: data.name,
          description: data.definition || '',
          biblicalReferences: data.biblical_references ? [data.biblical_references] : [],
          characteristics: data.characteristics
            ?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0))
            .map(c => c.characteristic) || [],
          id: data.id,
          category: data.category,
          qualities: data.qualities?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
          dangers: data.dangers?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || [],
          misunderstandings: data.misunderstandings?.sort((a, b) => (a.order_sequence || 0) - (b.order_sequence || 0)) || []
        }
      } catch (error) {
        console.warn('Failed to fetch spiritual gift:', error);
        return null;
      }
    },
    enabled: !!giftId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for categories
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('id')

        if (error) {
          console.warn('Categories table not found, returning fallback data');
          return [
            { id: 1, name: 'MOTIVAÇÕES', greek_term: 'Karismation', description: 'Impulso básico implantado no interior de cada cristão para que Deus expresse Seu amor', purpose: 'Para cada indivíduo ter e segurar' },
            { id: 2, name: 'MINISTÉRIOS', greek_term: 'Diakonion', description: 'Serviço cristão que Deus determina para cada um', purpose: 'Para a Igreja' },
            { id: 3, name: 'MANIFESTAÇÕES', greek_term: 'Energias planerosis', description: 'Manifestações do Espírito para capacitar no ministério', purpose: 'Para indivíduos momentaneamente' }
          ];
        }
        return data
      } catch (err) {
        console.warn('Failed to fetch categories, using fallback:', err);
        return [
          { id: 1, name: 'MOTIVAÇÕES', greek_term: 'Karismation', description: 'Impulso básico implantado no interior de cada cristão para que Deus expresse Seu amor', purpose: 'Para cada indivíduo ter e segurar' },
          { id: 2, name: 'MINISTÉRIOS', greek_term: 'Diakonion', description: 'Serviço cristão que Deus determina para cada um', purpose: 'Para a Igreja' },
          { id: 3, name: 'MANIFESTAÇÕES', greek_term: 'Energias planerosis', description: 'Manifestações do Espírito para capacitar no ministério', purpose: 'Para indivíduos momentaneamente' }
        ];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for ministries
export function useMinistries() {
  return useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ministries')
          .select('*')
          .order('name')

        if (error) {
          console.warn('Ministries table not found:', error);
          return [];
        }
        return data
      } catch (error) {
        console.warn('Failed to fetch ministries:', error);
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for manifestations
export function useManifestations() {
  return useQuery({
    queryKey: ['manifestations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('manifestations')
          .select('*')
          .order('classification', { ascending: true })
          .order('name')

        if (error) {
          console.warn('Manifestations table not found:', error);
          return [];
        }
        return data
      } catch (error) {
        console.warn('Failed to fetch manifestations:', error);
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for biblical activities
export function useBiblicalActivities() {
  return useQuery({
    queryKey: ['biblical_activities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('biblical_activities')
          .select('*')
          .order('id')

        if (error) {
          console.warn('Biblical activities table not found:', error);
          return [];
        }
        return data
      } catch (error) {
        console.warn('Failed to fetch biblical activities:', error);
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook to get gift bridge mapping (maps gift_key enum to spiritual_gifts)
export function useGiftBridge() {
  return useQuery({
    queryKey: ['gift_bridge'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('gift_bridge')
          .select(`
            gift,
            spiritual_gift_id,
            spiritual_gifts(
              id,
              name,
              definition
            )
          `)

        if (error) {
          console.warn('Gift bridge table not found:', error);
          return [];
        }
        return data
      } catch (error) {
        console.warn('Failed to fetch gift bridge:', error);
        return [];
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useUserResults(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userResults(userId || ''),
    queryFn: async (): Promise<{
      sessionId: string;
      totalScore: Record<string, number>;
      topGifts: string[];
      createdAt: string;
    }[]> => {
      if (!userId) throw new Error('User ID is required')

      try {
        const { data: sessions, error: sessionsError } = await supabase
          .from('quiz_sessions')
          .select('id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (sessionsError) {
          console.warn('No quiz sessions found for user:', sessionsError);
          return [];
        }

        const results = await Promise.all(sessions.map(async (session) => {
          try {
            const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
              p_session_id: session.id,
            })

            if (rpcError) {
              console.warn('Error calculating quiz result:', rpcError);
              return null;
            }

            const totalScore: Record<string, number> = {};
            rpcResult.forEach(item => {
              if (item.gift) {
                totalScore[item.gift] = item.total || 0;
              }
            });

            const { spiritualGifts } = await import('@/data/quiz-data')
            const topGifts = getTopGifts(totalScore, spiritualGifts);

            return {
              sessionId: session.id,
              totalScore,
              topGifts,
              createdAt: session.created_at,
            }
          } catch (error) {
            console.warn('Error processing session result:', error);
            return null;
          }
        }))

        return results.filter((result): result is NonNullable<typeof result> => result !== null);
      } catch (error) {
        console.warn('Failed to fetch user results:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useLatestResult(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.latestResult(userId || ''),
    queryFn: async (): Promise<{
      sessionId: string;
      totalScore: Record<string, number>;
      topGifts: string[];
      createdAt: string;
    } | null> => {
      if (!userId) return null

      try {
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('id, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (sessionError) {
          console.warn('No latest result found:', sessionError);
          return null;
        }
        if (!session) return null

        const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
          p_session_id: session.id,
        })

        if (rpcError) {
          console.warn('Error calculating latest result:', rpcError);
          return null;
        }

        const totalScore: Record<string, number> = {};
        rpcResult.forEach(item => {
          if (item.gift) {
            totalScore[item.gift] = item.total || 0;
          }
        });

        const { spiritualGifts } = await import('@/data/quiz-data')
        const topGifts = getTopGifts(totalScore, spiritualGifts);

        return {
          sessionId: session.id,
          totalScore,
          topGifts,
          createdAt: session.created_at,
        }
      } catch (error) {
        console.warn('Failed to fetch latest result:', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useResultBySessionId(sessionId: string | null) {
  return useQuery({
    queryKey: ['quiz', 'results', sessionId],
    queryFn: async (): Promise<{
      sessionId: string;
      totalScore: Record<string, number>;
      topGifts: string[];
      createdAt: string;
    } | null> => {
      if (!sessionId) return null

      try {
        const { data: session, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('id, created_at')
          .eq('id', sessionId)
          .single()

        if (sessionError) {
          console.warn('No result found for this session:', sessionError);
          return null;
        }
        if (!session) return null

        const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
          p_session_id: session.id,
        })

        if (rpcError) {
          console.warn('Error calculating result:', rpcError);
          return null;
        }

        const totalScore: Record<string, number> = {};
        rpcResult.forEach(item => {
          if (item.gift) {
            totalScore[item.gift] = item.total || 0;
          }
        });

        const { spiritualGifts } = await import('@/data/quiz-data')
        const topGifts = getTopGifts(totalScore, spiritualGifts);

        return {
          sessionId: session.id,
          totalScore,
          topGifts,
          createdAt: session.created_at,
        }
      } catch (error) {
        console.warn('Failed to fetch result:', error);
        return null;
      }
    },
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutations for creating/updating data

export function useSubmitQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      answers,
      gifts
    }: {
      userId: string
      answers: Record<number, number>
      gifts: SpiritualGift[]
    }): Promise<{ sessionId: string; topGifts: string[]; totalScore: Record<string, number> }> => {
      // 1. Create a new quiz session
      const { data: sessionData, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({ user_id: userId })
        .select('id')
        .single()

      if (sessionError) throw sessionError
      const sessionId = sessionData.id

      // 2. Fetch questions to get gift_key for each question
      const questions = await queryClient.fetchQuery<QuizQuestion[]>({
        queryKey: QUERY_KEYS.questions,
      })

      // 3. Prepare answers for batch insert
      const dbAnswers: DbAnswer[] = Object.entries(answers).map(([questionId, score]) => {
        const question = questions.find(q => q.id === parseInt(questionId))
        if (!question) {
          throw new Error(`Question with ID ${questionId} not found.`);
        }
        return {
          session_id: sessionId,
          question_id: parseInt(questionId),
          score: score,
        }
      })

      // 4. Save individual answers
      const { error: answersError } = await supabase
        .from('answers')
        .insert(dbAnswers)

      if (answersError) throw answersError

      // 5. Call RPC to calculate results
      const { data: rpcResult, error: rpcError } = await supabase.rpc('calculate_quiz_result', {
        p_session_id: sessionId,
      })

      if (rpcError) throw rpcError

      const totalScore: Record<string, number> = {};
      rpcResult.forEach(item => {
        if (item.gift) {
          totalScore[item.gift] = item.total || 0;
        }
      });

      const topGifts = getTopGifts(totalScore, gifts);

      return {
        sessionId,
        topGifts,
        totalScore,
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userResults(variables.userId)
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.latestResult(variables.userId)
      })
    },
  })
}

export function useDeleteResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      sessionId,
      userId
    }: {
      sessionId: string
      userId: string
    }) => {
      // Delete the session, which should cascade to answers
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId) // Extra security check

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userResults(variables.userId)
      })
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.latestResult(variables.userId)
      })
    },
  })
}

// Hook to seed initial data (for development/admin)
export function useSeedGiftsData() {
  return useMutation({
    mutationFn: async () => {
      const { spiritualGifts } = await import('@/data/quiz-data')

      const dbGifts: Database['public']['Tables']['gifts']['Insert'][] = spiritualGifts.map(gift => ({
        key: gift.key,
        name: gift.name,
        description: gift.description
      }))

      const { error } = await supabase
        .from('gifts')
        .upsert(dbGifts, { onConflict: 'key' })

      if (error) throw error
    },
  })
}