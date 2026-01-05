import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase-client'

export type SectionType =
  | 'IMPORTANT_INTRO'
  | 'OBSTACLES'
  | 'THREE_CATEGORIES'
  | 'BIBLICAL_CONTEXT'
  | 'MINISTRIES'
  | 'MANIFESTATIONS'
  | 'MANIFESTATION_PRINCIPLES'

export interface EducationalContent {
  id: string
  section_type: SectionType
  order_index: number
  title: string
  content: string
  biblical_reference?: string
}

export function useEducationalContent(sectionType?: SectionType, locale: string = 'pt') {
  return useQuery({
    queryKey: ['educational-content', sectionType, locale],
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.rpc('get_educational_content', {
        p_section_type: sectionType || null,
        p_locale: locale
      })

      if (error) {
        console.error('Error fetching educational content:', error)
        throw new Error(error.message || 'Failed to fetch educational content')
      }

      return (data || []) as EducationalContent[]
    },
    staleTime: 1000 * 60 * 60, // 1 hour - educational content doesn't change often
  })
}

// Hook específico para buscar introdução "IMPORTANTE"
export function useImportantIntro(locale: string = 'pt') {
  return useEducationalContent('IMPORTANT_INTRO', locale)
}

// Hook para buscar obstáculos
export function useObstacles(locale: string = 'pt') {
  return useEducationalContent('OBSTACLES', locale)
}

// Hook para buscar as 3 categorias
export function useThreeCategories(locale: string = 'pt') {
  return useEducationalContent('THREE_CATEGORIES', locale)
}

// Hook para buscar contexto bíblico
export function useBiblicalContext(locale: string = 'pt') {
  return useEducationalContent('BIBLICAL_CONTEXT', locale)
}

// Hook para buscar ministérios
export function useMinistries(locale: string = 'pt') {
  return useEducationalContent('MINISTRIES', locale)
}

// Hook para buscar manifestações
export function useManifestations(locale: string = 'pt') {
  return useEducationalContent('MANIFESTATIONS', locale)
}

// Hook para buscar princípios das manifestações
export function useManifestationPrinciples(locale: string = 'pt') {
  return useEducationalContent('MANIFESTATION_PRINCIPLES', locale)
}
