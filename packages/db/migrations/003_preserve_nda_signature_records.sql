-- ============================================
-- Migration 003: Preserve immutable NDA signatures
-- ============================================

-- NDA signatures are legal evidence and must not be deleted as a side effect of
-- deleting a meeting or participant.
ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_meeting_id_fkey,
  ADD CONSTRAINT nda_signatures_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_participant_id_fkey,
  ADD CONSTRAINT nda_signatures_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES public.meeting_participants(id) ON DELETE RESTRICT;
