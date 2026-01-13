-- Allow admins/managers to manage quiz sessions; regular users remain limited to one completed test and cannot delete

-- Helper to check admin/manager role
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN COALESCE(public.is_user_admin_safe(), false) OR COALESCE(public.is_user_manager(), false);
END;
$$;

-- Update trigger to prevent multiple quiz sessions for regular users, allow admin/manager bypass
CREATE OR REPLACE FUNCTION public.prevent_multiple_quiz_sessions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Admins/managers may bypass the single-test restriction
  IF public.is_admin_or_manager() THEN
    RETURN NEW;
  END IF;

  -- Block if user already has a completed session (different from current row)
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

-- Update delete protection: allow admin/manager to delete; others blocked
CREATE OR REPLACE FUNCTION public.prevent_quiz_session_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_admin_or_manager() THEN
    RETURN OLD; -- allow deletion
  END IF;

  RAISE EXCEPTION 'A exclusão de testes foi desabilitada.' USING ERRCODE = 'P0001';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_quiz_session_delete ON public.quiz_sessions;
CREATE TRIGGER trg_prevent_quiz_session_delete
BEFORE DELETE ON public.quiz_sessions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_quiz_session_delete();

-- Restore delete_quiz_session with admin/manager capability; block regular users
CREATE OR REPLACE FUNCTION public.delete_quiz_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_requesting_user_id UUID;
BEGIN
  v_requesting_user_id := auth.uid();

  IF v_requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO v_user_id
  FROM quiz_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Admins/managers can delete any session; regular users cannot delete
  IF NOT public.is_admin_or_manager() THEN
    RAISE EXCEPTION 'Permission denied: only admins or managers can deletar resultados';
  END IF;

  DELETE FROM answers
  WHERE session_id = p_session_id;

  DELETE FROM quiz_sessions
  WHERE id = p_session_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.delete_quiz_session IS 'Admins/managers can delete quiz sessions and answers; regular users are blocked';

REVOKE EXECUTE ON FUNCTION public.delete_quiz_session(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_quiz_session(UUID) TO authenticated;
