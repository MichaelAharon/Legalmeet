-- ============================================
-- Migration 002: RLS Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nda_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

-- PROJECTS
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT
  USING (owner_id = (SELECT auth.uid()) OR id IN (SELECT project_id FROM public.project_members WHERE user_id = (SELECT auth.uid())));
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can update projects" ON public.projects FOR UPDATE USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "Owners can delete projects" ON public.projects FOR DELETE USING (owner_id = (SELECT auth.uid()));

-- PROJECT MEMBERS
CREATE POLICY "Members can view memberships" ON public.project_members FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR project_id IN (SELECT id FROM public.projects WHERE owner_id = (SELECT auth.uid())));
CREATE POLICY "Owners can manage members" ON public.project_members FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = (SELECT auth.uid())));
CREATE POLICY "Owners can remove members" ON public.project_members FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = (SELECT auth.uid())));

-- NDA TEMPLATES
CREATE POLICY "Users can view own templates" ON public.nda_templates FOR SELECT USING (owner_id = (SELECT auth.uid()) OR is_default = TRUE);
CREATE POLICY "Users can create templates" ON public.nda_templates FOR INSERT WITH CHECK (owner_id = (SELECT auth.uid()));
CREATE POLICY "Users can update own templates" ON public.nda_templates FOR UPDATE USING (owner_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own templates" ON public.nda_templates FOR DELETE USING (owner_id = (SELECT auth.uid()));

-- MEETINGS
CREATE POLICY "Users can view meetings they host or participate in" ON public.meetings FOR SELECT
  USING (host_id = (SELECT auth.uid()) OR id IN (SELECT meeting_id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())));
CREATE POLICY "Users can create meetings" ON public.meetings FOR INSERT WITH CHECK (host_id = (SELECT auth.uid()));
CREATE POLICY "Hosts can update meetings" ON public.meetings FOR UPDATE USING (host_id = (SELECT auth.uid()));
CREATE POLICY "Hosts can delete meetings" ON public.meetings FOR DELETE USING (host_id = (SELECT auth.uid()));

-- MEETING PARTICIPANTS
CREATE POLICY "Hosts and participants can view" ON public.meeting_participants FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())));
CREATE POLICY "Hosts can add participants" ON public.meeting_participants FOR INSERT
  WITH CHECK (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())));

-- NDA SIGNATURES (immutable - no UPDATE/DELETE)
CREATE POLICY "Participants can view signatures" ON public.nda_signatures FOR SELECT
  USING (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid()))
    OR participant_id IN (SELECT id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())));
CREATE POLICY "Participants can sign" ON public.nda_signatures FOR INSERT
  WITH CHECK (participant_id IN (SELECT id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())));

-- RECORDINGS
CREATE POLICY "Meeting members can view recordings" ON public.recordings FOR SELECT
  USING (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())
    UNION SELECT meeting_id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())));

-- TRANSCRIPTS
CREATE POLICY "Meeting members can view transcripts" ON public.transcripts FOR SELECT
  USING (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())
    UNION SELECT meeting_id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())));

-- DOCUMENT BUNDLES
CREATE POLICY "Meeting members can view bundles" ON public.document_bundles FOR SELECT
  USING (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = (SELECT auth.uid())
    UNION SELECT meeting_id FROM public.meeting_participants WHERE user_id = (SELECT auth.uid())));

-- AUDIT LOG
CREATE POLICY "Users can view own audit entries" ON public.audit_log FOR SELECT USING (user_id = (SELECT auth.uid()));
