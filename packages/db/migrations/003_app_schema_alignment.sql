-- ============================================
-- Migration 003: Align app schema with API contract
-- ============================================

-- The API and generated database types already depend on these fields and
-- tables. Keep this migration additive so existing deployments can be brought
-- forward without rewriting prior migrations.

-- PROJECT HIERARCHY
CREATE TABLE IF NOT EXISTS public.sub_projects (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id            UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_sub_project_id UUID REFERENCES public.sub_projects(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sub_projects_project ON public.sub_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_sub_projects_parent ON public.sub_projects(parent_sub_project_id);

ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS sub_project_id UUID REFERENCES public.sub_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nda_customized_content TEXT,
  ADD COLUMN IF NOT EXISTS host_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invites_sent_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_meetings_sub_project ON public.meetings(sub_project_id);

ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS meetings_status_check;
ALTER TABLE public.meetings
  ADD CONSTRAINT meetings_status_check
  CHECK (status IN ('scheduled', 'awaiting_signatures', 'ready', 'in_progress', 'completed', 'cancelled'));

ALTER TABLE public.meeting_participants
  ADD COLUMN IF NOT EXISTS nda_signed_at TIMESTAMPTZ;

ALTER TABLE public.nda_templates
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Preserve signed NDA records. They are immutable legal records and should
-- block destructive deletes instead of disappearing through cascades.
ALTER TABLE public.nda_signatures DROP CONSTRAINT IF EXISTS nda_signatures_meeting_id_fkey;
ALTER TABLE public.nda_signatures
  ADD CONSTRAINT nda_signatures_meeting_id_fkey
  FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE RESTRICT;

ALTER TABLE public.nda_signatures DROP CONSTRAINT IF EXISTS nda_signatures_participant_id_fkey;
ALTER TABLE public.nda_signatures
  ADD CONSTRAINT nda_signatures_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES public.meeting_participants(id) ON DELETE RESTRICT;

-- DOCUMENT AND ANALYSIS FEATURES
CREATE TABLE IF NOT EXISTS public.document_versions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type   TEXT NOT NULL CHECK (document_type IN ('nda_template', 'nda_customized')),
  document_id     UUID NOT NULL,
  version_number  INTEGER NOT NULL CHECK (version_number > 0),
  content         TEXT NOT NULL,
  change_summary  TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_type, document_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON public.document_versions(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON public.document_versions(created_by);

CREATE TABLE IF NOT EXISTS public.nda_analyses (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id        UUID REFERENCES public.meetings(id) ON DELETE CASCADE,
  template_id       UUID REFERENCES public.nda_templates(id) ON DELETE SET NULL,
  nda_content       TEXT NOT NULL,
  overall_risk      TEXT CHECK (overall_risk IN ('low', 'medium', 'high')),
  risks             JSONB DEFAULT '[]',
  missing_clauses   JSONB DEFAULT '[]',
  summary           TEXT,
  generated_by      TEXT NOT NULL,
  model             TEXT NOT NULL,
  status            TEXT DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'completed', 'error')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nda_analyses_meeting ON public.nda_analyses(meeting_id);
CREATE INDEX IF NOT EXISTS idx_nda_analyses_template ON public.nda_analyses(template_id);

CREATE TABLE IF NOT EXISTS public.meeting_summaries (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id     UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  summary        TEXT NOT NULL,
  key_decisions  JSONB DEFAULT '[]',
  action_items   JSONB DEFAULT '[]',
  key_topics     JSONB DEFAULT '[]',
  sentiment      TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  generated_by   TEXT NOT NULL,
  model          TEXT NOT NULL,
  status         TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'error')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id)
);
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_meeting ON public.meeting_summaries(meeting_id);

-- GUEST ACCESS
CREATE TABLE IF NOT EXISTS public.guest_tokens (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id     UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.meeting_participants(id) ON DELETE CASCADE,
  token          TEXT NOT NULL UNIQUE,
  email          TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guest_tokens_meeting ON public.guest_tokens(meeting_id);
CREATE INDEX IF NOT EXISTS idx_guest_tokens_participant ON public.guest_tokens(participant_id);
CREATE INDEX IF NOT EXISTS idx_guest_tokens_token ON public.guest_tokens(token);

-- NOTIFICATIONS, TAGS, AND BILLING
CREATE TABLE IF NOT EXISTS public.notifications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  title          TEXT NOT NULL,
  body           TEXT NOT NULL,
  resource_type  TEXT,
  resource_id    UUID,
  read           BOOLEAN DEFAULT FALSE,
  email_sent     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, read);

CREATE TABLE IF NOT EXISTS public.tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6b7280',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, name)
);
CREATE INDEX IF NOT EXISTS idx_tags_owner ON public.tags(owner_id);

CREATE TABLE IF NOT EXISTS public.resource_tags (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_id         UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  resource_type  TEXT NOT NULL CHECK (resource_type IN ('project', 'meeting', 'document')),
  resource_id    UUID NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tag_id, resource_type, resource_id)
);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON public.resource_tags(resource_type, resource_id);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan                   TEXT DEFAULT 'solo' CHECK (plan IN ('solo', 'team', 'business', 'enterprise')),
  status                 TEXT DEFAULT 'trialing' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  meetings_used          INTEGER DEFAULT 0 CHECK (meetings_used >= 0),
  meetings_limit         INTEGER CHECK (meetings_limit IS NULL OR meetings_limit >= 0),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);

-- UPDATED_AT TRIGGERS FOR NEW TABLES
DROP TRIGGER IF EXISTS set_updated_at ON public.sub_projects;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sub_projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.meeting_summaries;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.meeting_summaries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.subscriptions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS AND POLICIES FOR NEW USER-SCOPED TABLES
ALTER TABLE public.sub_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view sub-projects" ON public.sub_projects FOR SELECT
  USING (project_id IN (
    SELECT id FROM public.projects WHERE owner_id = (SELECT auth.uid())
    UNION SELECT project_id FROM public.project_members WHERE user_id = (SELECT auth.uid())
  ));
CREATE POLICY "Project owners can manage sub-projects" ON public.sub_projects FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = (SELECT auth.uid())))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = (SELECT auth.uid())));

CREATE POLICY "Meeting members can view analyses" ON public.nda_analyses FOR SELECT
  USING (
    meeting_id IS NULL
    OR meeting_id IN (
      SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())
      UNION SELECT meeting_id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Meeting members can view summaries" ON public.meeting_summaries FOR SELECT
  USING (meeting_id IN (
    SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())
    UNION SELECT meeting_id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())
  ));

CREATE POLICY "Meeting hosts can manage guest tokens" ON public.guest_tokens FOR ALL
  USING (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())))
  WITH CHECK (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())));

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can manage own tags" ON public.tags FOR ALL
  USING (owner_id = (SELECT auth.uid())) WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "Users can manage own resource tags" ON public.resource_tags FOR ALL
  USING (tag_id IN (SELECT id FROM public.tags WHERE owner_id = (SELECT auth.uid())))
  WITH CHECK (tag_id IN (SELECT id FROM public.tags WHERE owner_id = (SELECT auth.uid())));

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
