-- =========================================================
-- FRESH START - DROP E RECRIAR SCHEMA COMPLETO
-- Execute PRIMEIRO: Limpa tudo e recria do zero
-- CUIDADO: Isto remove TODOS os dados existentes!
-- =========================================================

-- 1. BACKUP DE EMERGÊNCIA (se houver dados importantes)
-- Descomente as linhas abaixo se quiser salvar dados específicos antes de dropar

/*
-- Salvar usuários/profiles se existirem
CREATE TABLE temp_backup_profiles AS 
SELECT * FROM public.profiles WHERE true;

-- Salvar algumas sessões importantes se existirem  
CREATE TABLE temp_backup_sessions AS
SELECT * FROM public.quiz_sessions WHERE completed_at IS NOT NULL LIMIT 100;
*/

-- 2. DROPAR SCHEMA PÚBLICO COMPLETAMENTE
DROP SCHEMA public CASCADE;

-- 3. RECRIAR SCHEMA PÚBLICO LIMPO
CREATE SCHEMA public;

-- 4. RESTAURAR PERMISSÕES PADRÃO
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 5. COMENTÁRIO
COMMENT ON SCHEMA public IS 'Schema público recriado para sistema multilíngue de dons espirituais';

-- 6. CRIAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para similaridade de texto

-- 7. FUNÇÃO BÁSICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END$$;

-- 8. TABELA DE LOG PARA MIGRAÇÕES
CREATE TABLE public.migration_log (
  id SERIAL PRIMARY KEY,
  step VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- 9. LOG DESTA OPERAÇÃO
INSERT INTO public.migration_log (step, description, executed_at) 
VALUES ('00_fresh_start', 'Schema público dropado e recriado - INÍCIO LIMPO', NOW());

-- 10. VERIFICAÇÃO
SELECT 
  table_schema,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public'
GROUP BY table_schema;

SELECT 'Schema público limpo - Pronto para migração!' as status;

-- Schema público limpo e pronto para migrations