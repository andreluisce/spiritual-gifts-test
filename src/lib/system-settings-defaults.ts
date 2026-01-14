import { SystemSettings } from '@/hooks/useSystemSettings'

export const DEFAULT_SETTINGS: SystemSettings = {
  quiz: {
    debugMode: false,
    allowRetake: false,
    showProgress: true,
    questionsPerGift: 5,
    shuffleQuestions: true
  },
  general: {
    siteName: 'Spiritual Gifts Test',
    contactEmail: 'admin@spiritualgifts.app',
    defaultLanguage: 'pt',
    enableGuestQuiz: false,
    maintenanceMode: false,
    siteDescription: 'Discover your spiritual gifts through biblical assessment',
    enableRegistration: true,
    requireApproval: false
  },
  ai: {
    enableAIAnalysis: false,
    aiAnalysisDescription: '',
    showAIButton: false,
    autoGenerate: false,
    cacheStrategy: 'gift_scores',
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    includePersonalDevelopment: true,
    includeMinistryOpportunities: true,
    includeBiblicalReferences: true,
    analysisLanguage: 'auto'
  }
}
