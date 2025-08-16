// AI-powered compatibility analysis using free services
import type { Database } from '@/lib/database.types'

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
    // Check which service has API key available
    if (process.env.GROQ_API_KEY) return 'GROQ'
    if (process.env.TOGETHER_API_KEY) return 'TOGETHER'
    if (process.env.HUGGINGFACE_API_KEY) return 'HUGGINGFACE'
    
    // Default to Groq (most reliable free tier)
    return 'GROQ'
  }

  private getApiKey(): string {
    switch (this.service) {
      case 'GROQ':
        return process.env.GROQ_API_KEY || ''
      case 'TOGETHER':
        return process.env.TOGETHER_API_KEY || ''
      case 'HUGGINGFACE':
        return process.env.HUGGINGFACE_API_KEY || ''
      default:
        return ''
    }
  }

  async analyzeCompatibility(
    userProfile: UserGiftProfile,
    structuredData?: any
  ): Promise<AICompatibilityAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(userProfile, structuredData)
      const response = await this.callAIService(prompt)
      
      return this.parseAIResponse(response)
    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error)
      return this.getFallbackAnalysis(userProfile)
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
        systemRole: 'Você é um consultor especializado em dons espirituais cristãos. Analise o perfil a seguir e forneça insights personalizados:',
        userProfile: 'PERFIL DO USUÁRIO:',
        primaryGift: 'Dom Principal',
        secondaryGifts: 'Dons Secundários',
        points: 'pontos',
        structuredData: 'DADOS ESTRUTURADOS:',
        requestFormat: 'Por favor, forneça uma análise em português brasileiro no seguinte formato JSON:',
        personalizedInsights: 'Análise personalizada da combinação única de dons deste usuário',
        strengthsDescription: 'Descrição das principais forças desta combinação',
        challengesGuidance: 'Orientações sobre possíveis desafios e como superá-los',
        ministryRecommendations: ['lista', 'de', 'ministérios', 'recomendados'],
        developmentPlan: 'Plano de desenvolvimento espiritual personalizado',
        practicalApplications: ['aplicações', 'práticas', 'específicas'],
        finalInstruction: 'Seja específico, prático e focado na aplicação dos dons no contexto da igreja local brasileira.'
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
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          personalizedInsights: parsed.personalizedInsights || '',
          strengthsDescription: parsed.strengthsDescription || '',
          challengesGuidance: parsed.challengesGuidance || '',
          ministryRecommendations: parsed.ministryRecommendations || [],
          developmentPlan: parsed.developmentPlan || '',
          practicalApplications: parsed.practicalApplications || [],
          confidence: parsed.confidence || 70
        }
      }
      
      throw new Error('No JSON found in response')
    } catch (error) {
      // If parsing fails, try to extract insights from text
      return this.extractInsightsFromText(response)
    }
  }

  private extractInsightsFromText(text: string): AICompatibilityAnalysis {
    // Basic text extraction if JSON parsing fails
    const sections = text.split('\n').filter(line => line.trim())
    
    return {
      personalizedInsights: sections.slice(0, 2).join(' ') || 'Análise personalizada não disponível.',
      strengthsDescription: sections.slice(2, 4).join(' ') || 'Pontos fortes identificados.',
      challengesGuidance: sections.slice(4, 6).join(' ') || 'Orientações para desenvolvimento.',
      ministryRecommendations: ['Ministério baseado no dom principal'],
      developmentPlan: sections.slice(-2).join(' ') || 'Plano de desenvolvimento personalizado.',
      practicalApplications: ['Aplicação prática dos dons'],
      confidence: 60
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
    
    const template = fallbackTemplates[primaryGift.key] || fallbackTemplates['A_PROPHECY']
    
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