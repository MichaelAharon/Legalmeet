-- Migration 003: Preserve immutable NDA signatures
-- ============================================
--
-- NDA signatures are legal/audit records and must not be silently removed when
-- their parent meeting or participant is deleted. Block those deletes instead.

ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_meeting_id_fkey,
  ADD CONSTRAINT nda_signatures_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_participant_id_fkey,
  ADD CONSTRAINT nda_signatures_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES public.meeting_participants(id) ON DELETE RESTRICT;
