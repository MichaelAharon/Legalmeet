-- ============================================
-- Migration 003: Security Hardening
-- ============================================

-- Lock down SECURITY DEFINER helpers so elevated execution cannot be hijacked
-- through the caller's search_path.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- The GDPR deletion RPC runs with definer privileges. Require the caller to be
-- deleting their own account unless the request uses the Supabase service role.
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID := (SELECT auth.uid());
  caller_role TEXT := (SELECT auth.role());
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id is required' USING ERRCODE = '22004';
  END IF;

  IF caller_role IS DISTINCT FROM 'service_role'
     AND (caller_id IS NULL OR caller_id <> target_user_id) THEN
    RAISE EXCEPTION 'not authorized to delete this user'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (target_user_id, 'user.gdpr_delete', 'user', target_user_id,
    jsonb_build_object('deleted_at', NOW()::text));

  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM authenticated;
REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO service_role;

-- Users may update their own profile metadata, but not grant themselves app
-- roles such as admin through the broad profile UPDATE policy.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE((SELECT auth.role()), 'service_role') <> 'service_role' THEN
    RAISE EXCEPTION 'profile role cannot be changed by the current user'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();

-- A participant signature must belong to the same meeting as the participant.
-- Without this, a participant from one meeting can pollute another meeting's
-- legal signature record by mixing participant_id and meeting_id values.
DROP POLICY IF EXISTS "Participants can sign" ON public.nda_signatures;
CREATE POLICY "Participants can sign" ON public.nda_signatures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meeting_participants mp
      WHERE mp.id = nda_signatures.participant_id
        AND mp.meeting_id = nda_signatures.meeting_id
        AND mp.user_id = (SELECT auth.uid())
    )
  );
