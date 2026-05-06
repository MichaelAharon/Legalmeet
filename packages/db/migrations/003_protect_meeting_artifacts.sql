-- Prevent hard-deleting meetings that already have legal or meeting artifacts.
-- These records are part of the meeting audit trail and must not be removed by
-- an accidental or unauthorized meeting delete.

ALTER TABLE public.nda_signatures
  DROP CONSTRAINT IF EXISTS nda_signatures_meeting_id_fkey,
  ADD CONSTRAINT nda_signatures_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.recordings
  DROP CONSTRAINT IF EXISTS recordings_meeting_id_fkey,
  ADD CONSTRAINT recordings_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.transcripts
  DROP CONSTRAINT IF EXISTS transcripts_meeting_id_fkey,
  ADD CONSTRAINT transcripts_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.document_bundles
  DROP CONSTRAINT IF EXISTS document_bundles_meeting_id_fkey,
  ADD CONSTRAINT document_bundles_meeting_id_fkey
    FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;
