-- Rewrite reformulated questions (134-175) to neutral, observable behaviors
-- Updates base text and all translations (pt/en/es)

BEGIN;

-- Base texts
UPDATE question_pool SET text = 'Antes de pregar, separo tempo específico para orar pela mensagem.' WHERE id = 134;
UPDATE question_pool SET text = 'Ao preparar uma mensagem, reviso um esboço que combina estudo e oração.' WHERE id = 135;
UPDATE question_pool SET text = 'Ao planejar, adapto exemplos considerando perfis diferentes do público.' WHERE id = 136;
UPDATE question_pool SET text = 'Depois de falar em público, peço feedback sobre o que foi útil para o grupo.' WHERE id = 137;
UPDATE question_pool SET text = 'Quando proponho padrões bíblicos, mostro exemplos práticos de como isso melhora relações.' WHERE id = 138;
UPDATE question_pool SET text = 'Em debates, trago situações concretas que mostram como aplico o princípio em contextos diferentes.' WHERE id = 139;

UPDATE question_pool SET text = 'Antes de aceitar um pedido, confirmo tempo e recursos disponíveis.' WHERE id = 140;
UPDATE question_pool SET text = 'Em imprevistos, priorizo, comunico e ajusto prazos com quem depende do meu serviço.' WHERE id = 141;
UPDATE question_pool SET text = 'Enquanto executo tarefas, verifico com os envolvidos se o ritmo e a abordagem estão adequados.' WHERE id = 142;
UPDATE question_pool SET text = 'Em tarefas recorrentes, mantenho a entrega mesmo quando não há reconhecimento imediato.' WHERE id = 143;
UPDATE question_pool SET text = 'Em semanas cheias, peço ou aceito ajuda para dividir tarefas.' WHERE id = 144;
UPDATE question_pool SET text = 'Antes de suprir rapidamente uma demanda, avalio se é o momento certo de agir.' WHERE id = 145;

UPDATE question_pool SET text = 'Ao ensinar, simplifico termos técnicos e verifico se a turma acompanhou.' WHERE id = 146;
UPDATE question_pool SET text = 'Diante de uma decisão, uso as informações disponíveis e defino um prazo claro.' WHERE id = 147;
UPDATE question_pool SET text = 'Antes da aula, ajusto exemplos conforme a idade ou contexto dos alunos.' WHERE id = 148;
UPDATE question_pool SET text = 'Apresento conceitos em passos curtos com exemplos práticos.' WHERE id = 149;
UPDATE question_pool SET text = 'Depois de ensinar, mostro como aplicar o ponto em uma situação real.' WHERE id = 150;
UPDATE question_pool SET text = 'Em discussões, mantenho tom calmo e convido perguntas antes de concluir.' WHERE id = 151;

UPDATE question_pool SET text = 'Em aconselhamentos, faço perguntas abertas antes de sugerir caminhos.' WHERE id = 152;
UPDATE question_pool SET text = 'Registro pequenos avanços e revisito na conversa seguinte.' WHERE id = 153;
UPDATE question_pool SET text = 'Ao usar um texto bíblico, explico rapidamente o contexto antes de aplicar.' WHERE id = 154;
UPDATE question_pool SET text = 'Quando alguém progride, dou crédito a Deus e ao esforço da pessoa.' WHERE id = 155;
UPDATE question_pool SET text = 'Equilibro propostas de ação com investigar as causas do problema.' WHERE id = 156;
UPDATE question_pool SET text = 'Ao montar um plano, reservo momento para orar com a pessoa pelo próximo passo.' WHERE id = 157;

UPDATE question_pool SET text = 'Defino um valor ou percentual de oferta e sigo mesmo sem retorno imediato.' WHERE id = 158;
UPDATE question_pool SET text = 'Prefiro contribuir de forma discreta, sem divulgar valores.' WHERE id = 159;
UPDATE question_pool SET text = 'Antes de ajudar financeiramente, avalio impacto de curto e longo prazo.' WHERE id = 160;
UPDATE question_pool SET text = 'Mantenho regularidade nas ofertas independentemente de reconhecimento.' WHERE id = 161;
UPDATE question_pool SET text = 'Converso com a família sobre prioridades financeiras e motivação espiritual.' WHERE id = 162;
UPDATE question_pool SET text = 'Quando incentivo outros a doar, compartilho exemplos sem pressão.' WHERE id = 163;

UPDATE question_pool SET text = 'Distribuo decisões conforme a especialidade de cada membro da equipe.' WHERE id = 164;
UPDATE question_pool SET text = 'Ao perseguir metas, reservo tempo para ouvir necessidades pessoais da equipe.' WHERE id = 165;
UPDATE question_pool SET text = 'Antes de decidir, apresento opções e ouço objeções da equipe.' WHERE id = 166;
UPDATE question_pool SET text = 'Agradeço contribuições citando o que foi feito e por quem.' WHERE id = 167;
UPDATE question_pool SET text = 'Ao delegar tarefas, explico como cada uma se conecta ao objetivo maior.' WHERE id = 168;
UPDATE question_pool SET text = 'Recalibro prazos quando percebo limites de carga ou capacidade da equipe.' WHERE id = 169;

UPDATE question_pool SET text = 'Em decisões difíceis, ouço a pessoa e consulto alguém de confiança antes de agir.' WHERE id = 170;
UPDATE question_pool SET text = 'Em conversas difíceis, digo claramente o que precisa mudar mantendo respeito.' WHERE id = 171;
UPDATE question_pool SET text = 'Ao apoiar alguém, combino escuta com incentivo a passos concretos.' WHERE id = 172;
UPDATE question_pool SET text = 'Quando ofendido, pratico liberar perdão e manter diálogo aberto.' WHERE id = 173;
UPDATE question_pool SET text = 'Avalio o contexto antes de reagir e ajusto meu tom conforme a situação.' WHERE id = 174;
UPDATE question_pool SET text = 'Ao defender terceiros, verifico se estou autorizado e se é meu papel intervir.' WHERE id = 175;

-- PT translations
UPDATE question_translations SET text = 'Antes de pregar, separo tempo específico para orar pela mensagem.' WHERE question_id = 134 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao preparar uma mensagem, reviso um esboço que combina estudo e oração.' WHERE question_id = 135 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao planejar, adapto exemplos considerando perfis diferentes do público.' WHERE question_id = 136 AND locale = 'pt';
UPDATE question_translations SET text = 'Depois de falar em público, peço feedback sobre o que foi útil para o grupo.' WHERE question_id = 137 AND locale = 'pt';
UPDATE question_translations SET text = 'Quando proponho padrões bíblicos, mostro exemplos práticos de como isso melhora relações.' WHERE question_id = 138 AND locale = 'pt';
UPDATE question_translations SET text = 'Em debates, trago situações concretas que mostram como aplico o princípio em contextos diferentes.' WHERE question_id = 139 AND locale = 'pt';

UPDATE question_translations SET text = 'Antes de aceitar um pedido, confirmo tempo e recursos disponíveis.' WHERE question_id = 140 AND locale = 'pt';
UPDATE question_translations SET text = 'Em imprevistos, priorizo, comunico e ajusto prazos com quem depende do meu serviço.' WHERE question_id = 141 AND locale = 'pt';
UPDATE question_translations SET text = 'Enquanto executo tarefas, verifico com os envolvidos se o ritmo e a abordagem estão adequados.' WHERE question_id = 142 AND locale = 'pt';
UPDATE question_translations SET text = 'Em tarefas recorrentes, mantenho a entrega mesmo quando não há reconhecimento imediato.' WHERE question_id = 143 AND locale = 'pt';
UPDATE question_translations SET text = 'Em semanas cheias, peço ou aceito ajuda para dividir tarefas.' WHERE question_id = 144 AND locale = 'pt';
UPDATE question_translations SET text = 'Antes de suprir rapidamente uma demanda, avalio se é o momento certo de agir.' WHERE question_id = 145 AND locale = 'pt';

UPDATE question_translations SET text = 'Ao ensinar, simplifico termos técnicos e verifico se a turma acompanhou.' WHERE question_id = 146 AND locale = 'pt';
UPDATE question_translations SET text = 'Diante de uma decisão, uso as informações disponíveis e defino um prazo claro.' WHERE question_id = 147 AND locale = 'pt';
UPDATE question_translations SET text = 'Antes da aula, ajusto exemplos conforme a idade ou contexto dos alunos.' WHERE question_id = 148 AND locale = 'pt';
UPDATE question_translations SET text = 'Apresento conceitos em passos curtos com exemplos práticos.' WHERE question_id = 149 AND locale = 'pt';
UPDATE question_translations SET text = 'Depois de ensinar, mostro como aplicar o ponto em uma situação real.' WHERE question_id = 150 AND locale = 'pt';
UPDATE question_translations SET text = 'Em discussões, mantenho tom calmo e convido perguntas antes de concluir.' WHERE question_id = 151 AND locale = 'pt';

UPDATE question_translations SET text = 'Em aconselhamentos, faço perguntas abertas antes de sugerir caminhos.' WHERE question_id = 152 AND locale = 'pt';
UPDATE question_translations SET text = 'Registro pequenos avanços e revisito na conversa seguinte.' WHERE question_id = 153 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao usar um texto bíblico, explico rapidamente o contexto antes de aplicar.' WHERE question_id = 154 AND locale = 'pt';
UPDATE question_translations SET text = 'Quando alguém progride, dou crédito a Deus e ao esforço da pessoa.' WHERE question_id = 155 AND locale = 'pt';
UPDATE question_translations SET text = 'Equilibro propostas de ação com investigar as causas do problema.' WHERE question_id = 156 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao montar um plano, reservo momento para orar com a pessoa pelo próximo passo.' WHERE question_id = 157 AND locale = 'pt';

UPDATE question_translations SET text = 'Defino um valor ou percentual de oferta e sigo mesmo sem retorno imediato.' WHERE question_id = 158 AND locale = 'pt';
UPDATE question_translations SET text = 'Prefiro contribuir de forma discreta, sem divulgar valores.' WHERE question_id = 159 AND locale = 'pt';
UPDATE question_translations SET text = 'Antes de ajudar financeiramente, avalio impacto de curto e longo prazo.' WHERE question_id = 160 AND locale = 'pt';
UPDATE question_translations SET text = 'Mantenho regularidade nas ofertas independentemente de reconhecimento.' WHERE question_id = 161 AND locale = 'pt';
UPDATE question_translations SET text = 'Converso com a família sobre prioridades financeiras e motivação espiritual.' WHERE question_id = 162 AND locale = 'pt';
UPDATE question_translations SET text = 'Quando incentivo outros a doar, compartilho exemplos sem pressão.' WHERE question_id = 163 AND locale = 'pt';

UPDATE question_translations SET text = 'Distribuo decisões conforme a especialidade de cada membro da equipe.' WHERE question_id = 164 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao perseguir metas, reservo tempo para ouvir necessidades pessoais da equipe.' WHERE question_id = 165 AND locale = 'pt';
UPDATE question_translations SET text = 'Antes de decidir, apresento opções e ouço objeções da equipe.' WHERE question_id = 166 AND locale = 'pt';
UPDATE question_translations SET text = 'Agradeço contribuições citando o que foi feito e por quem.' WHERE question_id = 167 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao delegar tarefas, explico como cada uma se conecta ao objetivo maior.' WHERE question_id = 168 AND locale = 'pt';
UPDATE question_translations SET text = 'Recalibro prazos quando percebo limites de carga ou capacidade da equipe.' WHERE question_id = 169 AND locale = 'pt';

UPDATE question_translations SET text = 'Em decisões difíceis, ouço a pessoa e consulto alguém de confiança antes de agir.' WHERE question_id = 170 AND locale = 'pt';
UPDATE question_translations SET text = 'Em conversas difíceis, digo claramente o que precisa mudar mantendo respeito.' WHERE question_id = 171 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao apoiar alguém, combino escuta com incentivo a passos concretos.' WHERE question_id = 172 AND locale = 'pt';
UPDATE question_translations SET text = 'Quando ofendido, pratico liberar perdão e manter diálogo aberto.' WHERE question_id = 173 AND locale = 'pt';
UPDATE question_translations SET text = 'Avalio o contexto antes de reagir e ajusto meu tom conforme a situação.' WHERE question_id = 174 AND locale = 'pt';
UPDATE question_translations SET text = 'Ao defender terceiros, verifico se estou autorizado e se é meu papel intervir.' WHERE question_id = 175 AND locale = 'pt';

-- EN translations
UPDATE question_translations SET text = 'Before preaching, I set aside specific time to pray for the message.' WHERE question_id = 134 AND locale = 'en';
UPDATE question_translations SET text = 'When preparing a message, I review an outline that blends study and prayer.' WHERE question_id = 135 AND locale = 'en';
UPDATE question_translations SET text = 'When planning, I adapt examples based on different audience profiles.' WHERE question_id = 136 AND locale = 'en';
UPDATE question_translations SET text = 'After speaking publicly, I ask for feedback about what was useful to the group.' WHERE question_id = 137 AND locale = 'en';
UPDATE question_translations SET text = 'When proposing biblical standards, I show practical examples of how this improves relationships.' WHERE question_id = 138 AND locale = 'en';
UPDATE question_translations SET text = 'In debates, I bring concrete situations that show how I apply the principle in different contexts.' WHERE question_id = 139 AND locale = 'en';

UPDATE question_translations SET text = 'Before accepting a request, I confirm time and resources available.' WHERE question_id = 140 AND locale = 'en';
UPDATE question_translations SET text = 'When issues arise, I prioritize, communicate, and adjust timelines with those depending on my service.' WHERE question_id = 141 AND locale = 'en';
UPDATE question_translations SET text = 'While executing tasks, I check with stakeholders if the pace and approach are adequate.' WHERE question_id = 142 AND locale = 'en';
UPDATE question_translations SET text = 'On recurring tasks, I keep delivering even when there is no immediate recognition.' WHERE question_id = 143 AND locale = 'en';
UPDATE question_translations SET text = 'In busy weeks, I ask for or accept help to share tasks.' WHERE question_id = 144 AND locale = 'en';
UPDATE question_translations SET text = 'Before quickly meeting a request, I assess if it is the right time to act.' WHERE question_id = 145 AND locale = 'en';

UPDATE question_translations SET text = 'When teaching, I simplify technical terms and check if the class is following.' WHERE question_id = 146 AND locale = 'en';
UPDATE question_translations SET text = 'Faced with a decision, I use available information and set a clear deadline.' WHERE question_id = 147 AND locale = 'en';
UPDATE question_translations SET text = 'Before class, I adjust examples to the students’ age or context.' WHERE question_id = 148 AND locale = 'en';
UPDATE question_translations SET text = 'I present concepts in short steps with practical examples.' WHERE question_id = 149 AND locale = 'en';
UPDATE question_translations SET text = 'After teaching, I show how to apply the point in a real situation.' WHERE question_id = 150 AND locale = 'en';
UPDATE question_translations SET text = 'In discussions, I keep a calm tone and invite questions before closing.' WHERE question_id = 151 AND locale = 'en';

UPDATE question_translations SET text = 'In counseling, I ask open questions before suggesting paths.' WHERE question_id = 152 AND locale = 'en';
UPDATE question_translations SET text = 'I record small progress points and revisit them in the next conversation.' WHERE question_id = 153 AND locale = 'en';
UPDATE question_translations SET text = 'When using a Bible text, I briefly explain the context before applying it.' WHERE question_id = 154 AND locale = 'en';
UPDATE question_translations SET text = 'When someone progresses, I credit God and the person’s effort.' WHERE question_id = 155 AND locale = 'en';
UPDATE question_translations SET text = 'I balance action steps with looking into the root causes of the issue.' WHERE question_id = 156 AND locale = 'en';
UPDATE question_translations SET text = 'When drafting a plan, I set aside a moment to pray with the person for the next step.' WHERE question_id = 157 AND locale = 'en';

UPDATE question_translations SET text = 'I set a giving amount or percentage and keep it even without immediate return.' WHERE question_id = 158 AND locale = 'en';
UPDATE question_translations SET text = 'I prefer to give discreetly, without disclosing amounts.' WHERE question_id = 159 AND locale = 'en';
UPDATE question_translations SET text = 'Before giving financial help, I assess short- and long-term impact.' WHERE question_id = 160 AND locale = 'en';
UPDATE question_translations SET text = 'I keep offerings regular regardless of recognition.' WHERE question_id = 161 AND locale = 'en';
UPDATE question_translations SET text = 'I talk with my family about financial priorities and the spiritual motive.' WHERE question_id = 162 AND locale = 'en';
UPDATE question_translations SET text = 'When encouraging others to give, I share examples without pressure.' WHERE question_id = 163 AND locale = 'en';

UPDATE question_translations SET text = 'I distribute decisions according to each team member’s specialty.' WHERE question_id = 164 AND locale = 'en';
UPDATE question_translations SET text = 'While pursuing goals, I set aside time to hear the team’s personal needs.' WHERE question_id = 165 AND locale = 'en';
UPDATE question_translations SET text = 'Before deciding, I present options and hear the team’s objections.' WHERE question_id = 166 AND locale = 'en';
UPDATE question_translations SET text = 'I thank contributors by naming what was done and by whom.' WHERE question_id = 167 AND locale = 'en';
UPDATE question_translations SET text = 'When delegating tasks, I explain how each one connects to the bigger objective.' WHERE question_id = 168 AND locale = 'en';
UPDATE question_translations SET text = 'I recalibrate deadlines when I notice limits on workload or capacity.' WHERE question_id = 169 AND locale = 'en';

UPDATE question_translations SET text = 'In difficult decisions, I listen to the person and consult someone trustworthy before acting.' WHERE question_id = 170 AND locale = 'en';
UPDATE question_translations SET text = 'In hard conversations, I clearly state what needs to change while staying respectful.' WHERE question_id = 171 AND locale = 'en';
UPDATE question_translations SET text = 'When supporting someone, I combine listening with encouraging concrete steps.' WHERE question_id = 172 AND locale = 'en';
UPDATE question_translations SET text = 'When offended, I practice extending forgiveness and keeping dialogue open.' WHERE question_id = 173 AND locale = 'en';
UPDATE question_translations SET text = 'I assess the context before reacting and adjust my tone accordingly.' WHERE question_id = 174 AND locale = 'en';
UPDATE question_translations SET text = 'When advocating for others, I check if I am authorized and if it is my role to intervene.' WHERE question_id = 175 AND locale = 'en';

-- ES translations
UPDATE question_translations SET text = 'Antes de predicar, separo tiempo específico para orar por el mensaje.' WHERE question_id = 134 AND locale = 'es';
UPDATE question_translations SET text = 'Al preparar un mensaje, reviso un esquema que combine estudio y oración.' WHERE question_id = 135 AND locale = 'es';
UPDATE question_translations SET text = 'Al planear, adapto ejemplos considerando perfiles distintos de la audiencia.' WHERE question_id = 136 AND locale = 'es';
UPDATE question_translations SET text = 'Después de hablar en público, pido retroalimentación sobre lo que fue útil para el grupo.' WHERE question_id = 137 AND locale = 'es';
UPDATE question_translations SET text = 'Al proponer estándares bíblicos, muestro ejemplos prácticos de cómo mejora las relaciones.' WHERE question_id = 138 AND locale = 'es';
UPDATE question_translations SET text = 'En debates, traigo situaciones concretas que muestran cómo aplico el principio en contextos diferentes.' WHERE question_id = 139 AND locale = 'es';

UPDATE question_translations SET text = 'Antes de aceptar un pedido, confirmo tiempo y recursos disponibles.' WHERE question_id = 140 AND locale = 'es';
UPDATE question_translations SET text = 'Ante imprevistos, priorizo, comunico y ajusto plazos con quienes dependen de mi servicio.' WHERE question_id = 141 AND locale = 'es';
UPDATE question_translations SET text = 'Mientras ejecuto tareas, verifico con los involucrados si el ritmo y el enfoque son adecuados.' WHERE question_id = 142 AND locale = 'es';
UPDATE question_translations SET text = 'En tareas recurrentes, mantengo la entrega incluso sin reconocimiento inmediato.' WHERE question_id = 143 AND locale = 'es';
UPDATE question_translations SET text = 'En semanas llenas, pido o acepto ayuda para repartir tareas.' WHERE question_id = 144 AND locale = 'es';
UPDATE question_translations SET text = 'Antes de suplir rápidamente una demanda, evalúo si es el momento correcto para actuar.' WHERE question_id = 145 AND locale = 'es';

UPDATE question_translations SET text = 'Al enseñar, simplifico términos técnicos y verifico si la clase siguió.' WHERE question_id = 146 AND locale = 'es';
UPDATE question_translations SET text = 'Frente a una decisión, uso la información disponible y establezco un plazo claro.' WHERE question_id = 147 AND locale = 'es';
UPDATE question_translations SET text = 'Antes de la clase, ajusto ejemplos según la edad o contexto de los alumnos.' WHERE question_id = 148 AND locale = 'es';
UPDATE question_translations SET text = 'Presento conceptos en pasos cortos con ejemplos prácticos.' WHERE question_id = 149 AND locale = 'es';
UPDATE question_translations SET text = 'Después de enseñar, muestro cómo aplicar el punto en una situación real.' WHERE question_id = 150 AND locale = 'es';
UPDATE question_translations SET text = 'En discusiones, mantengo un tono calmado e invito preguntas antes de cerrar.' WHERE question_id = 151 AND locale = 'es';

UPDATE question_translations SET text = 'En consejería, hago preguntas abiertas antes de sugerir caminos.' WHERE question_id = 152 AND locale = 'es';
UPDATE question_translations SET text = 'Registro pequeños avances y los reviso en la siguiente conversación.' WHERE question_id = 153 AND locale = 'es';
UPDATE question_translations SET text = 'Al usar un texto bíblico, explico brevemente el contexto antes de aplicarlo.' WHERE question_id = 154 AND locale = 'es';
UPDATE question_translations SET text = 'Cuando alguien progresa, doy crédito a Dios y al esfuerzo de la persona.' WHERE question_id = 155 AND locale = 'es';
UPDATE question_translations SET text = 'Equilibro propuestas de acción con investigar las causas del problema.' WHERE question_id = 156 AND locale = 'es';
UPDATE question_translations SET text = 'Al armar un plan, reservo un momento para orar con la persona por el siguiente paso.' WHERE question_id = 157 AND locale = 'es';

UPDATE question_translations SET text = 'Defino un monto o porcentaje de ofrenda y lo mantengo aunque no haya retorno inmediato.' WHERE question_id = 158 AND locale = 'es';
UPDATE question_translations SET text = 'Prefiero contribuir de forma discreta, sin divulgar montos.' WHERE question_id = 159 AND locale = 'es';
UPDATE question_translations SET text = 'Antes de ayudar financieramente, evalúo el impacto a corto y largo plazo.' WHERE question_id = 160 AND locale = 'es';
UPDATE question_translations SET text = 'Mantengo regularidad en las ofrendas independientemente del reconocimiento.' WHERE question_id = 161 AND locale = 'es';
UPDATE question_translations SET text = 'Hablo con la familia sobre prioridades financieras y motivación espiritual.' WHERE question_id = 162 AND locale = 'es';
UPDATE question_translations SET text = 'Al motivar a otros a dar, comparto ejemplos sin presión.' WHERE question_id = 163 AND locale = 'es';

UPDATE question_translations SET text = 'Distribuyo decisiones según la especialidad de cada miembro del equipo.' WHERE question_id = 164 AND locale = 'es';
UPDATE question_translations SET text = 'Al perseguir metas, reservo tiempo para oír las necesidades personales del equipo.' WHERE question_id = 165 AND locale = 'es';
UPDATE question_translations SET text = 'Antes de decidir, presento opciones y escucho las objeciones del equipo.' WHERE question_id = 166 AND locale = 'es';
UPDATE question_translations SET text = 'Agradezco las contribuciones mencionando qué se hizo y por quién.' WHERE question_id = 167 AND locale = 'es';
UPDATE question_translations SET text = 'Al delegar tareas, explico cómo cada una se conecta con el objetivo mayor.' WHERE question_id = 168 AND locale = 'es';
UPDATE question_translations SET text = 'Recalibro plazos cuando percibo límites de carga o capacidad del equipo.' WHERE question_id = 169 AND locale = 'es';

UPDATE question_translations SET text = 'En decisiones difíciles, escucho a la persona y consulto a alguien de confianza antes de actuar.' WHERE question_id = 170 AND locale = 'es';
UPDATE question_translations SET text = 'En conversaciones difíciles, digo claramente lo que debe cambiar manteniendo el respeto.' WHERE question_id = 171 AND locale = 'es';
UPDATE question_translations SET text = 'Al apoyar a alguien, combino escucha con aliento a pasos concretos.' WHERE question_id = 172 AND locale = 'es';
UPDATE question_translations SET text = 'Cuando me ofenden, practico extender perdón y mantener el diálogo abierto.' WHERE question_id = 173 AND locale = 'es';
UPDATE question_translations SET text = 'Evalúo el contexto antes de reaccionar y ajusto mi tono según la situación.' WHERE question_id = 174 AND locale = 'es';
UPDATE question_translations SET text = 'Al defender a terceros, verifico si estoy autorizado y si es mi papel intervenir.' WHERE question_id = 175 AND locale = 'es';

COMMIT;
