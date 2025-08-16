// AI-powered compatibility analysis using free services
import type { Database } from '@/lib/database.types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AICompatibilityAnalysis {
  personalizedInsights: string
  strengthsDescription: string
  challengesGuidance: string
  ministryRecommendations: string[]
  developmentPlan: string
  practicalApplications: string[]
  confidence: number
}

export interface UserGiftProfile {
  primaryGift: {
    key: Database['public']['Enums']['gift_key']
    name: string
    score: number
  }
  secondaryGifts: Array<{
    key: Database['public']['Enums']['gift_key']
    name: string
    score: number
  }>
  locale?: string
  demographics?: {
    ageRange?: string
    location?: string
    ministryExperience?: string
  }
}

// Free AI services we can use
const AI_SERVICES = {
  GROQ: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant', // Free model
    maxTokens: 1024
  },
  TOGETHER: {
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo', // Free tier
    maxTokens: 1024
  },
  HUGGINGFACE: {
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium', // Free
    maxTokens: 512
  }
}

class AICompatibilityAnalyzer {
  private readonly apiKey: string
  private readonly service: keyof typeof AI_SERVICES

  constructor() {
    // Try multiple free services in order of preference
    this.service = this.selectBestAvailableService()
    this.apiKey = this.getApiKey()
  }

  private selectBestAvailableService(): keyof typeof AI_SERVICES {
    // Check which service has API key available (both server and client-side)
    if (process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY) return 'GROQ'
    if (process.env.TOGETHER_API_KEY || process.env.NEXT_PUBLIC_TOGETHER_API_KEY) return 'TOGETHER'
    if (process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) return 'HUGGINGFACE'
    
    // Default to Groq (most reliable free tier)
    return 'GROQ'
  }

  private getApiKey(): string {
    switch (this.service) {
      case 'GROQ':
        return process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
      case 'TOGETHER':
        return process.env.TOGETHER_API_KEY || process.env.NEXT_PUBLIC_TOGETHER_API_KEY || ''
      case 'HUGGINGFACE':
        return process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || ''
      default:
        return ''
    }
  }

  async analyzeCompatibility(
    userProfile: UserGiftProfile,
    structuredData?: any
  ): Promise<AICompatibilityAnalysis> {
    console.log('🤖 AI Analyzer: Starting analysis for', userProfile.primaryGift.name)
    try {
      const prompt = this.buildAnalysisPrompt(userProfile, structuredData)
      console.log('🤖 AI Analyzer: Calling AI service')
      const response = await this.callAIService(prompt)
      
      const result = this.parseAIResponse(response)
      console.log('✅ AI Analyzer: Analysis successful', { hasInsights: !!result.personalizedInsights })
      return result
    } catch (error) {
      console.warn('❌ AI analysis failed, using fallback:', error)
      const fallback = this.getFallbackAnalysis(userProfile)
      console.log('🔄 AI Analyzer: Using fallback analysis', { hasInsights: !!fallback.personalizedInsights })
      return fallback
    }
  }

  private buildAnalysisPrompt(
    profile: UserGiftProfile,
    structuredData?: any
  ): string {
    const { primaryGift, secondaryGifts, locale = 'pt' } = profile
    
    // Language-specific prompts
    const prompts = {
      pt: {
        systemRole: 'Você é um consultor especializado em dons espirituais cristãos. Fale diretamente com a pessoa em primeira pessoa (você), usando um tom abraçador e encorajador. Analise o perfil a seguir:',
        userProfile: 'PERFIL DO USUÁRIO:',
        primaryGift: 'Dom Principal',
        secondaryGifts: 'Dons Secundários',
        points: 'pontos',
        structuredData: 'DADOS ESTRUTURADOS:',
        requestFormat: 'IMPORTANTE: Responda APENAS com JSON válido em português brasileiro, sem texto adicional antes ou depois. Use este formato exato:',
        personalizedInsights: 'Você possui uma combinação única de dons que revela muito sobre como Deus quer usar você no Seu reino. Fale sobre essa combinação de forma abraçadora.',
        strengthsDescription: 'Suas principais forças incluem essas características especiais que Deus plantou em você',
        challengesGuidance: 'Alguns pontos de atenção para você crescer ainda mais nesses dons',
        ministryRecommendations: ['ministérios onde você pode brilhar', 'áreas de serviço ideais para você'],
        developmentPlan: 'Um plano personalizado para você desenvolver esses dons que Deus lhe deu',
        practicalApplications: ['maneiras práticas de usar seus dons', 'aplicações do dia a dia'],
        finalInstruction: 'Use sempre "você" e seja encorajador, abraçador e específico sobre como essa pessoa pode usar seus dons na igreja local brasileira. RESPONDA APENAS COM JSON VÁLIDO, SEM TEXTO EXTRA.'
      },
      en: {
        systemRole: 'You are a consultant specialized in Christian spiritual gifts. Analyze the following profile and provide personalized insights:',
        userProfile: 'USER PROFILE:',
        primaryGift: 'Primary Gift',
        secondaryGifts: 'Secondary Gifts',
        points: 'points',
        structuredData: 'STRUCTURED DATA:',
        requestFormat: 'Please provide an analysis in English in the following JSON format:',
        personalizedInsights: 'Personalized analysis of this user\'s unique gift combination',
        strengthsDescription: 'Description of the main strengths of this combination',
        challengesGuidance: 'Guidance on possible challenges and how to overcome them',
        ministryRecommendations: ['list', 'of', 'recommended', 'ministries'],
        developmentPlan: 'Personalized spiritual development plan',
        practicalApplications: ['practical', 'specific', 'applications'],
        finalInstruction: 'Be specific, practical and focused on applying gifts in the local church context.'
      },
      es: {
        systemRole: 'Eres un consultor especializado en dones espirituales cristianos. Analiza el siguiente perfil y proporciona ideas personalizadas:',
        userProfile: 'PERFIL DE USUARIO:',
        primaryGift: 'Don Principal',
        secondaryGifts: 'Dones Secundarios',
        points: 'puntos',
        structuredData: 'DATOS ESTRUCTURADOS:',
        requestFormat: 'Por favor, proporciona un análisis en español en el siguiente formato JSON:',
        personalizedInsights: 'Análisis personalizado de la combinación única de dones de este usuario',
        strengthsDescription: 'Descripción de las principales fortalezas de esta combinación',
        challengesGuidance: 'Orientación sobre posibles desafíos y cómo superarlos',
        ministryRecommendations: ['lista', 'de', 'ministerios', 'recomendados'],
        developmentPlan: 'Plan de desarrollo espiritual personalizado',
        practicalApplications: ['aplicaciones', 'prácticas', 'específicas'],
        finalInstruction: 'Sé específico, práctico y enfócate en la aplicación de los dones en el contexto de la iglesia local.'
      }
    }
    
    const t = prompts[locale as keyof typeof prompts] || prompts.pt
    
    return `
${t.systemRole}

${t.userProfile}
${t.primaryGift}: ${primaryGift.name} (${primaryGift.score} ${t.points})
${t.secondaryGifts}: ${secondaryGifts.map(g => `${g.name} (${g.score})`).join(', ')}

${structuredData ? `${t.structuredData} ${JSON.stringify(structuredData)}` : ''}

${t.requestFormat}
{
  "personalizedInsights": "${t.personalizedInsights}",
  "strengthsDescription": "${t.strengthsDescription}",
  "challengesGuidance": "${t.challengesGuidance}",
  "ministryRecommendations": ${JSON.stringify(t.ministryRecommendations)},
  "developmentPlan": "${t.developmentPlan}",
  "practicalApplications": ${JSON.stringify(t.practicalApplications)},
  "confidence": 85
}

${t.finalInstruction}
`
  }

  private async callAIService(prompt: string): Promise<string> {
    // Check if API key is available
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('AI service not configured - no API key available')
    }

    const config = AI_SERVICES[this.service]
    
    const requestBody = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'Você é um consultor experiente em dons espirituais cristãos, focado em ajudar pessoas a descobrirem e desenvolverem seus dons para o serviço na igreja.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: 0.7,
      top_p: 0.9
    }

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`)
    }

    const data = await response.json()
    
    // Handle different response formats
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content
    }
    
    if (data.generated_text) {
      return data.generated_text
    }
    
    throw new Error('Unexpected AI response format')
  }

  private parseAIResponse(response: string): AICompatibilityAnalysis {
    console.log('🔧 AI Analyzer: Raw response length:', response.length)
    console.log('🔧 AI Analyzer: Raw response preview:', response.substring(0, 300) + '...')
    
    try {
      // Step 1: Remove everything before the first { and after the last }
      const cleanResponse = response
        .replace(/^[\s\S]*?(?=\{)/, '') // Remove everything before first {
        .replace(/\}[\s\S]*$/, '}') // Remove everything after last }
        .replace(/Here's.*?(?=\{)/gi, '') // Remove AI response prefix
        .replace(/```json\s*/gi, '') // Remove markdown code blocks
        .replace(/```\s*$/gi, '') // Remove closing markdown
        .trim()
      
      console.log('🔧 AI Analyzer: After initial cleanup:', cleanResponse.substring(0, 200) + '...')
      
      // Step 2: More aggressive JSON extraction
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        let jsonString = jsonMatch[0]
        
        // Step 3: Clean up JSON content thoroughly
        jsonString = jsonString
          .replace(/\*\*[^*]*\*\*/g, '') // Remove markdown bold
          .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
          .replace(/"\s*\+\s*"/g, '') // Remove string concatenation
          .replace(/[\x00-\x1F\x7F]/g, ' ') // Remove control characters
          .replace(/\\n/g, ' ') // Replace escaped newlines
          .replace(/\\t/g, ' ') // Replace escaped tabs
          .replace(/\\r/g, ' ') // Replace escaped carriage returns
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/,\s*,/g, ',') // Remove duplicate commas
          .replace(/,\s*\}/g, '}') // Remove trailing commas
          .replace(/,\s*\]/g, ']') // Remove trailing commas in arrays
          
        console.log('🔧 AI Analyzer: Final cleaned JSON:', jsonString.substring(0, 300) + '...')
        
        const parsed = JSON.parse(jsonString)
        
        // Clean up fields that might have malformed content
        const cleanField = (field: string) => {
          if (!field) return ''
          return field
            .replace(/\*\*[^*]*\*\*/g, '') // Remove markdown bold
            .replace(/^\s*["']|["']\s*$/g, '') // Remove quotes
            .replace(/^Here's the analysis in JSON format:\s*/i, '') // Remove AI response prefix
            .trim()
        }
        
        return {
          personalizedInsights: cleanField(parsed.personalizedInsights) || 'Análise personalizada não disponível.',
          strengthsDescription: cleanField(parsed.strengthsDescription) || 'Pontos fortes identificados.',
          challengesGuidance: cleanField(parsed.challengesGuidance) || 'Orientações para desenvolvimento.',
          ministryRecommendations: Array.isArray(parsed.ministryRecommendations) 
            ? parsed.ministryRecommendations.filter((m: unknown) => typeof m === 'string' && m.trim())
            : ['Ministério baseado nos seus dons principais'],
          developmentPlan: cleanField(parsed.developmentPlan) || 'Plano de desenvolvimento personalizado.',
          practicalApplications: Array.isArray(parsed.practicalApplications) 
            ? parsed.practicalApplications.filter((a: unknown) => typeof a === 'string' && a.trim())
            : ['Aplicação prática dos seus dons'],
          confidence: parsed.confidence || 70
        }
      }
      
      throw new Error('No JSON found in response')
    } catch (error) {
      console.warn('🔧 AI Analyzer: JSON parsing failed, using text extraction:', error)
      // If parsing fails, try to extract insights from text
      return this.extractInsightsFromText(response)
    }
  }

  private extractInsightsFromText(text: string): AICompatibilityAnalysis {
    console.log('🔧 AI Analyzer: Extracting insights from malformed response')
    
    // Try to extract meaningful content even from malformed JSON
    const cleanText = text
      .replace(/\{[\s\S]*\}/g, '') // Remove any JSON fragments
      .replace(/[\x00-\x1F\x7F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    
    const sections = cleanText.split(/[.!?]+/).filter(line => line.trim() && line.length > 10)
    
    // Extract key phrases if possible
    const insights = sections.find(s => s.toLowerCase().includes('teaching') || s.toLowerCase().includes('gift'))
    const strengths = sections.find(s => s.toLowerCase().includes('strength') || s.toLowerCase().includes('ability'))
    const guidance = sections.find(s => s.toLowerCase().includes('challenge') || s.toLowerCase().includes('develop'))
    
    return {
      personalizedInsights: insights || 'Your Teaching gift enables you to explain biblical truths clearly and help others grow in their faith.',
      strengthsDescription: strengths || 'Your main strength lies in your ability to communicate complex concepts in an understandable way.',
      challengesGuidance: guidance || 'Focus on balancing teaching with practical application and building relationships.',
      ministryRecommendations: ['Sunday School', 'Bible Study Groups', 'Discipleship Programs'],
      developmentPlan: 'Develop your teaching skills through theological study and practice in safe environments.',
      practicalApplications: ['Lead Bible studies', 'Mentor new believers', 'Create educational materials'],
      confidence: 65
    }
  }

  private getFallbackAnalysis(profile: UserGiftProfile): AICompatibilityAnalysis {
    const { primaryGift } = profile
    
    const fallbackTemplates = {
      'A_PROPHECY': {
        insights: 'Seu dom de profecia o capacita a discernir a vontade de Deus e comunicar verdades espirituais com clareza.',
        strengths: 'Visão espiritual aguçada e capacidade de revelar verdades bíblicas profundas.',
        challenges: 'Desenvolva tato e amor ao comunicar verdades difíceis.',
        ministries: ['Ensino', 'Pregação', 'Aconselhamento'],
        development: 'Estude hermenêutica bíblica e pratique comunicação amorosa.',
        applications: ['Estudos bíblicos', 'Mentoria espiritual', 'Intercessão']
      },
      'C_TEACHING': {
        insights: 'Seu dom de ensino o capacita a explicar verdades bíblicas de forma clara e transformadora.',
        strengths: 'Capacidade de simplificar conceitos complexos e formar discípulos.',
        challenges: 'Balance conhecimento com aplicação prática.',
        ministries: ['Escola Bíblica', 'Discipulado', 'Treinamento'],
        development: 'Aprofunde estudos teológicos e desenvolva métodos pedagógicos.',
        applications: ['Aulas bíblicas', 'Materiais didáticos', 'Formação de líderes']
      }
      // Add more templates as needed
    }
    
    const template = fallbackTemplates[primaryGift.key as keyof typeof fallbackTemplates] || fallbackTemplates['A_PROPHECY']
    
    return {
      personalizedInsights: template.insights,
      strengthsDescription: template.strengths,
      challengesGuidance: template.challenges,
      ministryRecommendations: template.ministries,
      developmentPlan: template.development,
      practicalApplications: template.applications,
      confidence: 50
    }
  }
}

// Singleton instance
export const aiCompatibilityAnalyzer = new AICompatibilityAnalyzer()

// Hook for React components
export function useAICompatibilityAnalysis() {
  const analyzeProfile = async (
    profile: UserGiftProfile,
    structuredData?: any
  ) => {
    return await aiCompatibilityAnalyzer.analyzeCompatibility(profile, structuredData)
  }

  return { analyzeProfile }
}

// Server-side function for API routes
export async function generateAICompatibilityAnalysis(
  profile: UserGiftProfile,
  structuredData?: any
): Promise<AICompatibilityAnalysis> {
  return await aiCompatibilityAnalyzer.analyzeCompatibility(profile, structuredData)
}