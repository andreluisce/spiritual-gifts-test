-- Migration to add EN and ES translations for Dangers and Misunderstandings
-- Note: Replaces content deleted in previous migration file (20260115163000)

-- =========================================================
-- DANGERS TRANSLATIONS
-- =========================================================

-- PROPHECY (10 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('A_PROPHECY', 'Taking pride in their rhetoric', 'en'),
('A_PROPHECY', 'Depending on immediate results', 'en'),
('A_PROPHECY', 'Judging others who are not as committed', 'en'),
('A_PROPHECY', 'Being insensitive to others'' feelings', 'en'),
('A_PROPHECY', 'Being inflexible in methods', 'en'),
('A_PROPHECY', 'Moving ahead of God', 'en'),
('A_PROPHECY', 'Being critical and negative', 'en'),
('A_PROPHECY', 'Forgetting to praise others', 'en'),
('A_PROPHECY', 'Becoming legalistic', 'en'),
('A_PROPHECY', 'Isolating themselves from other believers', 'en'),
-- ES
('A_PROPHECY', 'Enorgullecerse de su retórica', 'es'),
('A_PROPHECY', 'Depender de resultados inmediatos', 'es'),
('A_PROPHECY', 'Juzgar a otros que no son tan comprometidos', 'es'),
('A_PROPHECY', 'Ser insensible a los sentimientos de los otros', 'es'),
('A_PROPHECY', 'Ser inflexible en métodos', 'es'),
('A_PROPHECY', 'Adelantarse a Dios', 'es'),
('A_PROPHECY', 'Ser crítico y negativo', 'es'),
('A_PROPHECY', 'Olvidar elogiar a los otros', 'es'),
('A_PROPHECY', 'Volverse legalista', 'es'),
('A_PROPHECY', 'Aislarse de otros creyentes', 'es');

-- SERVICE (5 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('B_SERVICE', 'Taking pride in their works', 'en'),
('B_SERVICE', 'Feeling used or unappreciated', 'en'),
('B_SERVICE', 'Judging others who do not serve as much', 'en'),
('B_SERVICE', 'Neglecting family by serving too much', 'en'),
('B_SERVICE', 'Neglecting devotional life due to excessive activities', 'en'),
-- ES
('B_SERVICE', 'Enorgullecerse de sus obras', 'es'),
('B_SERVICE', 'Sentirse usado o no apreciado', 'es'),
('B_SERVICE', 'Juzgar a otros que no sirven tanto', 'es'),
('B_SERVICE', 'Descuidar la familia por servir demasiado', 'es'),
('B_SERVICE', 'Descuidar la vida devocional por exceso de actividades', 'es');

-- TEACHING (10 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('C_TEACHING', 'Intellectual pride', 'en'),
('C_TEACHING', 'Emphasizing knowledge over practical application', 'en'),
('C_TEACHING', 'Becoming critical of others'' teachings', 'en'),
('C_TEACHING', 'Neglecting personal relationship with God', 'en'),
('C_TEACHING', 'Using teaching to control or manipulate', 'en'),
('C_TEACHING', 'Being impatient with those who don''t learn quickly', 'en'),
('C_TEACHING', 'Valuing knowledge above wisdom', 'en'),
('C_TEACHING', 'Neglecting other areas of Christian life', 'en'),
('C_TEACHING', 'Becoming dogmatic and inflexible', 'en'),
('C_TEACHING', 'Despising emotional experiences', 'en'),
-- ES
('C_TEACHING', 'Orgullo intelectual', 'es'),
('C_TEACHING', 'Enfatizar conocimiento sobre la aplicación práctica', 'es'),
('C_TEACHING', 'Volverse crítico con enseñanzas de otros', 'es'),
('C_TEACHING', 'Descuidar la relación personal con Dios', 'es'),
('C_TEACHING', 'Usar la enseñanza para controlar o manipular', 'es'),
('C_TEACHING', 'Ser impaciente con quien no aprende rápido', 'es'),
('C_TEACHING', 'Valorar conocimiento por encima de sabiduría', 'es'),
('C_TEACHING', 'Descuidar otras áreas de la vida cristiana', 'es'),
('C_TEACHING', 'Volverse dogmático e inflexible', 'es'),
('C_TEACHING', 'Despreciar experiencias emocionales', 'es');

-- EXHORTATION (10 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('D_EXHORTATION', 'Offering quick solutions without listening adequately', 'en'),
('D_EXHORTATION', 'Being superficial when dealing with deep problems', 'en'),
('D_EXHORTATION', 'Becoming impatient with those who don''t change quickly', 'en'),
('D_EXHORTATION', 'Minimizing others'' pain with excessive optimism', 'en'),
('D_EXHORTATION', 'Assuming responsibility for others'' problems', 'en'),
('D_EXHORTATION', 'Neglecting their own needs', 'en'),
('D_EXHORTATION', 'Giving advice without being asked', 'en'),
('D_EXHORTATION', 'Using Bible verses simplistically', 'en'),
('D_EXHORTATION', 'Avoiding necessary confrontation', 'en'),
('D_EXHORTATION', 'Becoming dependent on being needed', 'en'),
-- ES
('D_EXHORTATION', 'Ofrecer soluciones rápidas sin escuchar adecuadamente', 'es'),
('D_EXHORTATION', 'Ser superficial al tratar problemas profundos', 'es'),
('D_EXHORTATION', 'Volverse impaciente con quien no cambia rápidamente', 'es'),
('D_EXHORTATION', 'Minimizar el dolor ajeno con optimismo excesivo', 'es'),
('D_EXHORTATION', 'Asumir responsabilidad por los problemas de otros', 'es'),
('D_EXHORTATION', 'Descuidar sus propias necesidades', 'es'),
('D_EXHORTATION', 'Dar consejos sin ser solicitado', 'es'),
('D_EXHORTATION', 'Usar versículos bíblicos de forma simplista', 'es'),
('D_EXHORTATION', 'Evitar confrontación necesaria', 'es'),
('D_EXHORTATION', 'Volverse dependiente de ser necesario', 'es');

-- GIVING (10 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('E_GIVING', 'Using money to control or manipulate', 'en'),
('E_GIVING', 'Developing pride in their ability to give', 'en'),
('E_GIVING', 'Judging others who give less', 'en'),
('E_GIVING', 'Neglecting other spiritual areas', 'en'),
('E_GIVING', 'Giving out of obligation instead of joy', 'en'),
('E_GIVING', 'Expecting recognition for donations', 'en'),
('E_GIVING', 'Being stingy in other areas', 'en'),
('E_GIVING', 'Measuring spirituality by financial contributions', 'en'),
('E_GIVING', 'Neglecting time and talents focusing only on money', 'en'),
('E_GIVING', 'Becoming materialistic', 'en'),
-- ES
('E_GIVING', 'Usar dinero para controlar o manipular', 'es'),
('E_GIVING', 'Desarrollar orgullo por la capacidad de dar', 'es'),
('E_GIVING', 'Juzgar a otros que dan menos', 'es'),
('E_GIVING', 'Descuidar otras áreas espirituales', 'es'),
('E_GIVING', 'Dar por obligación en vez de alegría', 'es'),
('E_GIVING', 'Esperar reconocimiento por las donaciones', 'es'),
('E_GIVING', 'Ser tacaño en otras áreas', 'es'),
('E_GIVING', 'Medir espiritualidad por contribuciones financieras', 'es'),
('E_GIVING', 'Descuidar tiempo y talentos enfocando solo en dinero', 'es'),
('E_GIVING', 'Volverse materialista', 'es');

-- LEADERSHIP (10 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('F_LEADERSHIP', 'Developing authoritarianism', 'en'),
('F_LEADERSHIP', 'Using people to achieve goals', 'en'),
('F_LEADERSHIP', 'Developing pride in their position', 'en'),
('F_LEADERSHIP', 'Neglecting pastoral care by focusing on results', 'en'),
('F_LEADERSHIP', 'Making decisions without seeking advice', 'en'),
('F_LEADERSHIP', 'Being impatient with slow processes', 'en'),
('F_LEADERSHIP', 'Neglecting important details', 'en'),
('F_LEADERSHIP', 'Being insensitive to individual needs', 'en'),
('F_LEADERSHIP', 'Delegating responsibility without authority', 'en'),
('F_LEADERSHIP', 'Becoming workaholic', 'en'),
-- ES
('F_LEADERSHIP', 'Desarrollar autoritarismo', 'es'),
('F_LEADERSHIP', 'Usar personas para alcanzar objetivos', 'es'),
('F_LEADERSHIP', 'Desarrollar orgullo por la posición', 'es'),
('F_LEADERSHIP', 'Descuidar el cuidado pastoral por enfocar en resultados', 'es'),
('F_LEADERSHIP', 'Tomar decisiones sin buscar consejo', 'es'),
('F_LEADERSHIP', 'Ser impaciente con procesos lentos', 'es'),
('F_LEADERSHIP', 'Descuidar detalles importantes', 'es'),
('F_LEADERSHIP', 'Ser insensible a las necesidades individuales', 'es'),
('F_LEADERSHIP', 'Delegar responsabilidad sin autoridad', 'es'),
('F_LEADERSHIP', 'Volverse adicto al trabajo', 'es');

-- MERCY (10 Items)
INSERT INTO public.dangers (gift_key, danger, locale) VALUES
-- EN
('G_MERCY', 'Being proud of their capacity for empathy', 'en'),
('G_MERCY', 'Trusting fully in their feelings', 'en'),
('G_MERCY', 'Making decisions based more on emotions than logic', 'en'),
('G_MERCY', 'Using all sensitivity on their problems and themselves', 'en'),
('G_MERCY', 'Seeing people with other gifts as insensitive', 'en'),
('G_MERCY', 'Lacking firmness when counseling or confronting', 'en'),
('G_MERCY', 'Empathizing with those who don''t deserve empathy', 'en'),
('G_MERCY', 'Becoming bitter over past sufferings', 'en'),
('G_MERCY', 'Withdrawing easily feeling hurt by others'' insensitivity', 'en'),
('G_MERCY', 'Being manipulated by people who abuse kindness', 'en'),
-- ES
('G_MERCY', 'Orgullecerse de su capacidad de empatía', 'es'),
('G_MERCY', 'Confiar plenamente en sus sentimientos', 'es'),
('G_MERCY', 'Tomar decisiones basadas más en emociones que en lógica', 'es'),
('G_MERCY', 'Usar toda la sensibilidad en sus problemas y sí mismo', 'es'),
('G_MERCY', 'Ver personas con otros dones como insensibles', 'es'),
('G_MERCY', 'No tener firmeza al aconsejar o confrontar', 'es'),
('G_MERCY', 'Empatizar con quien no merece empatía', 'es'),
('G_MERCY', 'Amargarse por sufrimientos pasados', 'es'),
('G_MERCY', 'Retirarse fácilmente sentido por la insensibilidad de otros', 'es'),
('G_MERCY', 'Ser manipulado por personas que abusan de la bondad', 'es');

-- =========================================================
-- MISUNDERSTANDINGS TRANSLATIONS
-- =========================================================

-- PROPHECY
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('A_PROPHECY', 'Being direct can be seen as lack of love', 'en'),
('A_PROPHECY', 'Their frankness can be seen as insensitivity', 'en'),
('A_PROPHECY', 'Their conviction can be seen as stubbornness', 'en'),
('A_PROPHECY', 'Their zeal can be seen as fanaticism', 'en'),
-- ES
('A_PROPHECY', 'Ser directo puede ser visto como falta de amor', 'es'),
('A_PROPHECY', 'Su franqueza puede ser vista como insensibilidad', 'es'),
('A_PROPHECY', 'Su convicción puede ser vista como terquedad', 'es'),
('A_PROPHECY', 'Su celo puede ser visto como fanatismo', 'es');

-- SERVICE
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('B_SERVICE', 'Their desire to serve can be seen as seeking recognition', 'en'),
('B_SERVICE', 'Their availability can be seen as lack of discernment', 'en'),
('B_SERVICE', 'Their practicality can be seen as lack of spirituality', 'en'),
('B_SERVICE', 'Their humility can be seen as lack of ambition', 'en'),
-- ES
('B_SERVICE', 'Su deseo de servir puede ser visto como búsqueda de reconocimiento', 'es'),
('B_SERVICE', 'Su disponibilidad puede ser vista como falta de discernimiento', 'es'),
('B_SERVICE', 'Su practicidad puede ser vista como falta de espiritualidad', 'es'),
('B_SERVICE', 'Su humildad puede ser vista como falta de ambición', 'es');

-- TEACHING
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('C_TEACHING', 'Their love for truth can be seen as coldness', 'en'),
('C_TEACHING', 'Their precision can be seen as perfectionism', 'en'),
('C_TEACHING', 'Their research can be seen as doubt', 'en'),
('C_TEACHING', 'Their correction can be seen as criticism', 'en'),
-- ES
('C_TEACHING', 'Su amor por la verdad puede ser visto como frialdad', 'es'),
('C_TEACHING', 'Su precisión puede ser vista como perfeccionismo', 'es'),
('C_TEACHING', 'Su investigación puede ser vista como duda', 'es'),
('C_TEACHING', 'Su corrección puede ser vista como crítica', 'es');

-- EXHORTATION
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('D_EXHORTATION', 'Their optimism can be seen as superficiality', 'en'),
('D_EXHORTATION', 'Their encouragement can be seen as minimizing problems', 'en'),
('D_EXHORTATION', 'Their practicality can be seen as lack of compassion', 'en'),
('D_EXHORTATION', 'Their focus on solutions can be seen as impatience', 'en'),
-- ES
('D_EXHORTATION', 'Su optimismo puede ser visto como superficialidad', 'es'),
('D_EXHORTATION', 'Su aliento puede ser visto como minimizar problemas', 'es'),
('D_EXHORTATION', 'Su practicidad puede ser vista como falta de compasión', 'es'),
('D_EXHORTATION', 'Su enfoque en soluciones puede ser visto como impaciencia', 'es');

-- GIVING
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('E_GIVING', 'Their generosity can be seen as showing off', 'en'),
('E_GIVING', 'Their financial discernment can be seen as stinginess', 'en'),
('E_GIVING', 'Their wisdom in giving can be seen as control', 'en'),
('E_GIVING', 'Their interest in projects can be seen as lack of faith', 'en'),
-- ES
('E_GIVING', 'Su generosidad puede ser vista como ostentación', 'es'),
('E_GIVING', 'Su discernimiento financiero puede ser visto como tacañería', 'es'),
('E_GIVING', 'Su sabiduría al dar puede ser vista como control', 'es'),
('E_GIVING', 'Su interés en proyectos puede ser visto como falta de fe', 'es');

-- LEADERSHIP
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('F_LEADERSHIP', 'Their vision can be seen as personal ambition', 'en'),
('F_LEADERSHIP', 'Their organization can be seen as control', 'en'),
('F_LEADERSHIP', 'Their delegation can be seen as laziness', 'en'),
('F_LEADERSHIP', 'Their firmness can be seen as insensitivity', 'en'),
-- ES
('F_LEADERSHIP', 'Su visión puede ser vista como ambición personal', 'es'),
('F_LEADERSHIP', 'Su organización puede ser vista como control', 'es'),
('F_LEADERSHIP', 'Su delegación puede ser vista como pereza', 'es'),
('F_LEADERSHIP', 'Su firmeza puede ser vista como insensibilidad', 'es');

-- MERCY
INSERT INTO public.misunderstandings (gift_key, misunderstanding, locale) VALUES
-- EN
('G_MERCY', 'Their compassion can be seen as weakness', 'en'),
('G_MERCY', 'Their sensitivity can be seen as emotionalism', 'en'),
('G_MERCY', 'Their empathy can be seen as lack of discernment', 'en'),
('G_MERCY', 'Their patience can be seen as permissiveness', 'en'),
-- ES
('G_MERCY', 'Su compasión puede ser vista como debilidad', 'es'),
('G_MERCY', 'Su sensibilidad puede ser vista como emocionalismo', 'es'),
('G_MERCY', 'Su empatía puede ser vista como falta de discernimiento', 'es'),
('G_MERCY', 'Su paciencia puede ser vista como permisividad', 'es');
