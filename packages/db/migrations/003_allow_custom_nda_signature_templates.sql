-- ============================================
-- Migration 003: Allow custom NDA signatures
-- ============================================

-- Custom NDAs are stored as immutable content snapshots on the signature row
-- and do not always have a backing template record.
ALTER TABLE public.nda_signatures
  ALTER COLUMN template_id DROP NOT NULL;
