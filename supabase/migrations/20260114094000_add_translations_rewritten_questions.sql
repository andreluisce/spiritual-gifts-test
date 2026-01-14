-- Add PT/EN/ES translations for rewritten questions (IDs 134-175)
-- Ensures i18n coverage and neutral wording without reverse scoring

BEGIN;

INSERT INTO question_translations (question_id, locale, text, created_at, updated_at)
VALUES
  (134, 'pt', 'Quando prego, dependo do Espírito Santo em vez de confiar apenas em minha eloquência.', now(), now()),
  (134, 'en', 'When I preach, I rely on the Holy Spirit rather than just my eloquence.', now(), now()),
  (134, 'es', 'Cuando predico, dependo del Espíritu Santo en lugar de mi elocuencia.', now(), now()),

  (135, 'pt', 'Equilibro preparação cuidadosa com oração humilde antes de ministrar a Palavra.', now(), now()),
  (135, 'en', 'I balance careful preparation with humble prayer before preaching the Word.', now(), now()),
  (135, 'es', 'Equilibro la preparación cuidadosa con la oración humilde antes de ministrar la Palabra.', now(), now()),

  (136, 'pt', 'Vejo cada pessoa como indivíduo com necessidades específicas, não apenas como plateia.', now(), now()),
  (136, 'en', 'I see each person as an individual with specific needs, not just as an audience.', now(), now()),
  (136, 'es', 'Veo a cada persona como un individuo con necesidades específicas, no solo como audiencia.', now(), now()),

  (137, 'pt', 'Busco falar em público para edificar o corpo de Cristo, não para ser reconhecido.', now(), now()),
  (137, 'en', 'I speak in public to build up the body of Christ, not to be recognized.', now(), now()),
  (137, 'es', 'Hablo en público para edificar al cuerpo de Cristo, no para ser reconocido.', now(), now()),

  (138, 'pt', 'Ao estabelecer padrões bíblicos, busco sensibilidade para fortalecer relacionamentos.', now(), now()),
  (138, 'en', 'When setting biblical standards, I seek sensitivity to strengthen relationships.', now(), now()),
  (138, 'es', 'Al establecer estándares bíblicos, busco sensibilidad para fortalecer las relaciones.', now(), now()),

  (139, 'pt', 'Reconheço nuances legítimas enquanto mantenho firmeza em princípios essenciais.', now(), now()),
  (139, 'en', 'I acknowledge legitimate nuances while holding firm to essential principles.', now(), now()),
  (139, 'es', 'Reconozco matices legítimos mientras mantengo firmeza en los principios esenciales.', now(), now()),

  (140, 'pt', 'Comunico limites claros e assumo apenas o que posso cumprir com excelência.', now(), now()),
  (140, 'en', 'I communicate clear boundaries and take on only what I can do with excellence.', now(), now()),
  (140, 'es', 'Comunico límites claros y asumo solo lo que puedo cumplir con excelencia.', now(), now()),

  (141, 'pt', 'Mantenho serenidade quando surgem imprevistos que afetam meu serviço.', now(), now()),
  (141, 'en', 'I stay calm when unexpected issues affect my service.', now(), now()),
  (141, 'es', 'Mantengo la serenidad cuando surgen imprevistos que afectan mi servicio.', now(), now()),

  (142, 'pt', 'Equilibro a execução de tarefas com atenção aos sentimentos das pessoas.', now(), now()),
  (142, 'en', 'I balance getting tasks done with attentiveness to people''s feelings.', now(), now()),
  (142, 'es', 'Equilibro la ejecución de tareas con atención a los sentimientos de las personas.', now(), now()),

  (143, 'pt', 'Sirvo com motivação genuína, sem expectativa de reconhecimento ou agradecimento.', now(), now()),
  (143, 'en', 'I serve with genuine motivation, without expecting recognition or thanks.', now(), now()),
  (143, 'es', 'Sirvo con motivación genuina, sin esperar reconocimiento ni agradecimiento.', now(), now()),

  (144, 'pt', 'Permito que outros me sirvam também, reconhecendo a importância da reciprocidade.', now(), now()),
  (144, 'en', 'I let others serve me too, recognizing the value of reciprocity.', now(), now()),
  (144, 'es', 'Permito que otros me sirvan también, reconociendo el valor de la reciprocidad.', now(), now()),

  (145, 'pt', 'Avalio o timing de Deus antes de suprir uma necessidade rapidamente.', now(), now()),
  (145, 'en', 'I discern God''s timing before rushing to meet a need.', now(), now()),
  (145, 'es', 'Evalúo el tiempo de Dios antes de suplir rápidamente una necesidad.', now(), now()),

  (146, 'pt', 'Compartilho conhecimento com humildade, valorizando igualmente quem está aprendendo.', now(), now()),
  (146, 'en', 'I share knowledge with humility, valuing equally those who are learning.', now(), now()),
  (146, 'es', 'Comparto conocimiento con humildad, valorando por igual a quienes están aprendiendo.', now(), now()),

  (147, 'pt', 'Tomo decisões oportunas baseando-me nas informações disponíveis e em sabedoria.', now(), now()),
  (147, 'en', 'I make timely decisions based on available information and wisdom.', now(), now()),
  (147, 'es', 'Tomo decisiones oportunas basadas en la información disponible y la sabiduría.', now(), now()),

  (148, 'pt', 'Adapto meu ensino considerando as necessidades e o contexto dos alunos.', now(), now()),
  (148, 'en', 'I adapt my teaching to the students'' needs and context.', now(), now()),
  (148, 'es', 'Adapto mi enseñanza según las necesidades y el contexto de los alumnos.', now(), now()),

  (149, 'pt', 'Comunico verdades profundas de forma acessível e envolvente.', now(), now()),
  (149, 'en', 'I communicate deep truths in an accessible and engaging way.', now(), now()),
  (149, 'es', 'Comunico verdades profundas de forma accesible y atractiva.', now(), now()),

  (150, 'pt', 'Uno precisão teológica com aplicação prática e calorosa.', now(), now()),
  (150, 'en', 'I combine theological precision with practical, warm application.', now(), now()),
  (150, 'es', 'Uno la precisión teológica con una aplicación práctica y cálida.', now(), now()),

  (151, 'pt', 'Ao defender a verdade, mantenho humildade e gentileza no diálogo.', now(), now()),
  (151, 'en', 'When defending truth, I remain humble and gentle in dialogue.', now(), now()),
  (151, 'es', 'Al defender la verdad, me mantengo humilde y gentil en el diálogo.', now(), now()),

  (152, 'pt', 'Faço perguntas que ajudam a pessoa a pensar e decidir por si mesma.', now(), now()),
  (152, 'en', 'I ask questions that help the person think and decide for themselves.', now(), now()),
  (152, 'es', 'Hago preguntas que ayudan a la persona a pensar y decidir por sí misma.', now(), now()),

  (153, 'pt', 'Mantenho paciência com o ritmo de mudança de cada pessoa, celebrando pequenos avanços.', now(), now()),
  (153, 'en', 'I stay patient with each person''s pace of change, celebrating small steps.', now(), now()),
  (153, 'es', 'Mantengo paciencia con el ritmo de cambio de cada persona, celebrando pequeños avances.', now(), now()),

  (154, 'pt', 'Uso textos bíblicos em seu contexto adequado, respeitando a integridade da Escritura.', now(), now()),
  (154, 'en', 'I use biblical texts in their proper context, respecting Scripture''s integrity.', now(), now()),
  (154, 'es', 'Uso textos bíblicos en su contexto adecuado, respetando la integridad de la Escritura.', now(), now()),

  (155, 'pt', 'Celebro o progresso do aconselhando dando glória a Deus, não buscando mérito próprio.', now(), now()),
  (155, 'en', 'I celebrate counselees'' progress giving glory to God, not seeking credit.', now(), now()),
  (155, 'es', 'Celebro el progreso del aconsejado dando gloria a Dios, sin buscar mérito propio.', now(), now()),

  (156, 'pt', 'Equilibro ênfase em ação prática com exploração cuidadosa das raízes do problema.', now(), now()),
  (156, 'en', 'I balance emphasis on practical action with careful exploration of root issues.', now(), now()),
  (156, 'es', 'Equilibro el énfasis en la acción práctica con la exploración cuidadosa de las raíces del problema.', now(), now()),

  (157, 'pt', 'Ao estruturar planos, reconheço explicitamente a dependência do Espírito Santo.', now(), now()),
  (157, 'en', 'When structuring plans, I explicitly acknowledge dependence on the Holy Spirit.', now(), now()),
  (157, 'es', 'Al estructurar planes, reconozco explícitamente la dependencia del Espíritu Santo.', now(), now()),

  (158, 'pt', 'Contribuo generosamente sem usar isso para influenciar decisões ministeriais.', now(), now()),
  (158, 'en', 'I give generously without using it to influence ministry decisions.', now(), now()),
  (158, 'es', 'Contribuyo generosamente sin usarlo para influir en decisiones ministeriales.', now(), now()),

  (159, 'pt', 'Mantenho minhas ofertas em privacidade, evitando revelar valores para impressionar.', now(), now()),
  (159, 'en', 'I keep my giving private, avoiding revealing amounts to impress others.', now(), now()),
  (159, 'es', 'Mantengo mis ofrendas en privado, evitando revelar valores para impresionar.', now(), now()),

  (160, 'pt', 'Avalio cuidadosamente se minha ajuda imediata realmente beneficia a pessoa a longo prazo.', now(), now()),
  (160, 'en', 'I carefully assess whether immediate help truly benefits the person long term.', now(), now()),
  (160, 'es', 'Evalúo cuidadosamente si la ayuda inmediata realmente beneficia a la persona a largo plazo.', now(), now()),

  (161, 'pt', 'Dou com alegria, independentemente de reconhecimento ou gratidão.', now(), now()),
  (161, 'en', 'I give with joy, regardless of recognition or gratitude.', now(), now()),
  (161, 'es', 'Doy con alegría, independientemente del reconocimiento o la gratitud.', now(), now()),

  (162, 'pt', 'Comunico à família minha motivação espiritual para um estilo de vida simples.', now(), now()),
  (162, 'en', 'I explain to my family my spiritual motive for a simple lifestyle.', now(), now()),
  (162, 'es', 'Comunico a mi familia mi motivación espiritual para un estilo de vida sencillo.', now(), now()),

  (163, 'pt', 'Inspiro generosidade pelo exemplo, sem criar pressão ou constrangimento.', now(), now()),
  (163, 'en', 'I inspire generosity by example, without creating pressure or coercion.', now(), now()),
  (163, 'es', 'Inspiro generosidad con el ejemplo, sin generar presión ni coacción.', now(), now()),

  (164, 'pt', 'Delego decisões importantes confiando nas capacidades da equipe.', now(), now()),
  (164, 'en', 'I delegate important decisions, trusting the team''s abilities.', now(), now()),
  (164, 'es', 'Delego decisiones importantes, confiando en las capacidades del equipo.', now(), now()),

  (165, 'pt', 'Equilibro o cumprimento de metas com atenção às necessidades pessoais da equipe.', now(), now()),
  (165, 'en', 'I balance hitting goals with attending to the team''s personal needs.', now(), now()),
  (165, 'es', 'Equilibro el cumplimiento de metas con la atención a las necesidades personales del equipo.', now(), now()),

  (166, 'pt', 'Busco persuadir e servir a equipe em vez de impor minhas preferências unilateralmente.', now(), now()),
  (166, 'en', 'I seek to persuade and serve the team instead of imposing my preferences.', now(), now()),
  (166, 'es', 'Busco persuadir y servir al equipo en lugar de imponer mis preferencias.', now(), now()),

  (167, 'pt', 'Valorizo e agradeço colaboradores de forma consistente e específica.', now(), now()),
  (167, 'en', 'I consistently and specifically value and thank contributors.', now(), now()),
  (167, 'es', 'Valoro y agradezco a los colaboradores de forma consistente y específica.', now(), now()),

  (168, 'pt', 'Comunico claramente minha contribuição estratégica quando delego tarefas operacionais.', now(), now()),
  (168, 'en', 'I clearly communicate my strategic contribution when delegating operational tasks.', now(), now()),
  (168, 'es', 'Comunico claramente mi contribución estratégica al delegar tareas operativas.', now(), now()),

  (169, 'pt', 'Ajusto o ritmo dos objetivos considerando os limites e capacidades reais da equipe.', now(), now()),
  (169, 'en', 'I adjust the pace of objectives considering the team''s real limits and capacities.', now(), now()),
  (169, 'es', 'Ajusto el ritmo de los objetivos considerando los límites y capacidades reales del equipo.', now(), now()),

  (170, 'pt', 'Equilibro compaixão com sabedoria ao tomar decisões importantes.', now(), now()),
  (170, 'en', 'I balance compassion with wisdom when making important decisions.', now(), now()),
  (170, 'es', 'Equilibro la compasión con la sabiduría al tomar decisiones importantes.', now(), now()),

  (171, 'pt', 'Confronto com amor quando é necessário, mesmo sabendo que pode causar desconforto inicial.', now(), now()),
  (171, 'en', 'I confront with love when needed, even if it brings initial discomfort.', now(), now()),
  (171, 'es', 'Confronto con amor cuando es necesario, aunque cause incomodidad inicial.', now(), now()),

  (172, 'pt', 'Empatizo com pessoas em dificuldade, mas encorajo mudanças necessárias para a cura.', now(), now()),
  (172, 'en', 'I empathize with people in difficulty while encouraging the changes needed for healing.', now(), now()),
  (172, 'es', 'Empatizo con personas en dificultad mientras las animo a cambios necesarios para la sanidad.', now(), now()),

  (173, 'pt', 'Libero perdão e mantenho abertura relacional mesmo quando outros agem com insensibilidade.', now(), now()),
  (173, 'en', 'I extend forgiveness and keep relational openness even when others act insensitively.', now(), now()),
  (173, 'es', 'Extiendo perdón y mantengo apertura relacional incluso cuando otros actúan con insensibilidad.', now(), now()),

  (174, 'pt', 'Expresso sensibilidade apropriada ao contexto, equilibrando emoção com discernimento.', now(), now()),
  (174, 'en', 'I express appropriate sensitivity to the context, balancing emotion with discernment.', now(), now()),
  (174, 'es', 'Expreso sensibilidad adecuada al contexto, equilibrando emoción con discernimiento.', now(), now()),

  (175, 'pt', 'Defendo terceiros de forma sábia, respeitando os limites de responsabilidade de cada um.', now(), now()),
  (175, 'en', 'I advocate for others wisely, respecting each person''s responsibility boundaries.', now(), now()),
  (175, 'es', 'Defiendo a terceros con sabiduría, respetando los límites de responsabilidad de cada uno.', now(), now());

COMMIT;
