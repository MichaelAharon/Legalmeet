-- ============================================
-- Migration 003: Protect Meeting Artifacts
-- ============================================

BEGIN;

-- Signed NDAs, recordings, transcripts, and generated bundles are retained records.
-- Meeting deletion must be blocked while any of these artifacts still reference it.
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

COMMIT;
