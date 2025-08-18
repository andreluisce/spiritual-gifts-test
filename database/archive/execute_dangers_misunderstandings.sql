-- ============= DANGERS =============
INSERT INTO public.dangers(gift_key, locale, danger, order_sequence) VALUES
  ('A_PROPHECY','pt','Orgulho espiritual e senso de superioridade',1),
  ('A_PROPHECY','pt','Tendência ao julgamento severo dos outros',2),
  ('A_PROPHECY','pt','Impaciência com o processo de crescimento das pessoas',3),
  ('A_PROPHECY','pt','Falta de tato ao comunicar verdades difíceis',4),
  ('A_PROPHECY','pt','Confundir opinião pessoal com revelação divina',5),

  ('B_SERVICE','pt','Esgotamento físico e emocional por servir demais',1),
  ('B_SERVICE','pt','Ressentimento quando o serviço não é reconhecido',2),
  ('B_SERVICE','pt','Tendência a negligenciar necessidades pessoais e familiares',3),
  ('B_SERVICE','pt','Critícismo excessivo de métodos dos outros',4),
  ('B_SERVICE','pt','Dificuldade para delegar e trabalhar em equipe',5),

  ('C_TEACHING','pt','Orgulho intelectual e arrogância acadêmica',1),
  ('C_TEACHING','pt','Frieza emocional e falta de aplicação pessoal',2),
  ('C_TEACHING','pt','Tendência ao perfeccionismo excessivo',3),
  ('C_TEACHING','pt','Impaciência com perguntas repetitivas',4),
  ('C_TEACHING','pt','Foco em teoria sem aplicação prática',5),

  ('D_EXHORTATION','pt','Superficialidade ao lidar com problemas profundos',1),
  ('D_EXHORTATION','pt','Impaciência com pessoas em depressão',2),
  ('D_EXHORTATION','pt','Tendência a dar conselhos não solicitados',3),
  ('D_EXHORTATION','pt','Falta de empatia com o sofrimento alheio',4),
  ('D_EXHORTATION','pt','Pressão excessiva por resultados rápidos',5),

  ('E_GIVING','pt','Controle excessivo sobre como os recursos são usados',1),
  ('E_GIVING','pt','Orgulho pelo status financeiro e capacidade de dar',2),
  ('E_GIVING','pt','Julgamento de outros pela capacidade de contribuir',3),
  ('E_GIVING','pt','Negligenciar relacionamentos em favor de projetos',4),
  ('E_GIVING','pt','Tentação de comprar influência através das doações',5),

  ('F_LEADERSHIP','pt','Autoritarismo e dificuldade para aceitar opiniões',1),
  ('F_LEADERSHIP','pt','Impaciência com processos democráticos',2),
  ('F_LEADERSHIP','pt','Tendência a manipular pessoas para atingir objetivos',3),
  ('F_LEADERSHIP','pt','Orgulho pelos sucessos e realizações',4),
  ('F_LEADERSHIP','pt','Negligenciar necessidades pessoais da equipe',5),

  ('G_MERCY','pt','Permitir que outros se aproveitem de sua bondade',1),
  ('G_MERCY','pt','Evitar confrontos necessários por medo de ferir',2),
  ('G_MERCY','pt','Depressão por absorver demais as dores dos outros',3),
  ('G_MERCY','pt','Julgamento de outros por falta de compaixão',4),
  ('G_MERCY','pt','Negligenciar justiça em favor da misericórdia',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- ============= MISUNDERSTANDINGS =============
INSERT INTO public.misunderstandings(gift_key, locale, misunderstanding, order_sequence) VALUES
  ('A_PROPHECY','pt','Acreditar que sempre tem uma palavra direta de Deus',1),
  ('A_PROPHECY','pt','Confundir crítica com ministério profético',2),
  ('A_PROPHECY','pt','Pensar que deve corrigir todos os erros que vê',3),
  ('A_PROPHECY','pt','Assumir que outros devem aceitar suas palavras imediatamente',4),
  ('A_PROPHECY','pt','Negligenciar o amor ao exercer o dom',5),

  ('B_SERVICE','pt','Acreditar que servir é sempre fazer tarefas práticas',1),
  ('B_SERVICE','pt','Pensar que deve aceitar todos os pedidos de ajuda',2),
  ('B_SERVICE','pt','Assumir que outros não querem ajudar como deveriam',3),
  ('B_SERVICE','pt','Sentir que reconhecimento diminui o valor do serviço',4),
  ('B_SERVICE','pt','Negligenciar o próprio crescimento espiritual',5),

  ('C_TEACHING','pt','Acreditar que conhecimento sempre leva à maturidade',1),
  ('C_TEACHING','pt','Pensar que ensinar é apenas transmitir informações',2),
  ('C_TEACHING','pt','Assumir que todos aprendem da mesma forma',3),
  ('C_TEACHING','pt','Sentir que questionamentos são falta de respeito',4),
  ('C_TEACHING','pt','Negligenciar a aplicação emocional e relacional',5),

  ('D_EXHORTATION','pt','Acreditar que toda situação pode ser rapidamente resolvida',1),
  ('D_EXHORTATION','pt','Pensar que otimismo é sempre a resposta certa',2),
  ('D_EXHORTATION','pt','Assumir que outros são preguiçosos se não progridem',3),
  ('D_EXHORTATION','pt','Sentir que deve ter solução para todos os problemas',4),
  ('D_EXHORTATION','pt','Negligenciar a necessidade de simplesmente ouvir',5),

  ('E_GIVING','pt','Acreditar que doar dinheiro resolve todos os problemas',1),
  ('E_GIVING','pt','Pensar que quantidade de doação mede espiritualidade',2),
  ('E_GIVING','pt','Assumir que deve controlar como suas doações são usadas',3),
  ('E_GIVING','pt','Sentir que outros são egoístas por darem menos',4),
  ('E_GIVING','pt','Negligenciar outras formas importantes de contribuição',5),

  ('F_LEADERSHIP','pt','Acreditar que deve liderar em todas as situações',1),
  ('F_LEADERSHIP','pt','Pensar que liderança é sempre tomar decisões sozinho',2),
  ('F_LEADERSHIP','pt','Assumir que outros são incompetentes se não executam bem',3),
  ('F_LEADERSHIP','pt','Sentir que questionar sua liderança é rebeldia',4),
  ('F_LEADERSHIP','pt','Negligenciar desenvolvimento espiritual próprio',5),

  ('G_MERCY','pt','Acreditar que deve ajudar a todos sem exceção',1),
  ('G_MERCY','pt','Pensar que confrontar pessoas é sempre errado',2),
  ('G_MERCY','pt','Assumir que outros são duros demais se não demonstram compaixão',3),
  ('G_MERCY','pt','Sentir que deve resolver todos os sofrimentos que vê',4),
  ('G_MERCY','pt','Negligenciar a necessidade de limites saudáveis',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;