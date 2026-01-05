-- =========================================================
-- FIX: AUTO-CREATE PROFILE TRIGGER
-- Garante que todo usuário tenha um profile automaticamente
-- =========================================================

-- 1. Criar função para auto-criar profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Inserir profile para o novo usuário
  INSERT INTO public.profiles (id, email, full_name, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 2. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Criar profiles para usuários existentes que não têm
INSERT INTO public.profiles (id, email, full_name, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Verificação
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM auth.users;
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;

  missing_count := users_count - profiles_count;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'PROFILE AUTO-CREATE STATUS:';
  RAISE NOTICE '  Total users: %', users_count;
  RAISE NOTICE '  Total profiles: %', profiles_count;
  RAISE NOTICE '  Missing profiles: %', missing_count;

  IF missing_count = 0 THEN
    RAISE NOTICE '  ✅ All users have profiles!';
  ELSE
    RAISE WARNING '  ⚠️ Some users still missing profiles!';
  END IF;

  RAISE NOTICE '========================================';
END $$;
