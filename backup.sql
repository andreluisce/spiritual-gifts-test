-- Backup completo dos dados de Dons Espirituais
-- Inclui: qualities, characteristics, dangers, misunderstandings

-- ============= QUALITIES =============
INSERT INTO public.qualities(gift_key, locale, quality_name, description, order_sequence) VALUES
  ('A_PROPHECY','pt','Fidelidade �s Escrituras','Compromisso inabal�vel com a verdade b�blica',1),
  ('A_PROPHECY','pt','Coragem Moral','Disposi��o para falar a verdade mesmo diante da oposi��o',2),
  ('A_PROPHECY','pt','Discernimento Espiritual','Capacidade de distinguir entre verdade e erro',3),
  ('A_PROPHECY','pt','Integridade Pessoal','Vida consistente com a mensagem proclamada',4),
  ('A_PROPHECY','pt','Depend�ncia de Deus','Buscar orienta��o divina antes de falar',5),

  ('B_SERVICE','pt','Disponibilidade','Estar sempre pronto para ajudar quando necess�rio',1),
  ('B_SERVICE','pt','Humildade','Servir sem buscar reconhecimento ou destaque',2),
  ('B_SERVICE','pt','Praticidade','Focar em solu��es concretas e realiz�veis',3),
  ('B_SERVICE','pt','Perseveran�a','N�o desistir diante das dificuldades do servi�o',4),
  ('B_SERVICE','pt','Amor ao Pr�ximo','Servir motivado pelo genu�no cuidado pelas pessoas',5),

  ('C_TEACHING','pt','Clareza na Comunica��o','Explicar conceitos de forma compreens�vel',1),
  ('C_TEACHING','pt','Paci�ncia Pedag�gica','Dar tempo para o aprendizado acontecer',2),
  ('C_TEACHING','pt','Preparo Constante','Estudar e se preparar antes de ensinar',3),
  ('C_TEACHING','pt','Adaptabilidade','Ajustar m�todos �s necessidades dos alunos',4),
  ('C_TEACHING','pt','Paix�o pelo Conhecimento','Amor genu�no por aprender e compartilhar',5),

  ('D_EXHORTATION','pt','Otimismo Realista','Ver possibilidades mesmo em situa��es dif�ceis',1),
  ('D_EXHORTATION','pt','Empatia Genu�na','Compreender profundamente as lutas dos outros',2),
  ('D_EXHORTATION','pt','Sabedoria Pr�tica','Oferecer conselhos aplic�veis e �teis',3),
  ('D_EXHORTATION','pt','Perseveran�a Encorajadora','N�o desistir das pessoas facilmente',4),
  ('D_EXHORTATION','pt','Esperan�a Contagiante','Transmitir confian�a no poder transformador de Deus',5),

  ('E_GIVING','pt','Generosidade Alegre','Dar com prazer e satisfa��o genu�na',1),
  ('E_GIVING','pt','Sabedoria Financeira','Administrar recursos com prud�ncia',2),
  ('E_GIVING','pt','Discri��o','Contribuir sem buscar publicidade ou reconhecimento',3),
  ('E_GIVING','pt','Vis�o do Reino','Investir em causas que expandem o Reino de Deus',4),
  ('E_GIVING','pt','Confian�a em Deus','Crer na provis�o divina ao ser generoso',5),

  ('F_LEADERSHIP','pt','Vis�o Clara','Definir objetivos e dire��o com precis�o',1),
  ('F_LEADERSHIP','pt','Comunica��o Eficaz','Transmitir ideias de forma inspiradora',2),
  ('F_LEADERSHIP','pt','Delega��o S�bia','Confiar tarefas �s pessoas certas',3),
  ('F_LEADERSHIP','pt','Exemplo Pessoal','Liderar primeiro atrav�s do pr�prio comportamento',4),
  ('F_LEADERSHIP','pt','Desenvolvimento de Pessoas','Investir no crescimento da equipe',5),

  ('G_MERCY','pt','Compaix�o Profunda','Sentir genuinamente a dor dos outros',1),
  ('G_MERCY','pt','Paci�ncia Infinita','N�o se cansar de ajudar quem sofre',2),
  ('G_MERCY','pt','Sensibilidade Espiritual','Discernir as necessidades emocionais das pessoas',3),
  ('G_MERCY','pt','Perd�o Constante','Estender gra�a mesmo quando ferido',4),
  ('G_MERCY','pt','Amor Incondicional','Amar independente das circunst�ncias',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- ============= CHARACTERISTICS =============
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('A_PROPHECY','pt','Sente necessidade de expressar sua mensagem, verbalmente',1),
  ('A_PROPHECY','pt','Tem capacidade de discernir os motivos e o car�ter dos outros',2),
  ('A_PROPHECY','pt','Tem capacidade de identificar, definir e odiar o mal',3),
  ('A_PROPHECY','pt','Est� sempre pronto a experimentar quebrantamento para produzi-lo em outros',4),
  ('A_PROPHECY','pt','Depende das escrituras para validar sua autoridade',5),

  ('B_SERVICE','pt','Tem capacidade de lembrar do que os outros gostam ou n�o',1),
  ('B_SERVICE','pt','Est� sempre atento �s necessidades pr�ticas',2),
  ('B_SERVICE','pt','Impulsionado a suprir as necessidades o mais breve poss�vel',3),
  ('B_SERVICE','pt','� de resist�ncia f�sica suficiente para suprir estas necessidades sem pensar no cansa�o',4),
  ('B_SERVICE','pt','Est� disposto a usar recursos pr�prios para evitar demora',5),

  ('C_TEACHING','pt','Fala com clareza na apresenta��o da verdade',1),
  ('C_TEACHING','pt','Tem capacidade de validar a verdade atrav�s de pesquisa',2),
  ('C_TEACHING','pt','Apresenta a verdade numa sequ�ncia sistem�tica',3),
  ('C_TEACHING','pt','Constr�i a verdade sobre uma estrutura de conhecimento',4),
  ('C_TEACHING','pt','Sente-se respons�vel por produzir informa��es precisas',5),

  ('D_EXHORTATION','pt','Tem capacidade de ver recursos n�o utilizados numa pessoa',1),
  ('D_EXHORTATION','pt','Tem capacidade de ver como os problemas contribuem para a maturidade',2),
  ('D_EXHORTATION','pt','Est� ansioso por dar passos prescritos de a��o para vencer',3),
  ('D_EXHORTATION','pt','Tem capacidade de visualizar o produto final da recomenda��o',4),
  ('D_EXHORTATION','pt','Espera uma resposta imediata para suas recomenda��es',5),

  ('E_GIVING','pt','Tem capacidade especial de fazer dinheiro',1),
  ('E_GIVING','pt','D� com generosidade, mas mant�m controle sobre como o presente � usado',2),
  ('E_GIVING','pt','Trabalha com um or�amento e mant�m os gastos dentro dos seus limites',3),
  ('E_GIVING','pt','� motivado quando sabe que sua contribui��o produzir� mais recursos',4),
  ('E_GIVING','pt','Quer que sua contribui��o seja um investimento de qualidade',5),

  ('F_LEADERSHIP','pt','Tem capacidade de ver o quadro geral',1),
  ('F_LEADERSHIP','pt','Tem capacidade de dividir objetivos em tarefas control�veis',2),
  ('F_LEADERSHIP','pt','Est� disposto a suportar rea��es negativas quando tomando decis�es para o bem da organiza��o',3),
  ('F_LEADERSHIP','pt','Tem capacidade especial de saber o que pode ou n�o pode ser feito',4),
  ('F_LEADERSHIP','pt','Tem uma necessidade especial de ver que os outros est�o sendo produtivos',5),

  ('G_MERCY','pt','Tem capacidade de sentir a alegria ou ang�stia dos outros',1),
  ('G_MERCY','pt','Est� atra�do �s pessoas que est�o em afli��o mental ou emocional',2),
  ('G_MERCY','pt','Tem capacidade de discernir sinceridade ou falta de sinceridade nos outros',3),
  ('G_MERCY','pt','Tem capacidade de evitar palavras que agravar�o uma pessoa ferida',4),
  ('G_MERCY','pt','� atra�do por pessoas de diferentes forma��es raciais, culturais e educacionais',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- ============= DANGERS =============
INSERT INTO public.dangers(gift_key, locale, danger, order_sequence) VALUES
  ('A_PROPHECY','pt','Orgulho espiritual e senso de superioridade',1),
  ('A_PROPHECY','pt','Tend�ncia ao julgamento severo dos outros',2),
  ('A_PROPHECY','pt','Impaci�ncia com o processo de crescimento das pessoas',3),
  ('A_PROPHECY','pt','Falta de tato ao comunicar verdades dif�ceis',4),
  ('A_PROPHECY','pt','Confundir opini�o pessoal com revela��o divina',5),

  ('B_SERVICE','pt','Esgotamento f�sico e emocional por servir demais',1),
  ('B_SERVICE','pt','Ressentimento quando o servi�o n�o � reconhecido',2),
  ('B_SERVICE','pt','Tend�ncia a negligenciar necessidades pessoais e familiares',3),
  ('B_SERVICE','pt','Crit�cismo excessivo de m�todos dos outros',4),
  ('B_SERVICE','pt','Dificuldade para delegar e trabalhar em equipe',5),

  ('C_TEACHING','pt','Orgulho intelectual e arrog�ncia acad�mica',1),
  ('C_TEACHING','pt','Frieza emocional e falta de aplica��o pessoal',2),
  ('C_TEACHING','pt','Tend�ncia ao perfeccionismo excessivo',3),
  ('C_TEACHING','pt','Impaci�ncia com perguntas repetitivas',4),
  ('C_TEACHING','pt','Foco em teoria sem aplica��o pr�tica',5),

  ('D_EXHORTATION','pt','Superficialidade ao lidar com problemas profundos',1),
  ('D_EXHORTATION','pt','Impaci�ncia com pessoas em depress�o',2),
  ('D_EXHORTATION','pt','Tend�ncia a dar conselhos n�o solicitados',3),
  ('D_EXHORTATION','pt','Falta de empatia com o sofrimento alheio',4),
  ('D_EXHORTATION','pt','Press�o excessiva por resultados r�pidos',5),

  ('E_GIVING','pt','Controle excessivo sobre como os recursos s�o usados',1),
  ('E_GIVING','pt','Orgulho pelo status financeiro e capacidade de dar',2),
  ('E_GIVING','pt','Julgamento de outros pela capacidade de contribuir',3),
  ('E_GIVING','pt','Negligenciar relacionamentos em favor de projetos',4),
  ('E_GIVING','pt','Tenta��o de comprar influ�ncia atrav�s das doa��es',5),

  ('F_LEADERSHIP','pt','Autoritarismo e dificuldade para aceitar opini�es',1),
  ('F_LEADERSHIP','pt','Impaci�ncia com processos democr�ticos',2),
  ('F_LEADERSHIP','pt','Tend�ncia a manipular pessoas para atingir objetivos',3),
  ('F_LEADERSHIP','pt','Orgulho pelos sucessos e realiza��es',4),
  ('F_LEADERSHIP','pt','Negligenciar necessidades pessoais da equipe',5),

  ('G_MERCY','pt','Permitir que outros se aproveitem de sua bondade',1),
  ('G_MERCY','pt','Evitar confrontos necess�rios por medo de ferir',2),
  ('G_MERCY','pt','Depress�o por absorver demais as dores dos outros',3),
  ('G_MERCY','pt','Julgamento de outros por falta de compaix�o',4),
  ('G_MERCY','pt','Negligenciar justi�a em favor da miseric�rdia',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- ============= MISUNDERSTANDINGS =============
INSERT INTO public.misunderstandings(gift_key, locale, misunderstanding, order_sequence) VALUES
  ('A_PROPHECY','pt','Acreditar que sempre tem uma palavra direta de Deus',1),
  ('A_PROPHECY','pt','Confundir cr�tica com minist�rio prof�tico',2),
  ('A_PROPHECY','pt','Pensar que deve corrigir todos os erros que v�',3),
  ('A_PROPHECY','pt','Assumir que outros devem aceitar suas palavras imediatamente',4),
  ('A_PROPHECY','pt','Negligenciar o amor ao exercer o dom',5),

  ('B_SERVICE','pt','Acreditar que servir � sempre fazer tarefas pr�ticas',1),
  ('B_SERVICE','pt','Pensar que deve aceitar todos os pedidos de ajuda',2),
  ('B_SERVICE','pt','Assumir que outros n�o querem ajudar como deveriam',3),
  ('B_SERVICE','pt','Sentir que reconhecimento diminui o valor do servi�o',4),
  ('B_SERVICE','pt','Negligenciar o pr�prio crescimento espiritual',5),

  ('C_TEACHING','pt','Acreditar que conhecimento sempre leva � maturidade',1),
  ('C_TEACHING','pt','Pensar que ensinar � apenas transmitir informa��es',2),
  ('C_TEACHING','pt','Assumir que todos aprendem da mesma forma',3),
  ('C_TEACHING','pt','Sentir que questionamentos s�o falta de respeito',4),
  ('C_TEACHING','pt','Negligenciar a aplica��o emocional e relacional',5),

  ('D_EXHORTATION','pt','Acreditar que toda situa��o pode ser rapidamente resolvida',1),
  ('D_EXHORTATION','pt','Pensar que otimismo � sempre a resposta certa',2),
  ('D_EXHORTATION','pt','Assumir que outros s�o pregui�osos se n�o progridem',3),
  ('D_EXHORTATION','pt','Sentir que deve ter solu��o para todos os problemas',4),
  ('D_EXHORTATION','pt','Negligenciar a necessidade de simplesmente ouvir',5),

  ('E_GIVING','pt','Acreditar que doar dinheiro resolve todos os problemas',1),
  ('E_GIVING','pt','Pensar que quantidade de doa��o mede espiritualidade',2),
  ('E_GIVING','pt','Assumir que deve controlar como suas doa��es s�o usadas',3),
  ('E_GIVING','pt','Sentir que outros s�o ego�stas por darem menos',4),
  ('E_GIVING','pt','Negligenciar outras formas importantes de contribui��o',5),

  ('F_LEADERSHIP','pt','Acreditar que deve liderar em todas as situa��es',1),
  ('F_LEADERSHIP','pt','Pensar que lideran�a � sempre tomar decis�es sozinho',2),
  ('F_LEADERSHIP','pt','Assumir que outros s�o incompetentes se n�o executam bem',3),
  ('F_LEADERSHIP','pt','Sentir que questionar sua lideran�a � rebeldia',4),
  ('F_LEADERSHIP','pt','Negligenciar desenvolvimento espiritual pr�prio',5),

  ('G_MERCY','pt','Acreditar que deve ajudar a todos sem exce��o',1),
  ('G_MERCY','pt','Pensar que confrontar pessoas � sempre errado',2),
  ('G_MERCY','pt','Assumir que outros s�o duros demais se n�o demonstram compaix�o',3),
  ('G_MERCY','pt','Sentir que deve resolver todos os sofrimentos que v�',4),
  ('G_MERCY','pt','Negligenciar a necessidade de limites saud�veis',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;