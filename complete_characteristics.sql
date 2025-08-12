-- =========================================================
-- COMPLETAR DADOS DE CARACTERÍSTICAS DOS DONS ESPIRITUAIS
-- =========================================================

-- Inserir características completas para todos os dons espirituais

-- A_PROPHECY - Dom de Profecia
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('A_PROPHECY','pt','Sente necessidade de expressar sua mensagem, verbalmente',1),
  ('A_PROPHECY','pt','Tem capacidade de discernir os motivos e o caráter dos outros',2),
  ('A_PROPHECY','pt','Tem capacidade de identificar, definir e odiar o mal',3),
  ('A_PROPHECY','pt','Está sempre pronto a experimentar quebrantamento para produzi-lo em outros',4),
  ('A_PROPHECY','pt','Depende das escrituras para validar sua autoridade',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- B_SERVICE - Dom de Ministério/Serviço  
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('B_SERVICE','pt','Tem capacidade de lembrar do que os outros gostam ou não',1),
  ('B_SERVICE','pt','Está sempre atento às necessidades práticas',2),
  ('B_SERVICE','pt','Impulsionado a suprir as necessidades o mais breve possível',3),
  ('B_SERVICE','pt','É de resistência física suficiente para suprir estas necessidades sem pensar no cansaço',4),
  ('B_SERVICE','pt','Está disposto a usar recursos próprios para evitar demora',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- C_TEACHING - Dom de Ensino
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('C_TEACHING','pt','Fala com clareza na apresentação da verdade',1),
  ('C_TEACHING','pt','Tem capacidade de validar a verdade através de pesquisa',2),
  ('C_TEACHING','pt','Apresenta a verdade numa sequência sistemática',3),
  ('C_TEACHING','pt','Constrói a verdade sobre uma estrutura de conhecimento',4),
  ('C_TEACHING','pt','Sente-se responsável por produzir informações precisas',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- D_EXHORTATION - Dom de Exortação
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('D_EXHORTATION','pt','Tem capacidade de ver recursos não utilizados numa pessoa',1),
  ('D_EXHORTATION','pt','Tem capacidade de ver como os problemas contribuem para a maturidade',2),
  ('D_EXHORTATION','pt','Está ansioso por dar passos prescritos de ação para vencer',3),
  ('D_EXHORTATION','pt','Tem capacidade de visualizar o produto final da recomendação',4),
  ('D_EXHORTATION','pt','Espera uma resposta imediata para suas recomendações',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- E_GIVING - Dom de Contribuição
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('E_GIVING','pt','Tem capacidade especial de fazer dinheiro',1),
  ('E_GIVING','pt','Dá com generosidade, mas mantém controle sobre como o presente é usado',2),
  ('E_GIVING','pt','Trabalha com um orçamento e mantém os gastos dentro dos seus limites',3),
  ('E_GIVING','pt','É motivado quando sabe que sua contribuição produzirá mais recursos',4),
  ('E_GIVING','pt','Quer que sua contribuição seja um investimento de qualidade',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- F_LEADERSHIP - Dom de Liderança
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('F_LEADERSHIP','pt','Tem capacidade de ver a configuração total de um projeto',1),
  ('F_LEADERSHIP','pt','Tem capacidade de quebrar objetivos finais em tarefas atingíveis',2),
  ('F_LEADERSHIP','pt','Tem urgência de organizar o que vê para atingir objetivos',3),
  ('F_LEADERSHIP','pt','Está apto a saber quais recursos são necessários para atingir objetivos',4),
  ('F_LEADERSHIP','pt','Tem capacidade de manter a lealdade daqueles que são dirigidos',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- G_MERCY - Dom de Misericórdia
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
  ('G_MERCY','pt','Tem grande capacidade de sentir a dor emocional dos outros',1),
  ('G_MERCY','pt','Tem capacidade de sentir quando outros estão tristes ou alegres',2),
  ('G_MERCY','pt','É atraído àqueles que estão em dor emocional ou física',3),
  ('G_MERCY','pt','Evita firmeza com aqueles que estão sofrendo',4),
  ('G_MERCY','pt','Escolhe amigos íntimos que têm paixão similar pelos outros',5)
ON CONFLICT (gift_key,locale,order_sequence) DO NOTHING;

-- Verificar quantas características foram inseridas
SELECT 
  gift_key, 
  COUNT(*) as total_characteristics
FROM public.characteristics 
WHERE locale = 'pt' 
GROUP BY gift_key 
ORDER BY gift_key;

SELECT 'Características inseridas com sucesso!' as status;