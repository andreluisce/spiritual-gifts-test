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

// Interface for optional structured data
interface StructuredAnalysisData {
  quizMetrics?: {
    completionTime: number
    certaintyLevel: number
    responsePattern: string
  }
  userContext?: {
    age?: number
    experience?: string
    ministry?: string
  }
  additionalGifts?: Array<{
    name: string
    score: number
    confidence: number
  }>
  [key: string]: unknown
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
    locale: string = 'pt',
    structuredData?: StructuredAnalysisData
  ): Promise<AICompatibilityAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(userProfile, locale, structuredData)
      const response = await this.callAIService(prompt)
      
      const result = this.parseAIResponse(response)
      return result
    } catch (error) {
      console.warn('❌ AI analysis failed, using fallback:', error)
      const fallback = this.getFallbackAnalysis(userProfile, locale)
      return fallback
    }
  }

  private buildAnalysisPrompt(
    profile: UserGiftProfile,
    locale: string = 'pt',
    structuredData?: StructuredAnalysisData
  ): string {
    const { primaryGift, secondaryGifts } = profile
    
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
        personalizedInsights: 'Sua combinação de dons espirituais indica potenciais áreas de serviço. Analise essa combinação de forma realista e prática.',
        strengthsDescription: 'As principais características que esta combinação de dons pode proporcionar',
        challengesGuidance: 'Desafios comuns desta combinação de dons e como lidar com eles',
        ministryRecommendations: ['ministérios compatíveis com estes dons', 'áreas de serviço que se alinham com este perfil'],
        developmentPlan: 'Sugestões práticas para crescimento nestes dons',
        practicalApplications: ['aplicações concretas destes dons', 'ações específicas na igreja local'],
        finalInstruction: 'Use sempre "você" e seja realista, equilibrado e prático. Mencione tanto potenciais quanto desafios. Evite linguagem excessivamente elogiosa. RESPONDA APENAS COM JSON VÁLIDO, SEM TEXTO EXTRA.'
      },
      en: {
        systemRole: 'You are a consultant specialized in Christian spiritual gifts. Analyze the following profile and provide personalized insights:',
        userProfile: 'USER PROFILE:',
        primaryGift: 'Primary Gift',
        secondaryGifts: 'Secondary Gifts',
        points: 'points',
        structuredData: 'STRUCTURED DATA:',
        requestFormat: 'Please provide an analysis in English in the following JSON format:',
        personalizedInsights: 'Realistic analysis of this gift combination and its potential for ministry',
        strengthsDescription: 'Key characteristics and abilities this combination may provide',
        challengesGuidance: 'Common challenges of this gift combination and practical ways to address them',
        ministryRecommendations: ['ministries that align with these gifts', 'service areas that match this profile'],
        developmentPlan: 'Practical suggestions for growing in these gifts',
        practicalApplications: ['concrete applications of these gifts', 'specific actions in local church'],
        finalInstruction: 'Be realistic, balanced and practical. Include both strengths and challenges. Avoid overly flattering language. Focus on actionable ministry applications.'
      },
      es: {
        systemRole: 'Eres un consultor especializado en dones espirituales cristianos. Analiza el siguiente perfil y proporciona ideas personalizadas:',
        userProfile: 'PERFIL DE USUARIO:',
        primaryGift: 'Don Principal',
        secondaryGifts: 'Dones Secundarios',
        points: 'puntos',
        structuredData: 'DATOS ESTRUCTURADOS:',
        requestFormat: 'Por favor, proporciona un análisis en español en el siguiente formato JSON:',
        personalizedInsights: 'Análisis realista de esta combinación de dones y su potencial ministerial',
        strengthsDescription: 'Características y habilidades clave que esta combinación puede proporcionar',
        challengesGuidance: 'Desafíos comunes de esta combinación de dones y formas prácticas de abordarlos',
        ministryRecommendations: ['ministerios que se alinean con estos dones', 'áreas de servicio que coinciden con este perfil'],
        developmentPlan: 'Sugerencias prácticas para crecer en estos dones',
        practicalApplications: ['aplicaciones concretas de estos dones', 'acciones específicas en la iglesia local'],
        finalInstruction: 'Sé realista, equilibrado y práctico. Incluye tanto fortalezas como desafíos. Evita lenguaje excesivamente halagador. Enfócate en aplicaciones ministeriales prácticas.'
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
    
    try {
      // Step 1: Remove everything before the first { and after the last }
      const cleanResponse = response
        .replace(/^[\s\S]*?(?=\{)/, '') // Remove everything before first {
        .replace(/\}[\s\S]*$/, '}') // Remove everything after last }
        .replace(/Here's.*?(?=\{)/gi, '') // Remove AI response prefix
        .replace(/```json\s*/gi, '') // Remove markdown code blocks
        .replace(/```\s*$/gi, '') // Remove closing markdown
        .trim()
      
      
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

  private getFallbackAnalysis(profile: UserGiftProfile, locale: string = 'pt'): AICompatibilityAnalysis {
    const { primaryGift } = profile
    
    const fallbackTemplates = {
      pt: {
        'A_PROPHECY': {
          insights: 'Sua tendência ao dom de profecia sugere facilidade para discernir e comunicar verdades espirituais, embora isso requeira desenvolvimento e maturidade.',
          strengths: 'Potencial para visão espiritual e comunicação de verdades bíblicas.',
          challenges: 'Equilibre verdade com amor. Evite ser excessivamente direto ou crítico.',
          ministries: ['Ensino', 'Pregação', 'Aconselhamento'],
          development: 'Estude hermenêutica bíblica e desenvolva sensibilidade na comunicação.',
          applications: ['Estudos bíblicos', 'Mentoria espiritual', 'Oração']
        },
        'C_TEACHING': {
          insights: 'Sua inclinação ao ensino indica potencial para explicar conceitos bíblicos, mas requer estudo contínuo e paciência.',
          strengths: 'Possível facilidade para organizar e transmitir conhecimento.',
          challenges: 'Conecte teoria com aplicação prática. Evite ser apenas teórico.',
          ministries: ['Escola Bíblica', 'Discipulado', 'Treinamento'],
          development: 'Continue estudos bíblicos e desenvolva métodos práticos de ensino.',
          applications: ['Aulas bíblicas', 'Materiais didáticos', 'Formação de líderes']
        }
      },
      en: {
        'A_PROPHECY': {
          insights: 'Your tendency towards the gift of prophecy suggests ability to discern and communicate spiritual truths, though this requires development and maturity.',
          strengths: 'Potential for spiritual insight and communication of biblical truths.',
          challenges: 'Balance truth with love. Avoid being overly direct or critical.',
          ministries: ['Teaching', 'Preaching', 'Counseling'],
          development: 'Study biblical hermeneutics and develop sensitivity in communication.',
          applications: ['Bible studies', 'Spiritual mentoring', 'Prayer']
        },
        'C_TEACHING': {
          insights: 'Your inclination toward teaching indicates potential to explain biblical concepts, but requires continuous study and patience.',
          strengths: 'Possible facility for organizing and transmitting knowledge.',
          challenges: 'Connect theory with practical application. Avoid being only theoretical.',
          ministries: ['Bible School', 'Discipleship', 'Training'],
          development: 'Continue biblical studies and develop practical teaching methods.',
          applications: ['Bible classes', 'Educational materials', 'Leader formation']
        }
      },
      es: {
        'A_PROPHECY': {
          insights: 'Su tendencia hacia el don de profecía sugiere facilidad para discernir y comunicar verdades espirituales, aunque esto requiere desarrollo y madurez.',
          strengths: 'Potencial para visión espiritual y comunicación de verdades bíblicas.',
          challenges: 'Equilibre verdad con amor. Evite ser excesivamente directo o crítico.',
          ministries: ['Enseñanza', 'Predicación', 'Consejería'],
          development: 'Estudie hermenéutica bíblica y desarrolle sensibilidad en la comunicación.',
          applications: ['Estudios bíblicos', 'Mentoría espiritual', 'Oración']
        },
        'C_TEACHING': {
          insights: 'Su inclinación hacia la enseñanza indica potencial para explicar conceptos bíblicos, pero requiere estudio continuo y paciencia.',
          strengths: 'Posible facilidad para organizar y transmitir conocimiento.',
          challenges: 'Conecte teoría con aplicación práctica. Evite ser solo teórico.',
          ministries: ['Escuela Bíblica', 'Discipulado', 'Entrenamiento'],
          development: 'Continue estudios bíblicos y desarrolle métodos prácticos de enseñanza.',
          applications: ['Clases bíblicas', 'Materiales educativos', 'Formación de líderes']
        }
      }
    }
    
    const localeTemplates = fallbackTemplates[locale as keyof typeof fallbackTemplates] || fallbackTemplates.pt
    const template = localeTemplates[primaryGift.key as keyof typeof localeTemplates] || localeTemplates['A_PROPHECY']
    
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
    locale: string = 'pt',
    structuredData?: StructuredAnalysisData
  ) => {
    return await aiCompatibilityAnalyzer.analyzeCompatibility(profile, locale, structuredData)
  }

  return { analyzeProfile }
}

// Server-side function for API routes
export async function generateAICompatibilityAnalysis(
  profile: UserGiftProfile,
  locale: string = 'pt',
  structuredData?: StructuredAnalysisData
): Promise<AICompatibilityAnalysis> {
  return await aiCompatibilityAnalyzer.analyzeCompatibility(profile, locale, structuredData)
}