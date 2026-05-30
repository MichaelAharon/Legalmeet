-- ============================================
-- Migration 003: Preserve immutable NDA signatures
-- ============================================

-- NDA signatures are legal evidence and must not be deleted as a side effect of
-- deleting a meeting, participant, or user profile.
ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_meeting_id_fkey,
  ADD CONSTRAINT nda_signatures_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_participant_id_fkey,
  ADD CONSTRAINT nda_signatures_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES public.meeting_participants(id) ON DELETE RESTRICT;

-- Preserve legal records during account deletion. If the user is attached to
-- signed NDA evidence, anonymize the profile row instead of deleting the parent
-- row that the legal record depends on.
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  has_legal_records BOOLEAN;
BEGIN
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (target_user_id, 'user.gdpr_delete', 'user', target_user_id,
    jsonb_build_object('deleted_at', NOW()::text));

  SELECT EXISTS (
    SELECT 1
    FROM public.nda_signatures ns
    JOIN public.meetings m ON m.id = ns.meeting_id
    WHERE m.host_id = target_user_id
    UNION
    SELECT 1
    FROM public.nda_signatures ns
    JOIN public.meeting_participants mp ON mp.id = ns.participant_id
    WHERE mp.user_id = target_user_id
  ) INTO has_legal_records;

  IF has_legal_records THEN
    UPDATE public.profiles
    SET
      email = 'deleted-user-' || target_user_id::text || '@deleted.local',
      full_name = NULL,
      avatar_url = NULL,
      company = NULL,
      preferences = '{}'::jsonb,
      updated_at = NOW()
    WHERE id = target_user_id;
  ELSE
    DELETE FROM public.profiles WHERE id = target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
