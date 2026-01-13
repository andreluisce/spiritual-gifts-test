import { Resend } from 'resend'

const EMAIL_ENABLED = false

// Initialize Resend client only when enabled
const resend = EMAIL_ENABLED ? new Resend(process.env.RESEND_API_KEY) : null

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
  details: Record<string, unknown>
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
    if (!EMAIL_ENABLED) {
      return { success: false, error: 'Email sending is disabled' }
    }

    if (!resend) {
      return { success: false, error: 'Email client is not configured' }
    }

    try {
      
      const emailPayload: {
        from: string
        to: string[]
        subject: string
        html?: string
        text?: string
        react?: unknown
        replyTo?: string
        cc?: string[]
        bcc?: string[]
      } = {
        from: this.from,
        to: Array.isArray(data.to) ? data.to : [data.to],
        subject: data.subject,
      }

      // Add html and text, ensuring at least one is provided
      if (data.html) {
        emailPayload.html = data.html
      }
      if (data.text) {
        emailPayload.text = data.text
      }
      if (!data.html && !data.text) {
        emailPayload.text = data.subject // fallback to subject as text
      }

      // Add optional fields
      if (data.reply_to) {
        emailPayload.replyTo = data.reply_to
      }
      if (data.cc) {
        emailPayload.cc = data.cc
      }
      if (data.bcc) {
        emailPayload.bcc = data.bcc
      }

      // Type assertion needed because Resend has complex union types for email options
      const result = await resend.emails.send(emailPayload as Parameters<typeof resend.emails.send>[0])

      return { success: true, id: result.data?.id }
    } catch (error) {
      console.error('❌ EmailService: Error sending email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send quiz results email to user
  async sendQuizResultsEmail(data: QuizResultEmailData) {
    if (!EMAIL_ENABLED) {
      return { success: false, error: 'Email sending is disabled' }
    }

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
    if (!EMAIL_ENABLED) {
      return { success: false, error: 'Email sending is disabled' }
    }

    const adminEmails = await this.getAdminEmails()
    if (adminEmails.length === 0) {
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
    if (!EMAIL_ENABLED) {
      return { success: false, error: 'Email sending is disabled' }
    }

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seus Resultados do Teste de Dons Espirituais</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 20px;
        }
        .container {
            max-width: 640px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .header-content { position: relative; z-index: 1; }
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header p {
            font-size: 18px;
            opacity: 0.95;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #374151;
            margin-bottom: 24px;
        }
        .intro {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        .gift-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 32px;
            margin: 32px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .gift-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        }
        .gift-icon {
            font-size: 48px;
            margin-bottom: 16px;
            display: block;
        }
        .gift-title {
            font-size: 16px;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .gift-name {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
        }
        .gift-description {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            font-style: italic;
        }
        .explanation {
            font-size: 16px;
            color: #6b7280;
            margin: 32px 0;
            line-height: 1.7;
            text-align: center;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
        }
        .next-steps {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
        }
        .next-steps h3 {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
        }
        .next-steps ul {
            list-style: none;
            padding: 0;
        }
        .next-steps li {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 12px;
            padding-left: 28px;
            position: relative;
            line-height: 1.6;
        }
        .next-steps li::before {
            content: '✨';
            position: absolute;
            left: 0;
            top: 0;
        }
        .inspiration {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
            border: 1px solid #f59e0b;
        }
        .inspiration p {
            font-size: 16px;
            color: #92400e;
            font-weight: 500;
            margin: 0;
            font-style: italic;
        }
        .footer {
            background: #1f2937;
            color: #d1d5db;
            padding: 32px 30px;
            text-align: center;
        }
        .footer h4 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: white;
        }
        .footer p {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 16px;
        }
        .footer a {
            color: #60a5fa;
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
            color: #93c5fd;
        }
        @media (max-width: 600px) {
            .container { margin: 10px; border-radius: 12px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .header h1 { font-size: 28px; }
            .gift-name { font-size: 24px; }
            .button { padding: 14px 28px; font-size: 15px; }
            .footer { padding: 24px 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>🎉 Parabéns, ${data.userName}!</h1>
                <p>Você completou o Teste de Dons Espirituais</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Olá ${data.userName},
            </div>
            
            <div class="intro">
                É com grande alegria que compartilhamos os resultados do seu teste de dons espirituais, realizado em <strong>${data.completionDate}</strong>. Este é um momento especial de descoberta e crescimento espiritual!
            </div>
            
            <div class="gift-card">
                <span class="gift-icon">🌟</span>
                <div class="gift-title">Seu Dom Espiritual Principal</div>
                <div class="gift-name">${data.primaryGift}</div>
                <div class="gift-description">${data.giftDescription}</div>
            </div>
            
            <div class="explanation">
                Este resultado foi cuidadosamente calculado com base nas suas respostas e pode ajudá-lo a entender melhor como Deus o equipou para servir no Seu reino.
            </div>
            
            <div class="cta-section">
                <a href="${data.detailsUrl}" class="button">🔍 Ver Análise Completa</a>
            </div>
            
            <div class="next-steps">
                <h3>🚀 Próximos Passos</h3>
                <ul>
                    <li>Reflita sobre como você pode usar este dom em sua vida diária</li>
                    <li>Converse com líderes espirituais sobre oportunidades de ministério</li>
                    <li>Continue desenvolvendo este dom através da prática e estudo</li>
                    <li>Explore formas práticas de aplicar seu dom na comunidade</li>
                </ul>
            </div>
            
            <div class="inspiration">
                <p>"Cada um deve usar o dom que recebeu para servir os outros, administrando fielmente a graça de Deus em suas múltiplas formas." - 1 Pedro 4:10</p>
            </div>
        </div>
        
        <div class="footer">
            <h4>Descubra Seu Dom</h4>
            <p>Ajudando você a descobrir e desenvolver seus dons espirituais</p>
            <a href="https://descubraseudom.online">🌐 descubraseudom.online</a>
        </div>
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
