-- =========================================================
-- CARREGAR DADOS - MATRIZ DE PESOS E 140 PERGUNTAS
-- Execute TERCEIRO: Carrega matriz de pesos e perguntas base
-- =========================================================

-- 1. INSERIR MATRIZ DE PESOS COMPLETA
INSERT INTO public.decision_weights (gift, source, pclass, multiplier, description) VALUES
-- P1 - PRIORIDADE ALTA (100% - 90%)
('A_PROPHECY', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais da profecia'),
('A_PROPHECY', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais da profecia'),
('A_PROPHECY', 'DANGER', 'P1', 0.900, 'Perigos críticos da profecia'),
('A_PROPHECY', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos da profecia'),
('A_PROPHECY', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes da profecia'),

('B_SERVICE', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais do serviço'),
('B_SERVICE', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais do serviço'),
('B_SERVICE', 'DANGER', 'P1', 0.900, 'Perigos críticos do serviço'),
('B_SERVICE', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos do serviço'),
('B_SERVICE', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes do serviço'),

('C_TEACHING', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais do ensino'),
('C_TEACHING', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais do ensino'),
('C_TEACHING', 'DANGER', 'P1', 0.900, 'Perigos críticos do ensino'),
('C_TEACHING', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos do ensino'),
('C_TEACHING', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes do ensino'),

('D_EXHORTATION', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais da exortação'),
('D_EXHORTATION', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais da exortação'),
('D_EXHORTATION', 'DANGER', 'P1', 0.900, 'Perigos críticos da exortação'),
('D_EXHORTATION', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos da exortação'),
('D_EXHORTATION', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes da exortação'),

('E_GIVING', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais da contribuição'),
('E_GIVING', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais da contribuição'),
('E_GIVING', 'DANGER', 'P1', 0.900, 'Perigos críticos da contribuição'),
('E_GIVING', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos da contribuição'),
('E_GIVING', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes da contribuição'),

('F_LEADERSHIP', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais da liderança'),
('F_LEADERSHIP', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais da liderança'),
('F_LEADERSHIP', 'DANGER', 'P1', 0.900, 'Perigos críticos da liderança'),
('F_LEADERSHIP', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos da liderança'),
('F_LEADERSHIP', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes da liderança'),

('G_MERCY', 'QUALITY', 'P1', 1.000, 'Qualidades fundamentais da misericórdia'),
('G_MERCY', 'CHARACTERISTIC', 'P1', 0.950, 'Características principais da misericórdia'),
('G_MERCY', 'DANGER', 'P1', 0.900, 'Perigos críticos da misericórdia'),
('G_MERCY', 'MISUNDERSTANDING', 'P1', 0.900, 'Mal-entendidos críticos da misericórdia'),
('G_MERCY', 'OTHER', 'P1', 0.950, 'Outros aspectos importantes da misericórdia'),

-- P2 - PRIORIDADE MÉDIA (75% - 67.5%)
('A_PROPHECY', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias da profecia'),
('A_PROPHECY', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias da profecia'),
('A_PROPHECY', 'DANGER', 'P2', 0.675, 'Perigos moderados da profecia'),
('A_PROPHECY', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados da profecia'),
('A_PROPHECY', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários da profecia'),

('B_SERVICE', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias do serviço'),
('B_SERVICE', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias do serviço'),
('B_SERVICE', 'DANGER', 'P2', 0.675, 'Perigos moderados do serviço'),
('B_SERVICE', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados do serviço'),
('B_SERVICE', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários do serviço'),

('C_TEACHING', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias do ensino'),
('C_TEACHING', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias do ensino'),
('C_TEACHING', 'DANGER', 'P2', 0.675, 'Perigos moderados do ensino'),
('C_TEACHING', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados do ensino'),
('C_TEACHING', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários do ensino'),

('D_EXHORTATION', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias da exortação'),
('D_EXHORTATION', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias da exortação'),
('D_EXHORTATION', 'DANGER', 'P2', 0.675, 'Perigos moderados da exortação'),
('D_EXHORTATION', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados da exortação'),
('D_EXHORTATION', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários da exortação'),

('E_GIVING', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias da contribuição'),
('E_GIVING', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias da contribuição'),
('E_GIVING', 'DANGER', 'P2', 0.675, 'Perigos moderados da contribuição'),
('E_GIVING', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados da contribuição'),
('E_GIVING', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários da contribuição'),

('F_LEADERSHIP', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias da liderança'),
('F_LEADERSHIP', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias da liderança'),
('F_LEADERSHIP', 'DANGER', 'P2', 0.675, 'Perigos moderados da liderança'),
('F_LEADERSHIP', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados da liderança'),
('F_LEADERSHIP', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários da liderança'),

('G_MERCY', 'QUALITY', 'P2', 0.750, 'Qualidades secundárias da misericórdia'),
('G_MERCY', 'CHARACTERISTIC', 'P2', 0.713, 'Características secundárias da misericórdia'),
('G_MERCY', 'DANGER', 'P2', 0.675, 'Perigos moderados da misericórdia'),
('G_MERCY', 'MISUNDERSTANDING', 'P2', 0.675, 'Mal-entendidos moderados da misericórdia'),
('G_MERCY', 'OTHER', 'P2', 0.713, 'Outros aspectos secundários da misericórdia'),

-- P3 - PRIORIDADE BAIXA (50% - 45%)
('A_PROPHECY', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias da profecia'),
('A_PROPHECY', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias da profecia'),
('A_PROPHECY', 'DANGER', 'P3', 0.450, 'Perigos menores da profecia'),
('A_PROPHECY', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores da profecia'),
('A_PROPHECY', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários da profecia'),

('B_SERVICE', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias do serviço'),
('B_SERVICE', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias do serviço'),
('B_SERVICE', 'DANGER', 'P3', 0.450, 'Perigos menores do serviço'),
('B_SERVICE', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores do serviço'),
('B_SERVICE', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários do serviço'),

('C_TEACHING', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias do ensino'),
('C_TEACHING', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias do ensino'),
('C_TEACHING', 'DANGER', 'P3', 0.450, 'Perigos menores do ensino'),
('C_TEACHING', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores do ensino'),
('C_TEACHING', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários do ensino'),

('D_EXHORTATION', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias da exortação'),
('D_EXHORTATION', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias da exortação'),
('D_EXHORTATION', 'DANGER', 'P3', 0.450, 'Perigos menores da exortação'),
('D_EXHORTATION', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores da exortação'),
('D_EXHORTATION', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários da exortação'),

('E_GIVING', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias da contribuição'),
('E_GIVING', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias da contribuição'),
('E_GIVING', 'DANGER', 'P3', 0.450, 'Perigos menores da contribuição'),
('E_GIVING', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores da contribuição'),
('E_GIVING', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários da contribuição'),

('F_LEADERSHIP', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias da liderança'),
('F_LEADERSHIP', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias da liderança'),
('F_LEADERSHIP', 'DANGER', 'P3', 0.450, 'Perigos menores da liderança'),
('F_LEADERSHIP', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores da liderança'),
('F_LEADERSHIP', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários da liderança'),

('G_MERCY', 'QUALITY', 'P3', 0.500, 'Qualidades terciárias da misericórdia'),
('G_MERCY', 'CHARACTERISTIC', 'P3', 0.475, 'Características terciárias da misericórdia'),
('G_MERCY', 'DANGER', 'P3', 0.450, 'Perigos menores da misericórdia'),
('G_MERCY', 'MISUNDERSTANDING', 'P3', 0.450, 'Mal-entendidos menores da misericórdia'),
('G_MERCY', 'OTHER', 'P3', 0.475, 'Outros aspectos terciários da misericórdia');

-- 2. LOG DA OPERAÇÃO
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('02_load_weights', 'Matriz de pesos carregada (105 configurações)', NOW());

-- 3. VERIFICAÇÃO DOS PESOS
SELECT 
  'Matriz de pesos' as status,
  COUNT(*) as total_configuracoes,
  COUNT(DISTINCT gift) as gifts_distintos,
  COUNT(DISTINCT source) as sources_distintos,
  COUNT(DISTINCT pclass) as classes_distintas
FROM public.decision_weights;

-- Matriz de pesos carregada com 105 configurações