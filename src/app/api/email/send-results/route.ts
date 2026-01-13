import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { emailService, QuizResultEmailData } from '@/lib/email'

// Force Node.js runtime for Supabase compatibility
export const runtime = 'nodejs'
const EMAIL_ENABLED = false

export async function POST(request: NextRequest) {
  if (!EMAIL_ENABLED) {
    return NextResponse.json(
      { error: 'Email sending is currently disabled' },
      { status: 503 }
    )
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }


    // Get quiz session with user data
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select(`
        *,
        answers (
          score,
          pool_question_id,
          question_pool (
            gift
          )
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .single()

    if (sessionError || !session) {
      console.error('❌ Email API: Session not found:', sessionError)
      return NextResponse.json({ error: 'Quiz session not found or not completed' }, { status: 404 })
    }

    // Calculate primary gift (highest scoring gift)
    const giftScores: { [key: string]: number[] } = {}
    
    session.answers?.forEach((answer) => {
      const gift = (answer.question_pool as { gift?: string } | null)?.gift
      if (gift && typeof gift === 'string') {
        if (!giftScores[gift]) {
          giftScores[gift] = []
        }
        giftScores[gift].push(answer.score)
      }
    })

    let primaryGift = 'Não identificado'
    let maxAverage = 0

    Object.entries(giftScores).forEach(([gift, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      if (average > maxAverage) {
        maxAverage = average
        primaryGift = gift
      }
    })

    // Gift name translations
    const giftNames: { [key: string]: string } = {
      'A_PROPHECY': 'Profecia',
      'B_SERVICE': 'Serviço',
      'C_TEACHING': 'Ensino',
      'D_EXHORTATION': 'Exortação',
      'E_GIVING': 'Contribuição',
      'F_LEADERSHIP': 'Liderança',
      'G_MERCY': 'Misericórdia',
      'H_WISDOM': 'Sabedoria',
      'I_KNOWLEDGE': 'Conhecimento',
      'J_FAITH': 'Fé',
      'K_HEALING': 'Cura',
      'L_MIRACLES': 'Milagres',
      'M_DISCERNMENT': 'Discernimento',
      'N_TONGUES': 'Línguas',
      'O_INTERPRETATION': 'Interpretação',
      'P_APOSTLESHIP': 'Apostolado',
      'Q_HELPS': 'Auxílio',
      'R_ADMINISTRATION': 'Administração',
      'S_EVANGELISM': 'Evangelismo',
      'T_SHEPHERDING': 'Pastoreio',
      'U_HOSPITALITY': 'Hospitalidade',
      'V_INTERCESSION': 'Intercessão'
    }

    // Get gift description
    const giftDescriptions: { [key: string]: string } = {
      'A_PROPHECY': 'O dom da profecia é a capacidade de proclamar a verdade de Deus de forma relevante e oportuna.',
      'B_SERVICE': 'O dom do serviço é a capacidade de identificar e suprir necessidades práticas no corpo de Cristo.',
      'C_TEACHING': 'O dom do ensino é a capacidade de explicar e aplicar a Palavra de Deus de forma clara e compreensível.',
      'D_EXHORTATION': 'O dom da exortação é a capacidade de encorajar, consolar e fortalecer outros na fé.',
      'E_GIVING': 'O dom da contribuição é a capacidade de dar generosamente dos recursos para a obra de Deus.',
      'F_LEADERSHIP': 'O dom da liderança é a capacidade de guiar e direcionar outros em direção aos objetivos de Deus.',
      'G_MERCY': 'O dom da misericórdia é a capacidade de demonstrar compaixão e cuidado especial por aqueles que sofrem.',
      'H_WISDOM': 'O dom da sabedoria é a capacidade de aplicar conhecimento bíblico para tomar decisões sábias.',
      'I_KNOWLEDGE': 'O dom do conhecimento é a capacidade de compreender e aplicar verdades bíblicas de forma prática.',
      'J_FAITH': 'O dom da fé é uma confiança extraordinária em Deus, acreditando em Suas promessas mesmo em circunstâncias difíceis.',
      'K_HEALING': 'O dom da cura é a capacidade de ser instrumento de Deus para restaurar a saúde física e emocional.',
      'L_MIRACLES': 'O dom de milagres é a capacidade de realizar sinais sobrenaturais que demonstram o poder de Deus.',
      'M_DISCERNMENT': 'O dom do discernimento é a capacidade de distinguir entre verdade e erro, identificando influências espirituais.',
      'N_TONGUES': 'O dom de línguas é a capacidade de falar em línguas não aprendidas para edificação da igreja.',
      'O_INTERPRETATION': 'O dom da interpretação é a capacidade de traduzir línguas espirituais para edificação da igreja.',
      'P_APOSTLESHIP': 'O dom apostólico é a capacidade especial de plantar e supervisionar igrejas, estabelecendo bases sólidas para o crescimento do Reino.',
      'Q_HELPS': 'O dom do auxílio é a capacidade de servir outros de forma prática, atendendo suas necessidades físicas e espirituais.',
      'R_ADMINISTRATION': 'O dom da administração é a capacidade dada por Deus para organizar, planejar e coordenar recursos e pessoas para o bem da igreja.',
      'S_EVANGELISM': 'O dom da evangelização é a capacidade especial de compartilhar o evangelho de forma clara e persuasiva.',
      'T_SHEPHERDING': 'O dom do pastoreio é a capacidade de cuidar, proteger e nutrir espiritualmente um grupo de pessoas.',
      'U_HOSPITALITY': 'O dom da hospitalidade é a capacidade de receber e cuidar de pessoas, criando um ambiente acolhedor.',
      'V_INTERCESSION': 'O dom da intercessão é a capacidade especial de orar persistentemente pelos outros e pelas necessidades da igreja.'
    }

    const primaryGiftName = giftNames[primaryGift] || primaryGift
    const giftDescription = giftDescriptions[primaryGift] || 'Um dom especial dado por Deus para servir ao Seu reino.'

    // Get user data
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
    const completionDate = new Date(session.completed_at || session.created_at).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Prepare email data
    const emailData: QuizResultEmailData = {
      userName,
      userEmail: user.email!,
      primaryGift: primaryGiftName,
      giftDescription,
      completionDate,
      detailsUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/pt/quiz/results/${sessionId}/overview`
    }


    // Send email
    const result = await emailService.sendQuizResultsEmail(emailData)

    if (result.success) {
      
      // Log email in database (optional)
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'email_sent',
          activity_data: {
            type: 'quiz_results',
            session_id: sessionId,
            email_id: result.id,
            primary_gift: primaryGift
          }
        })

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        emailId: result.id
      })
    } else {
      console.error('❌ Email API: Failed to send email:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

  } catch (error) {
    console.error('Email Send Results API Error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
