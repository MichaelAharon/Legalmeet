export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: 'admin' | 'member' | 'viewer';
  timezone: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'deleted';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ProjectMember = {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_at: string;
  accepted_at: string | null;
};

export type NDATemplate = {
  id: string;
  owner_id: string;
  name: string;
  content: string;
  template_vars: Array<{ name: string; label: string; type: string; required: boolean }>;
  is_default: boolean;
  version: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
};

export type SubProject = {
  id: string;
  project_id: string;
  parent_sub_project_id: string | null;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
};

export type Meeting = {
  id: string;
  project_id: string | null;
  sub_project_id: string | null;
  host_id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  status: 'scheduled' | 'awaiting_signatures' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  room_name: string | null;
  room_url: string | null;
  nda_template_id: string | null;
  nda_required: boolean;
  nda_customized_content: string | null;
  host_signed_at: string | null;
  invites_sent_at: string | null;
  recording_enabled: boolean;
  transcription_enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type MeetingParticipant = {
  id: string;
  meeting_id: string;
  user_id: string | null;
  email: string;
  display_name: string | null;
  role: 'host' | 'participant' | 'observer';
  joined_at: string | null;
  left_at: string | null;
  nda_signed_at: string | null;
  status: 'invited' | 'joined' | 'left' | 'declined';
  created_at: string;
};

export type NDASignature = {
  id: string;
  meeting_id: string;
  participant_id: string;
  template_id: string | null;
  nda_content_snapshot: string;
  signature_data: string;
  signature_hash: string;
  signer_email: string;
  signer_name: string;
  signer_ip: string | null;
  user_agent: string | null;
  signed_at: string;
  verification_token: string;
  verified: boolean;
  created_at: string;
};

export type Recording = {
  id: string;
  meeting_id: string;
  provider_id: string | null;
  storage_path: string | null;
  storage_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  mime_type: string;
  status: 'processing' | 'ready' | 'error' | 'deleted';
  encryption_key_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Transcript = {
  id: string;
  meeting_id: string;
  recording_id: string | null;
  content: Array<{ speaker: string; text: string; timestamp: string; confidence: number }>;
  full_text: string | null;
  language: string;
  provider: string;
  model: string;
  status: 'in_progress' | 'completed' | 'error';
  word_count: number | null;
  created_at: string;
  updated_at: string;
};

export type DocumentBundle = {
  id: string;
  meeting_id: string;
  pdf_storage_path: string | null;
  pdf_url: string | null;
  includes_nda: boolean;
  includes_recording: boolean;
  includes_transcript: boolean;
  status: 'pending' | 'generating' | 'ready' | 'error';
  generated_at: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type MeetingSummary = {
  id: string;
  meeting_id: string;
  summary: string;
  key_decisions: string[];
  action_items: Array<{
    id: string;
    description: string;
    assignee: string | null;
    due_date: string | null;
    completed: boolean;
  }>;
  key_topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  generated_by: string;
  model: string;
  status: 'generating' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
};

export type GuestToken = {
  id: string;
  meeting_id: string;
  participant_id: string;
  token: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export type CalendarEvent = {
  id: string;
  meeting_id: string;
  provider: 'google' | 'outlook';
  provider_event_id: string;
  calendar_id: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentVersion = {
  id: string;
  document_type: 'nda_template' | 'nda_customized';
  document_id: string;
  version_number: number;
  content: string;
  change_summary: string | null;
  created_by: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'meeting_scheduled' | 'nda_ready' | 'nda_signed' | 'all_signed' | 'recording_ready' | 'summary_ready' | 'meeting_reminder';
  title: string;
  body: string;
  resource_type: string | null;
  resource_id: string | null;
  read: boolean;
  email_sent: boolean;
  created_at: string;
};

export type ClauseRisk = {
  id: string;
  clause_text: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  explanation: string;
  suggestion: string | null;
};

export type NDAAnalysis = {
  id: string;
  meeting_id: string | null;
  template_id: string | null;
  nda_content: string;
  overall_risk: 'low' | 'medium' | 'high';
  risks: ClauseRisk[];
  missing_clauses: string[];
  summary: string;
  generated_by: string;
  model: string;
  status: 'analyzing' | 'completed' | 'error';
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  owner_id: string;
  created_at: string;
};

export type ResourceTag = {
  id: string;
  tag_id: string;
  resource_type: 'project' | 'meeting' | 'document';
  resource_id: string;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan: 'solo' | 'team' | 'business' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  meetings_used: number;
  meetings_limit: number | null;
  created_at: string;
  updated_at: string;
};

export type AnalyticsSnapshot = {
  id: string;
  user_id: string;
  period: string;
  meetings_total: number;
  meetings_completed: number;
  ndas_generated: number;
  ndas_signed: number;
  avg_nda_turnaround_minutes: number | null;
  avg_meeting_duration_minutes: number | null;
  recordings_count: number;
  transcripts_count: number;
  top_templates: Array<{ template_id: string; name: string; count: number }>;
  created_at: string;
};
