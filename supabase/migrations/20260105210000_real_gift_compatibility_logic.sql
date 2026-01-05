-- =========================================================
-- REAL GIFT COMPATIBILITY AND MINISTRY LOGIC
-- Replaces mock/stub data with actual spiritual gifts logic
-- =========================================================

-- Drop existing stub functions
DROP FUNCTION IF EXISTS public.get_gift_compatibility(public.gift_key, public.gift_key, text);
DROP FUNCTION IF EXISTS public.get_ministry_recommendations(public.gift_key[], text);

-- =========================================================
-- REAL GIFT COMPATIBILITY FUNCTION
-- Returns actual compatibility based on gift characteristics
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_gift_compatibility(
  p_primary_gift public.gift_key,
  p_secondary_gift public.gift_key,
  p_locale text DEFAULT 'pt'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_synergy_level text;
  v_description text;
  v_score numeric;
  v_strengths jsonb;
  v_challenges jsonb;
BEGIN
  -- Define compatibility matrix based on spiritual gift characteristics
  -- Strong synergies (85-95%)
  IF (p_primary_gift = 'C_TEACHING' AND p_secondary_gift = 'D_EXHORTATION') OR
     (p_primary_gift = 'D_EXHORTATION' AND p_secondary_gift = 'C_TEACHING') THEN
    v_synergy_level := 'strong';
    v_score := 92;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Combinação poderosa de instrução e motivação' ELSE 'Powerful combination of instruction and motivation' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Ensino claro com aplicação prática' ELSE 'Clear teaching with practical application' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Capacidade de inspirar mudança através da verdade' ELSE 'Ability to inspire change through truth' END, 'order', 2),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Equilíbrio entre conhecimento e ação' ELSE 'Balance between knowledge and action' END, 'order', 3)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Risco de sobrecarregar com muita informação' ELSE 'Risk of overwhelming with too much information' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Priorizar mensagens-chave' ELSE 'Prioritize key messages' END, 'order', 1)
    );

  ELSIF (p_primary_gift = 'B_SERVICE' AND p_secondary_gift = 'G_MERCY') OR
        (p_primary_gift = 'G_MERCY' AND p_secondary_gift = 'B_SERVICE') THEN
    v_synergy_level := 'strong';
    v_score := 90;
    v_description := CASE WHEN p_locale = 'pt' THEN 'União perfeita de ação prática e coração compassivo' ELSE 'Perfect union of practical action and compassionate heart' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Cuidado integral das pessoas' ELSE 'Holistic care for people' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Empatia traduzida em ações concretas' ELSE 'Empathy translated into concrete actions' END, 'order', 2),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Excelência em ministérios de assistência' ELSE 'Excellence in assistance ministries' END, 'order', 3)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Tendência ao esgotamento emocional' ELSE 'Tendency toward emotional burnout' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Estabelecer limites saudáveis' ELSE 'Establish healthy boundaries' END, 'order', 1)
    );

  ELSIF (p_primary_gift = 'F_LEADERSHIP' AND p_secondary_gift = 'C_TEACHING') OR
        (p_primary_gift = 'C_TEACHING' AND p_secondary_gift = 'F_LEADERSHIP') THEN
    v_synergy_level := 'strong';
    v_score := 88;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Visão estratégica com capacidade de equipar outros' ELSE 'Strategic vision with ability to equip others' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Liderança que desenvolve pessoas' ELSE 'Leadership that develops people' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Comunicação clara da visão' ELSE 'Clear communication of vision' END, 'order', 2),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Formação de novos líderes' ELSE 'Formation of new leaders' END, 'order', 3)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Pode ser muito exigente com a equipe' ELSE 'May be too demanding with team' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Balancear expectativas com graça' ELSE 'Balance expectations with grace' END, 'order', 1)
    );

  ELSIF (p_primary_gift = 'A_PROPHECY' AND p_secondary_gift = 'D_EXHORTATION') OR
        (p_primary_gift = 'D_EXHORTATION' AND p_secondary_gift = 'A_PROPHECY') THEN
    v_synergy_level := 'strong';
    v_score := 87;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Verdade profética equilibrada com encorajamento' ELSE 'Prophetic truth balanced with encouragement' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Correção amorosa e edificante' ELSE 'Loving and edifying correction' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Discernimento com esperança' ELSE 'Discernment with hope' END, 'order', 2),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Capacidade de restaurar e direcionar' ELSE 'Ability to restore and direct' END, 'order', 3)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Tensão entre verdade e aceitação' ELSE 'Tension between truth and acceptance' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Falar a verdade em amor' ELSE 'Speak truth in love' END, 'order', 1)
    );

  ELSIF (p_primary_gift = 'E_GIVING' AND p_secondary_gift = 'B_SERVICE') OR
        (p_primary_gift = 'B_SERVICE' AND p_secondary_gift = 'E_GIVING') THEN
    v_synergy_level := 'strong';
    v_score := 86;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Recursos materiais encontram necessidades práticas' ELSE 'Material resources meet practical needs' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Generosidade com ação efetiva' ELSE 'Generosity with effective action' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Excelência em projetos sociais' ELSE 'Excellence in social projects' END, 'order', 2),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Impacto tangível na comunidade' ELSE 'Tangible impact in community' END, 'order', 3)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Foco excessivo no material' ELSE 'Excessive focus on material' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Lembrar do aspecto espiritual' ELSE 'Remember spiritual aspect' END, 'order', 1)
    );

  -- Moderate synergies (70-84%)
  ELSIF (p_primary_gift = 'F_LEADERSHIP' AND p_secondary_gift = 'B_SERVICE') OR
        (p_primary_gift = 'B_SERVICE' AND p_secondary_gift = 'F_LEADERSHIP') THEN
    v_synergy_level := 'moderate';
    v_score := 78;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Direção estratégica com execução prática' ELSE 'Strategic direction with practical execution' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Visão que se concretiza em ações' ELSE 'Vision that materializes in actions' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Liderança pelo exemplo' ELSE 'Leadership by example' END, 'order', 2)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Conflito entre planejar e executar' ELSE 'Conflict between planning and executing' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Delegar tarefas operacionais' ELSE 'Delegate operational tasks' END, 'order', 1),
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Risco de microgerenciamento' ELSE 'Risk of micromanagement' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Confiar na equipe' ELSE 'Trust the team' END, 'order', 2)
    );

  ELSIF (p_primary_gift = 'C_TEACHING' AND p_secondary_gift = 'A_PROPHECY') OR
        (p_primary_gift = 'A_PROPHECY' AND p_secondary_gift = 'C_TEACHING') THEN
    v_synergy_level := 'moderate';
    v_score := 76;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Instrução profunda com discernimento espiritual' ELSE 'Deep instruction with spiritual discernment' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Ensino com revelação' ELSE 'Teaching with revelation' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Capacidade de expor verdades profundas' ELSE 'Ability to expose deep truths' END, 'order', 2)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Pode ser muito direto ou crítico' ELSE 'May be too direct or critical' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Temperar verdade com graça' ELSE 'Season truth with grace' END, 'order', 1)
    );

  ELSIF (p_primary_gift = 'G_MERCY' AND p_secondary_gift = 'D_EXHORTATION') OR
        (p_primary_gift = 'D_EXHORTATION' AND p_secondary_gift = 'G_MERCY') THEN
    v_synergy_level := 'moderate';
    v_score := 82;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Compaixão que motiva e restaura' ELSE 'Compassion that motivates and restores' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Aconselhamento empático e eficaz' ELSE 'Empathetic and effective counseling' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Capacidade de restaurar feridos' ELSE 'Ability to restore the wounded' END, 'order', 2),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Encorajamento genuíno' ELSE 'Genuine encouragement' END, 'order', 3)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Dificuldade em confrontar quando necessário' ELSE 'Difficulty confronting when necessary' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Lembrar que amor também corrige' ELSE 'Remember that love also corrects' END, 'order', 1)
    );

  ELSIF (p_primary_gift = 'E_GIVING' AND p_secondary_gift = 'G_MERCY') OR
        (p_primary_gift = 'G_MERCY' AND p_secondary_gift = 'E_GIVING') THEN
    v_synergy_level := 'moderate';
    v_score := 80;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Generosidade guiada por compaixão' ELSE 'Generosity guided by compassion' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Doação direcionada às reais necessidades' ELSE 'Giving directed to real needs' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Sensibilidade às causas nobres' ELSE 'Sensitivity to noble causes' END, 'order', 2)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Risco de ser manipulado emocionalmente' ELSE 'Risk of emotional manipulation' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Buscar sabedoria antes de doar' ELSE 'Seek wisdom before giving' END, 'order', 1)
    );

  -- Challenging combinations (55-69%)
  ELSIF (p_primary_gift = 'A_PROPHECY' AND p_secondary_gift = 'G_MERCY') OR
        (p_primary_gift = 'G_MERCY' AND p_secondary_gift = 'A_PROPHECY') THEN
    v_synergy_level := 'challenge';
    v_score := 62;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Tensão entre verdade e compaixão' ELSE 'Tension between truth and compassion' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Equilíbrio entre justiça e misericórdia' ELSE 'Balance between justice and mercy' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Visão completa das situações' ELSE 'Complete view of situations' END, 'order', 2)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Conflito interno entre corrigir e consolar' ELSE 'Internal conflict between correcting and comforting' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Buscar sabedoria para cada situação' ELSE 'Seek wisdom for each situation' END, 'order', 1),
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Pode parecer inconsistente' ELSE 'May seem inconsistent' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Explicar suas motivações' ELSE 'Explain your motivations' END, 'order', 2)
    );

  ELSIF (p_primary_gift = 'F_LEADERSHIP' AND p_secondary_gift = 'A_PROPHECY') OR
        (p_primary_gift = 'A_PROPHECY' AND p_secondary_gift = 'F_LEADERSHIP') THEN
    v_synergy_level := 'challenge';
    v_score := 65;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Visão estratégica com correção profética' ELSE 'Strategic vision with prophetic correction' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Liderança com discernimento espiritual' ELSE 'Leadership with spiritual discernment' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Coragem para mudanças necessárias' ELSE 'Courage for necessary changes' END, 'order', 2)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Pode ser percebido como autoritário' ELSE 'May be perceived as authoritarian' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Cultivar humildade e escuta' ELSE 'Cultivate humility and listening' END, 'order', 1),
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Tensão entre visão e correção' ELSE 'Tension between vision and correction' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Alinhar ambos com a Palavra' ELSE 'Align both with the Word' END, 'order', 2)
    );

  ELSIF (p_primary_gift = 'B_SERVICE' AND p_secondary_gift = 'A_PROPHECY') OR
        (p_primary_gift = 'A_PROPHECY' AND p_secondary_gift = 'B_SERVICE') THEN
    v_synergy_level := 'challenge';
    v_score := 60;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Ação prática com discernimento profético' ELSE 'Practical action with prophetic discernment' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Serviço direcionado espiritualmente' ELSE 'Spiritually directed service' END, 'order', 1)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Ritmos diferentes: reflexão vs. ação' ELSE 'Different rhythms: reflection vs. action' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Criar espaço para ambos' ELSE 'Create space for both' END, 'order', 1),
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Frustração com falta de ação imediata' ELSE 'Frustration with lack of immediate action' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Valorizar o tempo de discernimento' ELSE 'Value discernment time' END, 'order', 2)
    );

  -- Default for unlisted combinations
  ELSE
    v_synergy_level := 'moderate';
    v_score := 72;
    v_description := CASE WHEN p_locale = 'pt' THEN 'Combinação complementar de dons' ELSE 'Complementary gift combination' END;
    v_strengths := jsonb_build_array(
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Diversidade de perspectivas' ELSE 'Diversity of perspectives' END, 'order', 1),
      jsonb_build_object('strength', CASE WHEN p_locale = 'pt' THEN 'Capacidade de ministério abrangente' ELSE 'Comprehensive ministry capability' END, 'order', 2)
    );
    v_challenges := jsonb_build_array(
      jsonb_build_object('challenge', CASE WHEN p_locale = 'pt' THEN 'Necessidade de integrar diferentes abordagens' ELSE 'Need to integrate different approaches' END,
                        'solution', CASE WHEN p_locale = 'pt' THEN 'Buscar unidade na diversidade' ELSE 'Seek unity in diversity' END, 'order', 1)
    );
  END IF;

  RETURN jsonb_build_object(
    'synergyLevel', v_synergy_level,
    'description', v_description,
    'compatibilityScore', v_score,
    'strengths', v_strengths,
    'challenges', v_challenges
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_gift_compatibility(public.gift_key, public.gift_key, text) TO anon, authenticated, service_role;

-- =========================================================
-- REAL MINISTRY RECOMMENDATIONS FUNCTION
-- Returns actual ministries based on gift combinations
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_ministry_recommendations(
  p_user_gifts public.gift_key[],
  p_locale text DEFAULT 'pt'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ministries jsonb := '[]'::jsonb;
  v_has_teaching boolean := 'C_TEACHING' = ANY(p_user_gifts);
  v_has_exhortation boolean := 'D_EXHORTATION' = ANY(p_user_gifts);
  v_has_mercy boolean := 'G_MERCY' = ANY(p_user_gifts);
  v_has_service boolean := 'B_SERVICE' = ANY(p_user_gifts);
  v_has_leadership boolean := 'F_LEADERSHIP' = ANY(p_user_gifts);
  v_has_prophecy boolean := 'A_PROPHECY' = ANY(p_user_gifts);
  v_has_giving boolean := 'E_GIVING' = ANY(p_user_gifts);
BEGIN

  -- Teaching Ministry
  IF v_has_teaching THEN
    v_ministries := v_ministries || jsonb_build_array(
      jsonb_build_object(
        'ministry_key', 'teaching',
        'ministry_name', CASE WHEN p_locale = 'pt' THEN 'Ensino e Discipulado' ELSE 'Teaching and Discipleship' END,
        'description', CASE WHEN p_locale = 'pt' THEN 'Ministério focado em explicar as Escrituras e formar discípulos' ELSE 'Ministry focused on explaining Scripture and forming disciples' END,
        'compatibility_score', CASE
          WHEN v_has_exhortation OR v_has_leadership THEN 95
          WHEN v_has_prophecy THEN 85
          ELSE 80
        END,
        'matched_gifts', array_length(ARRAY(SELECT unnest(p_user_gifts) INTERSECT SELECT unnest(ARRAY['C_TEACHING'::public.gift_key, 'D_EXHORTATION'::public.gift_key, 'F_LEADERSHIP'::public.gift_key])), 1),
        'total_required', 2,
        'responsibilities', jsonb_build_array(
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Preparar e ministrar estudos bíblicos' ELSE 'Prepare and teach Bible studies' END, 'order', 1),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Desenvolver materiais de discipulado' ELSE 'Develop discipleship materials' END, 'order', 2),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Mentorear novos crentes' ELSE 'Mentor new believers' END, 'order', 3)
        ),
        'growth_areas', jsonb_build_array(
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Comunicação didática' ELSE 'Didactic communication' END, 'order', 1, 'resources', CASE WHEN p_locale = 'pt' THEN 'Cursos de pedagogia bíblica' ELSE 'Biblical pedagogy courses' END),
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Hermenêutica' ELSE 'Hermeneutics' END, 'order', 2, 'resources', CASE WHEN p_locale = 'pt' THEN 'Estudo de interpretação bíblica' ELSE 'Biblical interpretation study' END)
        )
      )
    );
  END IF;

  -- Pastoral Care / Counseling
  IF v_has_mercy OR v_has_exhortation THEN
    v_ministries := v_ministries || jsonb_build_array(
      jsonb_build_object(
        'ministry_key', 'pastoral_care',
        'ministry_name', CASE WHEN p_locale = 'pt' THEN 'Cuidado Pastoral e Aconselhamento' ELSE 'Pastoral Care and Counseling' END,
        'description', CASE WHEN p_locale = 'pt' THEN 'Ministério de apoio emocional e espiritual às pessoas' ELSE 'Ministry of emotional and spiritual support to people' END,
        'compatibility_score', CASE
          WHEN v_has_mercy AND v_has_exhortation THEN 98
          WHEN v_has_service THEN 90
          ELSE 85
        END,
        'matched_gifts', array_length(ARRAY(SELECT unnest(p_user_gifts) INTERSECT SELECT unnest(ARRAY['G_MERCY'::public.gift_key, 'D_EXHORTATION'::public.gift_key, 'B_SERVICE'::public.gift_key])), 1),
        'total_required', 2,
        'responsibilities', jsonb_build_array(
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Oferecer aconselhamento individual' ELSE 'Offer individual counseling' END, 'order', 1),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Visitar enfermos e necessitados' ELSE 'Visit the sick and needy' END, 'order', 2),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Liderar grupos de apoio' ELSE 'Lead support groups' END, 'order', 3)
        ),
        'growth_areas', jsonb_build_array(
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Escuta ativa' ELSE 'Active listening' END, 'order', 1, 'resources', CASE WHEN p_locale = 'pt' THEN 'Treinamento em aconselhamento cristão' ELSE 'Christian counseling training' END),
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Estabelecimento de limites' ELSE 'Boundary setting' END, 'order', 2, 'resources', CASE WHEN p_locale = 'pt' THEN 'Livros sobre autocuidado ministerial' ELSE 'Books on ministerial self-care' END)
        )
      )
    );
  END IF;

  -- Administration / Leadership
  IF v_has_leadership THEN
    v_ministries := v_ministries || jsonb_build_array(
      jsonb_build_object(
        'ministry_key', 'administration',
        'ministry_name', CASE WHEN p_locale = 'pt' THEN 'Administração e Liderança' ELSE 'Administration and Leadership' END,
        'description', CASE WHEN p_locale = 'pt' THEN 'Ministério de organização, gestão e direção estratégica' ELSE 'Ministry of organization, management and strategic direction' END,
        'compatibility_score', CASE
          WHEN v_has_service OR v_has_giving THEN 92
          WHEN v_has_teaching THEN 88
          ELSE 82
        END,
        'matched_gifts', array_length(ARRAY(SELECT unnest(p_user_gifts) INTERSECT SELECT unnest(ARRAY['F_LEADERSHIP'::public.gift_key, 'B_SERVICE'::public.gift_key, 'E_GIVING'::public.gift_key])), 1),
        'total_required', 2,
        'responsibilities', jsonb_build_array(
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Coordenar equipes e projetos' ELSE 'Coordinate teams and projects' END, 'order', 1),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Desenvolver visão e estratégia' ELSE 'Develop vision and strategy' END, 'order', 2),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Gerir recursos da igreja' ELSE 'Manage church resources' END, 'order', 3)
        ),
        'growth_areas', jsonb_build_array(
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Gestão de pessoas' ELSE 'People management' END, 'order', 1, 'resources', CASE WHEN p_locale = 'pt' THEN 'Cursos de liderança cristã' ELSE 'Christian leadership courses' END),
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Planejamento estratégico' ELSE 'Strategic planning' END, 'order', 2, 'resources', CASE WHEN p_locale = 'pt' THEN 'Livros sobre administração eclesiástica' ELSE 'Books on church administration' END)
        )
      )
    );
  END IF;

  -- Social Action / Service
  IF v_has_service THEN
    v_ministries := v_ministries || jsonb_build_array(
      jsonb_build_object(
        'ministry_key', 'social_action',
        'ministry_name', CASE WHEN p_locale = 'pt' THEN 'Ação Social e Serviço' ELSE 'Social Action and Service' END,
        'description', CASE WHEN p_locale = 'pt' THEN 'Ministério de atendimento prático às necessidades da comunidade' ELSE 'Ministry of practical service to community needs' END,
        'compatibility_score', CASE
          WHEN v_has_mercy AND v_has_giving THEN 96
          WHEN v_has_mercy OR v_has_giving THEN 90
          ELSE 84
        END,
        'matched_gifts', array_length(ARRAY(SELECT unnest(p_user_gifts) INTERSECT SELECT unnest(ARRAY['B_SERVICE'::public.gift_key, 'G_MERCY'::public.gift_key, 'E_GIVING'::public.gift_key])), 1),
        'total_required', 2,
        'responsibilities', jsonb_build_array(
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Organizar ações de assistência' ELSE 'Organize assistance actions' END, 'order', 1),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Servir em projetos comunitários' ELSE 'Serve in community projects' END, 'order', 2),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Mobilizar recursos para necessitados' ELSE 'Mobilize resources for the needy' END, 'order', 3)
        ),
        'growth_areas', jsonb_build_array(
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Gestão de projetos sociais' ELSE 'Social project management' END, 'order', 1, 'resources', CASE WHEN p_locale = 'pt' THEN 'Cursos de assistência social' ELSE 'Social assistance courses' END),
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Parcerias comunitárias' ELSE 'Community partnerships' END, 'order', 2, 'resources', CASE WHEN p_locale = 'pt' THEN 'Networking com ONGs' ELSE 'Networking with NGOs' END)
        )
      )
    );
  END IF;

  -- Evangelism / Outreach
  IF v_has_exhortation OR v_has_prophecy THEN
    v_ministries := v_ministries || jsonb_build_array(
      jsonb_build_object(
        'ministry_key', 'evangelism',
        'ministry_name', CASE WHEN p_locale = 'pt' THEN 'Evangelismo e Missões' ELSE 'Evangelism and Missions' END,
        'description', CASE WHEN p_locale = 'pt' THEN 'Ministério de proclamação do evangelho e alcance de não-crentes' ELSE 'Ministry of gospel proclamation and reaching non-believers' END,
        'compatibility_score', CASE
          WHEN v_has_teaching THEN 88
          WHEN v_has_mercy THEN 82
          ELSE 78
        END,
        'matched_gifts', array_length(ARRAY(SELECT unnest(p_user_gifts) INTERSECT SELECT unnest(ARRAY['D_EXHORTATION'::public.gift_key, 'A_PROPHECY'::public.gift_key, 'C_TEACHING'::public.gift_key])), 1),
        'total_required', 2,
        'responsibilities', jsonb_build_array(
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Compartilhar o evangelho' ELSE 'Share the gospel' END, 'order', 1),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Organizar eventos evangelísticos' ELSE 'Organize evangelistic events' END, 'order', 2),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Treinar outros em evangelismo' ELSE 'Train others in evangelism' END, 'order', 3)
        ),
        'growth_areas', jsonb_build_array(
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Apologética' ELSE 'Apologetics' END, 'order', 1, 'resources', CASE WHEN p_locale = 'pt' THEN 'Cursos de defesa da fé' ELSE 'Faith defense courses' END),
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Comunicação contextual' ELSE 'Contextual communication' END, 'order', 2, 'resources', CASE WHEN p_locale = 'pt' THEN 'Estudos sobre cultura contemporânea' ELSE 'Contemporary culture studies' END)
        )
      )
    );
  END IF;

  -- Worship / Intercession
  IF v_has_prophecy OR v_has_mercy THEN
    v_ministries := v_ministries || jsonb_build_array(
      jsonb_build_object(
        'ministry_key', 'worship_intercession',
        'ministry_name', CASE WHEN p_locale = 'pt' THEN 'Adoração e Intercessão' ELSE 'Worship and Intercession' END,
        'description', CASE WHEN p_locale = 'pt' THEN 'Ministério de oração, adoração e guerra espiritual' ELSE 'Ministry of prayer, worship and spiritual warfare' END,
        'compatibility_score', CASE
          WHEN v_has_exhortation THEN 85
          ELSE 78
        END,
        'matched_gifts', array_length(ARRAY(SELECT unnest(p_user_gifts) INTERSECT SELECT unnest(ARRAY['A_PROPHECY'::public.gift_key, 'G_MERCY'::public.gift_key, 'D_EXHORTATION'::public.gift_key])), 1),
        'total_required', 1,
        'responsibilities', jsonb_build_array(
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Liderar momentos de oração' ELSE 'Lead prayer moments' END, 'order', 1),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Interceder pela igreja e nação' ELSE 'Intercede for church and nation' END, 'order', 2),
          jsonb_build_object('responsibility', CASE WHEN p_locale = 'pt' THEN 'Ministrar em adoração profética' ELSE 'Minister in prophetic worship' END, 'order', 3)
        ),
        'growth_areas', jsonb_build_array(
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Vida de oração' ELSE 'Prayer life' END, 'order', 1, 'resources', CASE WHEN p_locale = 'pt' THEN 'Livros sobre intercessão' ELSE 'Books on intercession' END),
          jsonb_build_object('area', CASE WHEN p_locale = 'pt' THEN 'Sensibilidade espiritual' ELSE 'Spiritual sensitivity' END, 'order', 2, 'resources', CASE WHEN p_locale = 'pt' THEN 'Retiros de oração' ELSE 'Prayer retreats' END)
        )
      )
    );
  END IF;

  -- Sort by compatibility score descending
  v_ministries := (
    SELECT jsonb_agg(ministry ORDER BY (ministry->>'compatibility_score')::numeric DESC)
    FROM jsonb_array_elements(v_ministries) AS ministry
  );

  RETURN COALESCE(v_ministries, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ministry_recommendations(public.gift_key[], text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_gift_compatibility(public.gift_key, public.gift_key, text) IS 'Returns REAL compatibility analysis between two gifts based on spiritual characteristics';
COMMENT ON FUNCTION public.get_ministry_recommendations(public.gift_key[], text) IS 'Returns REAL ministry recommendations based on user gift combinations';
