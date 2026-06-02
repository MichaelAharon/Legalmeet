-- ============================================
-- Migration 001: Initial Schema
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS (extends auth.users)
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  company         TEXT,
  role            TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  timezone        TEXT DEFAULT 'UTC',
  preferences     JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE public.projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_owner ON public.projects(owner_id);

-- PROJECT MEMBERS
CREATE TABLE public.project_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  UNIQUE(project_id, user_id)
);
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_members_project ON public.project_members(project_id);

-- NDA TEMPLATES
CREATE TABLE public.nda_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  content         TEXT NOT NULL,
  template_vars   JSONB DEFAULT '[]',
  is_default      BOOLEAN DEFAULT FALSE,
  version         INTEGER DEFAULT 1,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_nda_templates_owner ON public.nda_templates(owner_id);

-- MEETINGS
CREATE TABLE public.meetings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  host_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  scheduled_at    TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  duration_seconds INTEGER,
  status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  room_name       TEXT,
  room_url        TEXT,
  nda_template_id UUID REFERENCES public.nda_templates(id) ON DELETE SET NULL,
  nda_required    BOOLEAN DEFAULT TRUE,
  recording_enabled BOOLEAN DEFAULT TRUE,
  transcription_enabled BOOLEAN DEFAULT TRUE,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_meetings_host ON public.meetings(host_id);
CREATE INDEX idx_meetings_project ON public.meetings(project_id);
CREATE INDEX idx_meetings_status ON public.meetings(status);
CREATE INDEX idx_meetings_scheduled ON public.meetings(scheduled_at);

-- MEETING PARTICIPANTS
CREATE TABLE public.meeting_participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  display_name    TEXT,
  role            TEXT DEFAULT 'participant' CHECK (role IN ('host', 'participant', 'observer')),
  joined_at       TIMESTAMPTZ,
  left_at         TIMESTAMPTZ,
  status          TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'declined')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_participants_meeting ON public.meeting_participants(meeting_id);
CREATE INDEX idx_participants_user ON public.meeting_participants(user_id);

-- NDA SIGNATURES (immutable legal records)
CREATE TABLE public.nda_signatures (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES public.meeting_participants(id) ON DELETE CASCADE,
  template_id     UUID NOT NULL REFERENCES public.nda_templates(id) ON DELETE RESTRICT,
  nda_content_snapshot TEXT NOT NULL,
  signature_data  TEXT NOT NULL,
  signature_hash  TEXT NOT NULL,
  signer_email    TEXT NOT NULL,
  signer_name     TEXT NOT NULL,
  signer_ip       TEXT,
  user_agent      TEXT,
  signed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_token UUID DEFAULT uuid_generate_v4(),
  verified        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_signatures_meeting ON public.nda_signatures(meeting_id);
CREATE INDEX idx_signatures_participant ON public.nda_signatures(participant_id);
CREATE INDEX idx_signatures_token ON public.nda_signatures(verification_token);

-- RECORDINGS
CREATE TABLE public.recordings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  provider_id     TEXT,
  storage_path    TEXT,
  storage_url     TEXT,
  duration_seconds INTEGER,
  file_size_bytes  BIGINT,
  mime_type       TEXT DEFAULT 'video/mp4',
  status          TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error', 'deleted')),
  encryption_key_id TEXT,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_recordings_meeting ON public.recordings(meeting_id);
CREATE INDEX idx_recordings_status ON public.recordings(status);

-- TRANSCRIPTS
CREATE TABLE public.transcripts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  recording_id    UUID REFERENCES public.recordings(id) ON DELETE SET NULL,
  content         JSONB NOT NULL DEFAULT '[]',
  full_text       TEXT,
  language        TEXT DEFAULT 'en',
  provider        TEXT DEFAULT 'deepgram',
  model           TEXT DEFAULT 'nova-3',
  status          TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'error')),
  word_count      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transcripts_meeting ON public.transcripts(meeting_id);

-- DOCUMENT BUNDLES
CREATE TABLE public.document_bundles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id      UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  pdf_storage_path TEXT,
  pdf_url         TEXT,
  includes_nda    BOOLEAN DEFAULT FALSE,
  includes_recording BOOLEAN DEFAULT FALSE,
  includes_transcript BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'error')),
  generated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bundles_meeting ON public.document_bundles(meeting_id);

-- AUDIT LOG
CREATE TABLE public.audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  details         JSONB DEFAULT '{}',
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_action ON public.audit_log(action);
CREATE INDEX idx_audit_created ON public.audit_log(created_at);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.nda_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.recordings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transcripts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- AUTO-CREATE PROFILE ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GDPR DELETE
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
