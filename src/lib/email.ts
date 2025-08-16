import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  reply_to?: string
  cc?: string[]
  bcc?: string[]
}

export interface QuizResultEmailData {
  userName: string
  userEmail: string
  primaryGift: string
  giftDescription: string
  completionDate: string
  detailsUrl: string
}

export interface AdminNotificationData {
  type: 'new_user' | 'quiz_completed' | 'report_generated' | 'system_alert'
  userName: string
  userEmail: string
  details: any
  timestamp: string
}

// Email service class
export class EmailService {
  private from: string

  constructor() {
    this.from = process.env.RESEND_FROM_EMAIL || 'noreply@spiritualgifts.app'
  }

  // Send basic email
  async sendEmail(data: EmailData) {
    try {
      console.log('📧 EmailService: Sending email to:', data.to)
      
      const result = await resend.emails.send({
        from: this.from,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
        html: data.html,
        text: data.text,
        reply_to: data.reply_to,
        cc: data.cc,
        bcc: data.bcc
      })

      console.log('✅ EmailService: Email sent successfully:', result.data?.id)
      return { success: true, id: result.data?.id }
    } catch (error) {
      console.error('❌ EmailService: Error sending email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send quiz results email to user
  async sendQuizResultsEmail(data: QuizResultEmailData) {
    const html = this.generateQuizResultsEmailHTML(data)
    const text = this.generateQuizResultsEmailText(data)

    return this.sendEmail({
      to: data.userEmail,
      subject: `Seus Resultados do Teste de Dons Espirituais - ${data.primaryGift}`,
      html,
      text
    })
  }

  // Send admin notification
  async sendAdminNotification(data: AdminNotificationData) {
    const adminEmails = await this.getAdminEmails()
    if (adminEmails.length === 0) {
      console.log('⚠️ EmailService: No admin emails configured')
      return { success: false, error: 'No admin emails configured' }
    }

    const html = this.generateAdminNotificationHTML(data)
    const text = this.generateAdminNotificationText(data)

    return this.sendEmail({
      to: adminEmails,
      subject: `[Sistema de Dons Espirituais] ${this.getNotificationTitle(data.type)}`,
      html,
      text
    })
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userName: string, userEmail: string) {
    const html = this.generateWelcomeEmailHTML(userName)
    const text = this.generateWelcomeEmailText(userName)

    return this.sendEmail({
      to: userEmail,
      subject: 'Bem-vindo ao Teste de Dons Espirituais!',
      html,
      text
    })
  }

  // Get admin emails from environment or database
  private async getAdminEmails(): Promise<string[]> {
    // For now, return a default admin email
    // In the future, this could fetch from the database
    const defaultAdmin = 'andreluisce@gmail.com'
    return [defaultAdmin]
  }

  private getNotificationTitle(type: AdminNotificationData['type']): string {
    switch (type) {
      case 'new_user': return 'Novo Usuário Registrado'
      case 'quiz_completed': return 'Quiz Completado'
      case 'report_generated': return 'Relatório Gerado'
      case 'system_alert': return 'Alerta do Sistema'
      default: return 'Notificação'
    }
  }

  // Email template generators
  private generateQuizResultsEmailHTML(data: QuizResultEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Seus Resultados do Teste de Dons Espirituais</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .gift-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Parabéns, ${data.userName}!</h1>
        <p>Você completou o Teste de Dons Espirituais</p>
    </div>
    
    <div class="content">
        <p>Olá ${data.userName},</p>
        
        <p>É com grande alegria que compartilhamos os resultados do seu teste de dons espirituais, realizado em ${data.completionDate}.</p>
        
        <div class="gift-card">
            <h2>🌟 Seu Dom Espiritual Principal</h2>
            <h3 style="color: #3b82f6;">${data.primaryGift}</h3>
            <p>${data.giftDescription}</p>
        </div>
        
        <p>Este resultado foi cuidadosamente calculado com base nas suas respostas e pode ajudá-lo a entender melhor como Deus o equipou para servir no Seu reino.</p>
        
        <div style="text-align: center;">
            <a href="${data.detailsUrl}" class="button">Ver Detalhes Completos</a>
        </div>
        
        <p><strong>Próximos Passos:</strong></p>
        <ul>
            <li>Reflita sobre como você pode usar este dom em sua vida</li>
            <li>Converse com líderes espirituais sobre oportunidades de ministério</li>
            <li>Continue desenvolvendo este dom através da prática e estudo</li>
        </ul>
        
        <p>Lembre-se: todos os dons são importantes no corpo de Cristo. Use o seu para a glória de Deus!</p>
    </div>
    
    <div class="footer">
        <p>Teste de Dons Espirituais<br>
        Desenvolvido para ajudar você a descobrir seu propósito em Cristo</p>
    </div>
</body>
</html>
    `
  }

  private generateQuizResultsEmailText(data: QuizResultEmailData): string {
    return `
Parabéns, ${data.userName}!

Você completou o Teste de Dons Espirituais em ${data.completionDate}.

SEU DOM ESPIRITUAL PRINCIPAL: ${data.primaryGift}

${data.giftDescription}

Este resultado foi cuidadosamente calculado com base nas suas respostas e pode ajudá-lo a entender melhor como Deus o equipou para servir no Seu reino.

Para ver os detalhes completos, acesse: ${data.detailsUrl}

PRÓXIMOS PASSOS:
- Reflita sobre como você pode usar este dom em sua vida
- Converse com líderes espirituais sobre oportunidades de ministério
- Continue desenvolvendo este dom através da prática e estudo

Lembre-se: todos os dons são importantes no corpo de Cristo. Use o seu para a glória de Deus!

---
Teste de Dons Espirituais
Desenvolvido para ajudar você a descobrir seu propósito em Cristo
    `
  }

  private generateWelcomeEmailHTML(userName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bem-vindo ao Teste de Dons Espirituais</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✨ Bem-vindo, ${userName}!</h1>
        <p>Sua jornada de descoberta dos dons espirituais começa aqui</p>
    </div>
    
    <div class="content">
        <p>Olá ${userName},</p>
        
        <p>É uma alegria tê-lo conosco! Você acabou de se registrar no Teste de Dons Espirituais, uma ferramenta desenvolvida para ajudá-lo a descobrir como Deus o equipou para servir em Seu reino.</p>
        
        <p><strong>O que você pode esperar:</strong></p>
        <ul>
            <li>📝 Um teste abrangente baseado em princípios bíblicos</li>
            <li>🎯 Resultados personalizados sobre seus dons espirituais</li>
            <li>📖 Orientações práticas para desenvolver seus dons</li>
            <li>🤝 Conexões com oportunidades de ministério</li>
        </ul>
        
        <p>Cada pergunta foi cuidadosamente elaborada para ajudar a revelar os dons únicos que Deus lhe deu. Responda com honestidade e deixe o Espírito Santo guiá-lo!</p>
        
        <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/quiz" class="button">Começar o Teste</a>
        </div>
        
        <p>Que Deus abençoe esta jornada de descoberta e que você encontre alegria em usar seus dons para Sua glória!</p>
        
        <p>Em Cristo,<br>
        Equipe do Teste de Dons Espirituais</p>
    </div>
    
    <div class="footer">
        <p>Teste de Dons Espirituais<br>
        "Cada um exerça o dom que recebeu para servir aos outros" - 1 Pedro 4:10</p>
    </div>
</body>
</html>
    `
  }

  private generateWelcomeEmailText(userName: string): string {
    return `
Bem-vindo, ${userName}!

É uma alegria tê-lo conosco! Você acabou de se registrar no Teste de Dons Espirituais, uma ferramenta desenvolvida para ajudá-lo a descobrir como Deus o equipou para servir em Seu reino.

O QUE VOCÊ PODE ESPERAR:
- Um teste abrangente baseado em princípios bíblicos
- Resultados personalizados sobre seus dons espirituais
- Orientações práticas para desenvolver seus dons
- Conexões com oportunidades de ministério

Cada pergunta foi cuidadosamente elaborada para ajudar a revelar os dons únicos que Deus lhe deu. Responda com honestidade e deixe o Espírito Santo guiá-lo!

Para começar o teste, acesse: ${process.env.NEXT_PUBLIC_SITE_URL}/quiz

Que Deus abençoe esta jornada de descoberta e que você encontre alegria em usar seus dons para Sua glória!

Em Cristo,
Equipe do Teste de Dons Espirituais

---
"Cada um exerça o dom que recebeu para servir aos outros" - 1 Pedro 4:10
    `
  }

  private generateAdminNotificationHTML(data: AdminNotificationData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Notificação do Sistema</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fef2f2; padding: 20px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔔 ${this.getNotificationTitle(data.type)}</h1>
        <p>${data.timestamp}</p>
    </div>
    
    <div class="content">
        <h3>Detalhes:</h3>
        <div class="details">
            <p><strong>Usuário:</strong> ${data.userName} (${data.userEmail})</p>
            <p><strong>Tipo:</strong> ${data.type}</p>
            <p><strong>Timestamp:</strong> ${data.timestamp}</p>
            <pre>${JSON.stringify(data.details, null, 2)}</pre>
        </div>
    </div>
</body>
</html>
    `
  }

  private generateAdminNotificationText(data: AdminNotificationData): string {
    return `
NOTIFICAÇÃO DO SISTEMA: ${this.getNotificationTitle(data.type)}

Timestamp: ${data.timestamp}
Usuário: ${data.userName} (${data.userEmail})
Tipo: ${data.type}

Detalhes:
${JSON.stringify(data.details, null, 2)}

---
Sistema de Dons Espirituais - Notificação Automática
    `
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Utility function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}