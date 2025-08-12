-- Backup completo dos dados de Dons Espirituais
-- Inclui: qualities, characteristics, dangers, misunderstandings

-- ============= QUALITIES =============
INSERT INTO public.qualities(gift_key, locale, quality_name, description, order_sequence) VALUES
  ('A_PROPHECY','pt','Fidelidade às Escrituras','Compromisso inabalável com a verdade bíblica',1),
  ('A_PROPHECY','pt','Coragem Moral','Disposição para falar a verdade mesmo diante da oposição',2),
  ('A_PROPHECY','pt','Discernimento Espiritual','Capacidade de distinguir entre verdade e erro',3),
  ('A_PROPHECY','pt','Integridade Pessoal','Vida consistente com a mensagem proclamada',4),
  ('A_PROPHECY','pt','Dependência de Deus','Buscar orientação divina antes de falar',5),

  ('B_SERVICE','pt','Disponibilidade','Estar sempre pronto para ajudar quando necessário',1),
  ('B_SERVICE','pt','Humildade','Servir sem buscar reconhecimento ou destaque',2),
  ('B_SERVICE','pt','Praticidade','Focar em soluções concretas e realizáveis',3),
  ('B_SERVICE','pt','Perseverança','Não desistir diante das dificuldades do serviço',4),
  ('B_SERVICE','pt','Amor ao Próximo','Servir motivado pelo genuíno cuidado pelas pessoas',5),

  ('C_TEACHING','pt','Clareza na Comunicação','Explicar conceitos de forma compreensível',1),
  ('C_TEACHING','pt','Paciência Pedagógica','Dar tempo para o aprendizado acontecer',2),
  ('C_TEACHING','pt','Preparo Constante','Estudar e se preparar antes de ensinar',3),
  ('C_TEACHING','pt','Adaptabilidade','Ajustar métodos às necessidades dos alunos',4),
  ('C_TEACHING','pt','Paixão pelo Conhecimento','Amor genuíno por aprender e compartilhar',5),

  ('D_EXHORTATION','pt','Otimismo Realista','Ver possibilidades mesmo em situações difíceis',1),
  ('D_EXHORTATION','pt','Empatia Genuína','Compreender profundamente as lutas dos outros',2),
  ('D_EXHORTATION','pt','Sabedoria Prática','Oferecer conselhos aplicáveis e úteis',3),
  ('D_EXHORTATION','pt','Perseverança Encorajadora','Não desistir das pessoas facilmente',4),
  ('D_EXHORTATION','pt','Esperança Contagiante','Transmitir confiança no poder transformador de Deus',5),

  ('E_GIVING','pt','Generosidade Alegre','Dar com prazer e satisfação genuína',1),
  ('E_GIVING','pt','Sabedoria Financeira','Administrar recursos com prudência',2),
  ('E_GIVING','pt','Discrição','Contribuir sem buscar publicidade ou reconhecimento',3),
  ('E_GIVING','pt','Visão do Reino','Investir em causas que expandem o Reino de Deus',4),
  ('E_GIVING','pt','Confiança em Deus','Crer na provisão divina ao ser generoso',5),

  ('F_LEADERSHIP','pt','Visão Clara','Definir objetivos e direção com precisão',1),
  ('F_LEADERSHIP','pt','Comunicação Eficaz','Transmitir ideias de forma inspiradora',2),
  ('F_LEADERSHIP','pt','Delegação Sábia','Confiar tarefas às pessoas certas',3),
  ('F_LEADERSHIP','pt','Exemplo Pessoal','Liderar primeiro através do próprio comportamento',4),
  ('F_LEADERSHIP','pt','Desenvolvimento de Pessoas','Investir no crescimento da equipe',5),

  ('G_MERCY','pt','Compaixão Profunda','Sentir genuinamente a dor dos outros',1),
  ('G_MERCY','pt','Paciência Infinita','Não se cansar de ajudar quem sofre',2),
  ('G_MERCY','pt','Sensibilidade Espiritual','Discernir as necessidades emocionais das pessoas',3),
  ('G_MERCY','pt','Perdão Constante','Estender graça mesmo quando ferido',4),
  ('G_MERCY','pt','Amor Incondicional','Amar independente das circunstâncias',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- ============= CHARACTERISTICS =============
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('A_PROPHECY','pt','Sente necessidade de expressar sua mensagem, verbalmente',1),
  ('A_PROPHECY','pt','Tem capacidade de discernir os motivos e o caráter dos outros',2),
  ('A_PROPHECY','pt','Tem capacidade de identificar, definir e odiar o mal',3),
  ('A_PROPHECY','pt','Está sempre pronto a experimentar quebrantamento para produzi-lo em outros',4),
  ('A_PROPHECY','pt','Depende das escrituras para validar sua autoridade',5),

  ('B_SERVICE','pt','Tem capacidade de lembrar do que os outros gostam ou não',1),
  ('B_SERVICE','pt','Está sempre atento às necessidades práticas',2),
  ('B_SERVICE','pt','Impulsionado a suprir as necessidades o mais breve possível',3),
  ('B_SERVICE','pt','É de resistência física suficiente para suprir estas necessidades sem pensar no cansaço',4),
  ('B_SERVICE','pt','Está disposto a usar recursos próprios para evitar demora',5),

  ('C_TEACHING','pt','Fala com clareza na apresentação da verdade',1),
  ('C_TEACHING','pt','Tem capacidade de validar a verdade através de pesquisa',2),
  ('C_TEACHING','pt','Apresenta a verdade numa sequência sistemática',3),
  ('C_TEACHING','pt','Constrói a verdade sobre uma estrutura de conhecimento',4),
  ('C_TEACHING','pt','Sente-se responsável por produzir informações precisas',5),

  ('D_EXHORTATION','pt','Tem capacidade de ver recursos não utilizados numa pessoa',1),
  ('D_EXHORTATION','pt','Tem capacidade de ver como os problemas contribuem para a maturidade',2),
  ('D_EXHORTATION','pt','Está ansioso por dar passos prescritos de ação para vencer',3),
  ('D_EXHORTATION','pt','Tem capacidade de visualizar o produto final da recomendação',4),
  ('D_EXHORTATION','pt','Espera uma resposta imediata para suas recomendações',5),

  ('E_GIVING','pt','Tem capacidade especial de fazer dinheiro',1),
  ('E_GIVING','pt','Dá com generosidade, mas mantém controle sobre como o presente é usado',2),
  ('E_GIVING','pt','Trabalha com um orçamento e mantém os gastos dentro dos seus limites',3),
  ('E_GIVING','pt','É motivado quando sabe que sua contribuição produzirá mais recursos',4),
  ('E_GIVING','pt','Quer que sua contribuição seja um investimento de qualidade',5),

  ('F_LEADERSHIP','pt','Tem capacidade de ver o quadro geral',1),
  ('F_LEADERSHIP','pt','Tem capacidade de dividir objetivos em tarefas controláveis',2),
  ('F_LEADERSHIP','pt','Está disposto a suportar reações negativas quando tomando decisões para o bem da organização',3),
  ('F_LEADERSHIP','pt','Tem capacidade especial de saber o que pode ou não pode ser feito',4),
  ('F_LEADERSHIP','pt','Tem uma necessidade especial de ver que os outros estão sendo produtivos',5),

  ('G_MERCY','pt','Tem capacidade de sentir a alegria ou angústia dos outros',1),
  ('G_MERCY','pt','Está atraído às pessoas que estão em aflição mental ou emocional',2),
  ('G_MERCY','pt','Tem capacidade de discernir sinceridade ou falta de sinceridade nos outros',3),
  ('G_MERCY','pt','Tem capacidade de evitar palavras que agravarão uma pessoa ferida',4),
  ('G_MERCY','pt','É atraído por pessoas de diferentes formações raciais, culturais e educacionais',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

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