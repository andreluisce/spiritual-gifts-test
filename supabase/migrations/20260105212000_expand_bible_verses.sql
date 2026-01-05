-- =========================================================
-- EXPAND BIBLE VERSES DATABASE
-- Add 10-15 verses per gift for rich content
-- =========================================================

-- Additional PROPHECY verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('A_PROPHECY', '1 Coríntios 14:1', 'Segui o amor, e procurai com zelo os dons espirituais, mas principalmente o de profetizar', 'pt', 8.0, 'Buscar o dom de profecia'),
('A_PROPHECY', 'Jeremias 1:9', 'Eis que ponho as minhas palavras na tua boca', 'pt', 7.5, 'Deus capacita o profeta'),
('A_PROPHECY', 'Ezequiel 3:17', 'Filho do homem, eu te dei por atalaia sobre a casa de Israel', 'pt', 7.0, 'Papel de vigilância'),
('A_PROPHECY', '2 Pedro 1:21', 'A profecia nunca foi produzida por vontade de homem algum, mas os homens santos falaram da parte de Deus', 'pt', 8.0, 'Origem divina da profecia'),
('A_PROPHECY', 'Atos 2:17', 'Derramarei do meu Espírito sobre toda a carne; e os vossos filhos e as vossas filhas profetizarão', 'pt', 7.5, 'Promessa do Espírito'),
('A_PROPHECY', '1 Coríntios 14:24-25', 'Se todos profetizarem, e algum incrédulo entrar, é convencido por todos e por todos é julgado', 'pt', 7.0, 'Impacto da profecia'),
('A_PROPHECY', 'Apocalipse 19:10', 'O testemunho de Jesus é o espírito de profecia', 'pt', 6.5, 'Essência da profecia'),
('A_PROPHECY', 'Números 11:29', 'Tomara que todo o povo do Senhor fosse profeta', 'pt', 6.0, 'Desejo de Moisés'),
('A_PROPHECY', 'Joel 2:28', 'Derramarei o meu Espírito sobre toda a carne, e vossos filhos e vossas filhas profetizarão', 'pt', 7.5, 'Profecia do derramamento'),
('A_PROPHECY', '1 Timóteo 4:14', 'Não desprezes o dom que há em ti, o qual te foi dado por profecia', 'pt', 6.5, 'Confirmação profética de dons')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- Additional SERVICE verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('B_SERVICE', 'Atos 6:2-4', 'Escolhei homens de boa reputação para servirem às mesas', 'pt', 8.0, 'Instituição do diaconato'),
('B_SERVICE', 'Mateus 20:26-28', 'Qualquer que quiser ser grande entre vós será vosso serviçal', 'pt', 7.5, 'Grandeza no serviço'),
('B_SERVICE', 'João 13:14-15', 'Se eu, sendo o Senhor e Mestre, vos lavei os pés, vós deveis também lavar os pés uns dos outros', 'pt', 9.0, 'Exemplo de Jesus'),
('B_SERVICE', 'Filipenses 2:3-4', 'Nada façais por contenda, mas cada um considere os outros superiores a si mesmo', 'pt', 7.0, 'Atitude de servo'),
('B_SERVICE', 'Colossenses 3:23-24', 'Tudo quanto fizerdes, fazei-o de todo o coração, como ao Senhor', 'pt', 8.5, 'Motivação no serviço'),
('B_SERVICE', '1 Coríntios 12:28', 'Deus estabeleceu na igreja socorros', 'pt', 6.5, 'Dom de socorro'),
('B_SERVICE', 'Atos 9:36', 'Dorcas, esta estava cheia de boas obras e esmolas que fazia', 'pt', 7.0, 'Exemplo de Dorcas'),
('B_SERVICE', 'Romanos 16:1-2', 'Recomendo-vos Febe, que está servindo à igreja', 'pt', 6.5, 'Reconhecimento do serviço'),
('B_SERVICE', 'Hebreus 6:10', 'Deus não é injusto para se esquecer da vossa obra e do trabalho do amor', 'pt', 7.5, 'Recompensa do serviço'),
('B_SERVICE', '1 Pedro 4:11', 'Se alguém administra, faça-o segundo o poder que Deus dá', 'pt', 7.0, 'Capacitação divina')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- Additional TEACHING verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('C_TEACHING', 'Mateus 28:19-20', 'Ide, fazei discípulos de todas as nações, ensinando-os a guardar todas as coisas', 'pt', 9.0, 'Grande comissão'),
('C_TEACHING', 'Colossenses 3:16', 'A palavra de Cristo habite em vós abundantemente, ensinando-vos uns aos outros', 'pt', 8.0, 'Ensino mútuo'),
('C_TEACHING', '1 Timóteo 4:13', 'Persiste em ler, exortar e ensinar', 'pt', 7.5, 'Prioridades do mestre'),
('C_TEACHING', 'Neemias 8:8', 'Leram no livro, na lei de Deus, e declarando e explicando o sentido', 'pt', 8.5, 'Método de ensino'),
('C_TEACHING', 'Provérbios 9:9', 'Ensina ao sábio, e ele se fará mais sábio', 'pt', 6.5, 'Ensino ao receptivo'),
('C_TEACHING', 'Deuteronômio 6:6-7', 'Estas palavras ensinarás a teus filhos', 'pt', 7.0, 'Ensino familiar'),
('C_TEACHING', 'Salmos 78:4-6', 'Contaremos à geração futura as obras gloriosas do Senhor', 'pt', 6.5, 'Transmissão geracional'),
('C_TEACHING', 'Atos 18:25-26', 'Priscila e Áquila expuseram com mais exatidão o caminho de Deus', 'pt', 7.5, 'Ensino preciso'),
('C_TEACHING', 'Hebreus 5:12', 'Devendo já ser mestres pelo tempo', 'pt', 6.0, 'Maturidade para ensinar'),
('C_TEACHING', '2 Timóteo 3:16-17', 'Toda a Escritura é útil para ensinar', 'pt', 9.0, 'Base do ensino')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- Additional EXHORTATION verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('D_EXHORTATION', 'Atos 15:32', 'Judas e Silas exortaram e confirmaram os irmãos com muitas palavras', 'pt', 7.5, 'Exortação prática'),
('D_EXHORTATION', '2 Timóteo 4:2', 'Prega a palavra, insiste a tempo e fora de tempo, repreende, corrige, exorta', 'pt', 8.5, 'Ministério completo'),
('D_EXHORTATION', 'Tito 1:9', 'Retendo firme a fiel palavra, para que seja poderoso para exortar', 'pt', 7.0, 'Base da exortação'),
('D_EXHORTATION', 'Hebreus 10:24-25', 'Consideremo-nos uns aos outros, para nos estimularmos ao amor', 'pt', 8.0, 'Estímulo mútuo'),
('D_EXHORTATION', '1 Tessalonicenses 2:11-12', 'Exortávamos cada um de vós, como o pai a seus filhos', 'pt', 7.5, 'Exortação paternal'),
('D_EXHORTATION', 'Filipenses 4:2', 'Rogo a Evódia, e rogo a Síntique, que sintam o mesmo no Senhor', 'pt', 6.5, 'Exortação à unidade'),
('D_EXHORTATION', 'Colossenses 1:28', 'Admoestando a todo o homem, e ensinando a todo o homem em toda a sabedoria', 'pt', 7.0, 'Exortação sábia'),
('D_EXHORTATION', '2 Coríntios 1:3-4', 'O Deus de toda a consolação, que nos consola em toda a nossa tribulação', 'pt', 8.0, 'Fonte da consolação'),
('D_EXHORTATION', 'Atos 20:2', 'Havendo-os exortado com muitas palavras', 'pt', 6.0, 'Perseverança na exortação'),
('D_EXHORTATION', '1 Pedro 5:12', 'Exortando e testificando que esta é a verdadeira graça de Deus', 'pt', 7.0, 'Testemunho da graça')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- Additional GIVING verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('E_GIVING', 'Atos 4:34-35', 'Nenhum necessitado havia entre eles, pois vendiam suas propriedades', 'pt', 8.5, 'Generosidade da igreja primitiva'),
('E_GIVING', '2 Coríntios 8:2-3', 'A sua profunda pobreza abundou em riquezas da sua generosidade', 'pt', 8.0, 'Generosidade sacrificial'),
('E_GIVING', 'Malaquias 3:10', 'Trazei todos os dízimos à casa do tesouro', 'pt', 7.0, 'Princípio do dízimo'),
('E_GIVING', 'Provérbios 3:9-10', 'Honra ao Senhor com os teus bens', 'pt', 7.5, 'Honra através da doação'),
('E_GIVING', 'Mateus 6:3-4', 'Não saiba a tua mão esquerda o que faz a tua direita', 'pt', 8.0, 'Discrição na doação'),
('E_GIVING', 'Atos 20:35', 'Mais bem-aventurada coisa é dar do que receber', 'pt', 9.0, 'Bem-aventurança do dar'),
('E_GIVING', '1 Timóteo 6:17-18', 'Que façam o bem, enriqueçam em boas obras, repartam de boa mente', 'pt', 7.5, 'Riqueza em boas obras'),
('E_GIVING', 'Deuteronômio 15:10', 'Livremente lhe darás, e não seja maligno o teu coração', 'pt', 6.5, 'Atitude ao dar'),
('E_GIVING', 'Provérbios 22:9', 'O que vê com bons olhos será abençoado, porque dá do seu pão ao pobre', 'pt', 7.0, 'Bênção da generosidade'),
('E_GIVING', '2 Coríntios 9:11', 'Em tudo enriquecidos para toda a beneficência', 'pt', 7.5, 'Propósito da prosperidade')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- Additional LEADERSHIP verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('F_LEADERSHIP', '1 Pedro 5:2-3', 'Apascentai o rebanho de Deus, não como tendo domínio, mas servindo de exemplo', 'pt', 9.0, 'Liderança servidora'),
('F_LEADERSHIP', 'Neemias 2:17-18', 'Vinde, reedifiquemos o muro de Jerusalém', 'pt', 8.0, 'Visão mobilizadora'),
('F_LEADERSHIP', 'Êxodo 18:21', 'Escolhe homens capazes, tementes a Deus', 'pt', 7.5, 'Seleção de líderes'),
('F_LEADERSHIP', 'Josué 1:8-9', 'Medita neste livro dia e noite, então farás prosperar o teu caminho', 'pt', 7.0, 'Fundamento da liderança'),
('F_LEADERSHIP', '1 Timóteo 5:17', 'Os presbíteros que governam bem sejam estimados por dignos de duplicada honra', 'pt', 6.5, 'Reconhecimento de líderes'),
('F_LEADERSHIP', 'Atos 6:3', 'Escolhei homens de boa reputação, cheios do Espírito Santo e de sabedoria', 'pt', 8.0, 'Qualificações de líderes'),
('F_LEADERSHIP', 'Tito 1:7-9', 'Convém que o bispo seja irrepreensível', 'pt', 7.5, 'Caráter do líder'),
('F_LEADERSHIP', 'Provérbios 11:14', 'Havendo sábios conselhos há bom êxito', 'pt', 6.5, 'Sabedoria coletiva'),
('F_LEADERSHIP', '2 Crônicas 1:10', 'Dá-me sabedoria e conhecimento, para que possa sair e entrar perante este povo', 'pt', 7.0, 'Pedido de sabedoria'),
('F_LEADERSHIP', 'Jeremias 3:15', 'Dar-vos-ei pastores segundo o meu coração', 'pt', 7.5, 'Líderes segundo Deus')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

-- Additional MERCY verses
INSERT INTO public.gift_bible_verses (gift_key, verse_reference, verse_text, locale, relevance_score, context_note) VALUES
('G_MERCY', 'Tiago 2:13', 'A misericórdia triunfa sobre o juízo', 'pt', 8.5, 'Prioridade da misericórdia'),
('G_MERCY', 'Miquéias 6:8', 'Amar a benignidade, e andar humildemente com o teu Deus', 'pt', 9.0, 'Essência da piedade'),
('G_MERCY', 'Zacarias 7:9', 'Executai juízo verdadeiro, e exercei piedade e misericórdia cada um para com seu irmão', 'pt', 7.5, 'Prática da misericórdia'),
('G_MERCY', 'Provérbios 14:21', 'O que se compadece dos pobres é bem-aventurado', 'pt', 7.0, 'Compaixão pelos necessitados'),
('G_MERCY', 'Isaías 58:6-7', 'Repartir o teu pão com o faminto, e recolher em casa os pobres desterrados', 'pt', 8.0, 'Misericórdia prática'),
('G_MERCY', '1 João 3:17', 'Quem tiver bens do mundo, e vendo o seu irmão necessitado, como estará nele o amor de Deus?', 'pt', 8.5, 'Amor demonstrado'),
('G_MERCY', 'Provérbios 19:17', 'Ao Senhor empresta o que se compadece do pobre', 'pt', 7.0, 'Recompensa da compaixão'),
('G_MERCY', 'Efésios 4:32', 'Sede uns para com os outros benignos, misericordiosos', 'pt', 7.5, 'Relacionamentos compassivos'),
('G_MERCY', 'Salmos 41:1', 'Bem-aventurado é aquele que atende ao pobre', 'pt', 6.5, 'Bênção do cuidado'),
('G_MERCY', 'Hebreus 13:3', 'Lembrai-vos dos presos, como se estivésseis presos com eles', 'pt', 7.0, 'Empatia com sofredores')
ON CONFLICT (gift_key, verse_reference, locale) DO NOTHING;

COMMENT ON TABLE public.gift_bible_verses IS 'Expanded database with 10-15 gift-specific Bible verses per gift';
