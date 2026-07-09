-- ============================================
-- Migration 003: Secure GDPR deletion RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM target_user_id AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to delete user data'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (target_user_id, 'user.gdpr_delete', 'user', target_user_id,
    jsonb_build_object('deleted_at', NOW()::text));
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.delete_user_data(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO authenticated, service_role;
