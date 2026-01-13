-- Enforce a single completed quiz per user and disable quiz deletion

-- 1) Prevent starting/completing a new quiz if the user already has a completed session
CREATE OR REPLACE FUNCTION public.prevent_multiple_quiz_sessions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Block any insert/update if the user already has a completed quiz (except when operating on that same row)
  IF EXISTS (
    SELECT 1
    FROM quiz_sessions qs
    WHERE qs.user_id = NEW.user_id
      AND qs.is_completed = true
      AND qs.id <> COALESCE(NEW.id, qs.id)
  ) THEN
    RAISE EXCEPTION 'Você já completou o teste e não pode iniciar um novo.' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_multiple_quiz_sessions ON public.quiz_sessions;
CREATE TRIGGER trg_prevent_multiple_quiz_sessions
BEFORE INSERT OR UPDATE ON public.quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_multiple_quiz_sessions();

-- 2) Hard-disable deletion of quiz sessions (API and direct deletes)
CREATE OR REPLACE FUNCTION public.prevent_quiz_session_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE EXCEPTION 'A exclusão de testes foi desabilitada.' USING ERRCODE = 'P0001';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_quiz_session_delete ON public.quiz_sessions;
CREATE TRIGGER trg_prevent_quiz_session_delete
BEFORE DELETE ON public.quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_quiz_session_delete();

-- 3) Override RPC delete_quiz_session to always error out
CREATE OR REPLACE FUNCTION public.delete_quiz_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'A exclusão de testes foi desabilitada.' USING ERRCODE = 'P0001';
  RETURN false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_quiz_session(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_quiz_session(UUID) TO authenticated;
