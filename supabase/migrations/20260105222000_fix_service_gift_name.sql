-- =========================================================
-- FIX: Corrigir nome do dom B_SERVICE
-- De "MINISTÉRIO" para "SERVIÇO" (conforme PDFs)
-- =========================================================

UPDATE public.spiritual_gifts
SET name = 'Serviço'
WHERE gift_key = 'B_SERVICE' AND locale = 'pt';

UPDATE public.spiritual_gifts
SET name = 'Service'
WHERE gift_key = 'B_SERVICE' AND locale = 'en';

UPDATE public.spiritual_gifts
SET name = 'Servicio'
WHERE gift_key = 'B_SERVICE' AND locale = 'es';

COMMENT ON TABLE public.spiritual_gifts IS 'B_SERVICE corrigido para "Serviço" conforme PDFs fonte';
