-- Migration to add EN and ES translations for Characteristics, Dangers, and Misunderstandings
-- First, clean up existing EN/ES entries to avoid duplicates
DELETE FROM public.characteristics WHERE locale IN ('en', 'es');
DELETE FROM public.dangers WHERE locale IN ('en', 'es');
DELETE FROM public.misunderstandings WHERE locale IN ('en', 'es');

-- =========================================================
-- CHARACTERISTICS TRANSLATIONS
-- =========================================================

-- A_PROPHECY
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('A_PROPHECY', 'en', 'Feels a need to express their message verbally', 1),
('A_PROPHECY', 'en', 'Has the capacity to discern the motives and character of others', 2),
('A_PROPHECY', 'en', 'Has the capacity to identify, define, and hate evil', 3),
('A_PROPHECY', 'en', 'Is always ready to experience brokenness to produce it in others', 4),
('A_PROPHECY', 'en', 'Depends on scriptures to validate their authority', 5),
-- ES
('A_PROPHECY', 'es', 'Siente necesidad de expresar su mensaje verbalmente', 1),
('A_PROPHECY', 'es', 'Tiene la capacidad de discernir los motivos y el carácter de otros', 2),
('A_PROPHECY', 'es', 'Tiene la capacidad de identificar, definir y odiar el mal', 3),
('A_PROPHECY', 'es', 'Está siempre listo a experimentar quebrantamiento para producirlo en otros', 4),
('A_PROPHECY', 'es', 'Depende de las escrituras para validar su autoridad', 5);

-- B_SERVICE
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('B_SERVICE', 'en', 'Has capacity to remember what others like or dislike', 1),
('B_SERVICE', 'en', 'Is always attentive to practical needs', 2),
('B_SERVICE', 'en', 'Driven to meet needs as soon as possible', 3),
('B_SERVICE', 'en', 'Has enough physical stamina to meet these needs without thinking of fatigue', 4),
('B_SERVICE', 'en', 'Is willing to use own resources to avoid delay', 5),
-- ES
('B_SERVICE', 'es', 'Tiene capacidad de recordar lo que a otros les gusta o no', 1),
('B_SERVICE', 'es', 'Está siempre atento a las necesidades prácticas', 2),
('B_SERVICE', 'es', 'Impulsado a suplir las necesidades lo más breve posible', 3),
('B_SERVICE', 'es', 'Tiene suficiente resistencia física para suplir estas necesidades sin pensar en el cansancio', 4),
('B_SERVICE', 'es', 'Está dispuesto a usar recursos propios para evitar demora', 5);

-- C_TEACHING
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('C_TEACHING', 'en', 'Speaks clearly in presenting the truth', 1),
('C_TEACHING', 'en', 'Has capacity to validate truth through research', 2),
('C_TEACHING', 'en', 'Presents truth in a systematic sequence', 3),
('C_TEACHING', 'en', 'Builds truth upon a structure of knowledge', 4),
('C_TEACHING', 'en', 'Feels responsible for producing accurate information', 5),
-- ES
('C_TEACHING', 'es', 'Habla con claridad en la presentación de la verdad', 1),
('C_TEACHING', 'es', 'Tiene capacidad de validar la verdad a través de investigación', 2),
('C_TEACHING', 'es', 'Presenta la verdad en una secuencia sistemática', 3),
('C_TEACHING', 'es', 'Construye la verdad sobre una estructura de conocimiento', 4),
('C_TEACHING', 'es', 'Se siente responsable por producir informaciones precisas', 5);

-- D_EXHORTATION
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('D_EXHORTATION', 'en', 'Has capacity to see unused resources in a person', 1),
('D_EXHORTATION', 'en', 'Has capacity to see how problems contribute to maturity', 2),
('D_EXHORTATION', 'en', 'Is eager to give prescribed steps of action to overcome', 3),
('D_EXHORTATION', 'en', 'Has capacity to visualize the final product of the recommendation', 4),
('D_EXHORTATION', 'en', 'Expects an immediate response to their recommendations', 5),
-- ES
('D_EXHORTATION', 'es', 'Tiene capacidad de ver recursos no utilizados en una persona', 1),
('D_EXHORTATION', 'es', 'Tiene capacidad de ver cómo los problemas contribuyen a la madurez', 2),
('D_EXHORTATION', 'es', 'Está ansioso por dar pasos prescritos de acción para vencer', 3),
('D_EXHORTATION', 'es', 'Tiene capacidad de visualizar el producto final de la recomendación', 4),
('D_EXHORTATION', 'es', 'Espera una respuesta inmediata a sus recomendaciones', 5);

-- E_GIVING
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('E_GIVING', 'en', 'Has special capacity to make money', 1),
('E_GIVING', 'en', 'Gives generously, but keeps control over how the gift is used', 2),
('E_GIVING', 'en', 'Works with a budget and keeps spending within their limits', 3),
('E_GIVING', 'en', 'Is motivated when they know their contribution will produce more resources', 4),
('E_GIVING', 'en', 'Wants their contribution to be a quality investment', 5),
-- ES
('E_GIVING', 'es', 'Tiene capacidad especial de hacer dinero', 1),
('E_GIVING', 'es', 'Da con generosidad, pero mantiene control sobre cómo el regalo es usado', 2),
('E_GIVING', 'es', 'Trabaja con un presupuesto y mantiene los gastos dentro de sus límites', 3),
('E_GIVING', 'es', 'Es motivado cuando sabe que su contribución producirá más recursos', 4),
('E_GIVING', 'es', 'Quiere que su contribución sea una inversión de calidad', 5);

-- F_LEADERSHIP
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('F_LEADERSHIP', 'en', 'Has capacity to see the total configuration of a project', 1),
('F_LEADERSHIP', 'en', 'Has capacity to break final goals into achievable tasks', 2),
('F_LEADERSHIP', 'en', 'Has urgency to organize what they see to achieve goals', 3),
('F_LEADERSHIP', 'en', 'Is able to know what resources are necessary to achieve goals', 4),
('F_LEADERSHIP', 'en', 'Has capacity to maintain loyalty of those who are directed', 5),
-- ES
('F_LEADERSHIP', 'es', 'Tiene capacidad de ver la configuración total de un proyecto', 1),
('F_LEADERSHIP', 'es', 'Tiene capacidad de dividir objetivos finales en tareas alcanzables', 2),
('F_LEADERSHIP', 'es', 'Tiene urgencia de organizar lo que ve para alcanzar objetivos', 3),
('F_LEADERSHIP', 'es', 'Es apto a saber qué recursos son necesarios para alcanzar objetivos', 4),
('F_LEADERSHIP', 'es', 'Tiene capacidad de mantener la lealtad de aquellos que son dirigidos', 5);

-- G_MERCY
INSERT INTO public.characteristics(gift_key, locale, characteristic, order_sequence) VALUES
-- EN
('G_MERCY', 'en', 'Has great capacity to feel emotional pain of others', 1),
('G_MERCY', 'en', 'Has capacity to feel when others are sad or joyful', 2),
('G_MERCY', 'en', 'Is attracted to those who are in emotional or physical pain', 3),
('G_MERCY', 'en', 'Avoids firmness with those who are suffering', 4),
('G_MERCY', 'en', 'Chooses close friends who have similar passion for others', 5),
-- ES
('G_MERCY', 'es', 'Tiene gran capacidad de sentir el dolor emocional de los otros', 1),
('G_MERCY', 'es', 'Tiene capacidad de sentir cuando otros están tristes o alegres', 2),
('G_MERCY', 'es', 'Es atraído a aquellos que están en dolor emocional o físico', 3),
('G_MERCY', 'es', 'Evita firmeza con aquellos que están sufriendo', 4),
('G_MERCY', 'es', 'Elige amigos íntimos que tienen pasión similar por los otros', 5)
ON CONFLICT (gift_key, locale, order_sequence) DO UPDATE SET characteristic = EXCLUDED.characteristic;
