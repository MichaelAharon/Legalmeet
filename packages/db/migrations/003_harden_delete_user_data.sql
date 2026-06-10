-- ============================================
-- Migration 003: Harden GDPR Delete RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR (SELECT auth.uid()) <> target_user_id THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (target_user_id, 'user.gdpr_delete', 'user', target_user_id,
    jsonb_build_object('deleted_at', NOW()::text));
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO authenticated;
