export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: { action: string; created_at: string; details: Json | null; id: string; ip_address: string | null; resource_id: string | null; resource_type: string; user_agent: string | null; user_id: string | null }
        Insert: { action: string; created_at?: string; details?: Json | null; id?: string; ip_address?: string | null; resource_id?: string | null; resource_type: string; user_agent?: string | null; user_id?: string | null }
        Update: { action?: string; created_at?: string; details?: Json | null; id?: string; ip_address?: string | null; resource_id?: string | null; resource_type?: string; user_agent?: string | null; user_id?: string | null }
        Relationships: [{ foreignKeyName: "audit_log_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      document_bundles: {
        Row: { created_at: string; generated_at: string | null; id: string; includes_nda: boolean | null; includes_recording: boolean | null; includes_transcript: boolean | null; meeting_id: string; pdf_storage_path: string | null; pdf_url: string | null; status: string | null }
        Insert: { created_at?: string; generated_at?: string | null; id?: string; includes_nda?: boolean | null; includes_recording?: boolean | null; includes_transcript?: boolean | null; meeting_id: string; pdf_storage_path?: string | null; pdf_url?: string | null; status?: string | null }
        Update: { created_at?: string; generated_at?: string | null; id?: string; includes_nda?: boolean | null; includes_recording?: boolean | null; includes_transcript?: boolean | null; meeting_id?: string; pdf_storage_path?: string | null; pdf_url?: string | null; status?: string | null }
        Relationships: [{ foreignKeyName: "document_bundles_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }]
      }
      document_versions: {
        Row: { change_summary: string | null; content: string; created_at: string; created_by: string | null; document_id: string; document_type: string; id: string; version_number: number }
        Insert: { change_summary?: string | null; content: string; created_at?: string; created_by?: string | null; document_id: string; document_type: string; id?: string; version_number: number }
        Update: { change_summary?: string | null; content?: string; created_at?: string; created_by?: string | null; document_id?: string; document_type?: string; id?: string; version_number?: number }
        Relationships: [{ foreignKeyName: "document_versions_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      guest_tokens: {
        Row: { created_at: string; email: string; expires_at: string; id: string; meeting_id: string; participant_id: string; token: string; used_at: string | null }
        Insert: { created_at?: string; email: string; expires_at: string; id?: string; meeting_id: string; participant_id: string; token: string; used_at?: string | null }
        Update: { created_at?: string; email?: string; expires_at?: string; id?: string; meeting_id?: string; participant_id?: string; token?: string; used_at?: string | null }
        Relationships: [{ foreignKeyName: "guest_tokens_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }, { foreignKeyName: "guest_tokens_participant_id_fkey"; columns: ["participant_id"]; isOneToOne: false; referencedRelation: "meeting_participants"; referencedColumns: ["id"] }]
      }
      meeting_participants: {
        Row: { created_at: string; display_name: string | null; email: string; id: string; joined_at: string | null; left_at: string | null; meeting_id: string; nda_signed_at: string | null; role: string | null; status: string | null; user_id: string | null }
        Insert: { created_at?: string; display_name?: string | null; email: string; id?: string; joined_at?: string | null; left_at?: string | null; meeting_id: string; nda_signed_at?: string | null; role?: string | null; status?: string | null; user_id?: string | null }
        Update: { created_at?: string; display_name?: string | null; email?: string; id?: string; joined_at?: string | null; left_at?: string | null; meeting_id?: string; nda_signed_at?: string | null; role?: string | null; status?: string | null; user_id?: string | null }
        Relationships: [{ foreignKeyName: "meeting_participants_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }, { foreignKeyName: "meeting_participants_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      meeting_summaries: {
        Row: { action_items: Json | null; created_at: string; generated_by: string; id: string; key_decisions: Json | null; key_topics: Json | null; meeting_id: string; model: string; sentiment: string | null; status: string | null; summary: string; updated_at: string }
        Insert: { action_items?: Json | null; created_at?: string; generated_by: string; id?: string; key_decisions?: Json | null; key_topics?: Json | null; meeting_id: string; model: string; sentiment?: string | null; status?: string | null; summary: string; updated_at?: string }
        Update: { action_items?: Json | null; created_at?: string; generated_by?: string; id?: string; key_decisions?: Json | null; key_topics?: Json | null; meeting_id?: string; model?: string; sentiment?: string | null; status?: string | null; summary?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "meeting_summaries_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }]
      }
      meetings: {
        Row: { created_at: string; description: string | null; duration_seconds: number | null; ended_at: string | null; host_id: string; host_signed_at: string | null; id: string; invites_sent_at: string | null; metadata: Json | null; nda_customized_content: string | null; nda_required: boolean | null; nda_template_id: string | null; project_id: string | null; recording_enabled: boolean | null; room_name: string | null; room_url: string | null; scheduled_at: string | null; started_at: string | null; status: string | null; sub_project_id: string | null; title: string; transcription_enabled: boolean | null; updated_at: string }
        Insert: { created_at?: string; description?: string | null; duration_seconds?: number | null; ended_at?: string | null; host_id: string; host_signed_at?: string | null; id?: string; invites_sent_at?: string | null; metadata?: Json | null; nda_customized_content?: string | null; nda_required?: boolean | null; nda_template_id?: string | null; project_id?: string | null; recording_enabled?: boolean | null; room_name?: string | null; room_url?: string | null; scheduled_at?: string | null; started_at?: string | null; status?: string | null; sub_project_id?: string | null; title: string; transcription_enabled?: boolean | null; updated_at?: string }
        Update: { created_at?: string; description?: string | null; duration_seconds?: number | null; ended_at?: string | null; host_id?: string; host_signed_at?: string | null; id?: string; invites_sent_at?: string | null; metadata?: Json | null; nda_customized_content?: string | null; nda_required?: boolean | null; nda_template_id?: string | null; project_id?: string | null; recording_enabled?: boolean | null; room_name?: string | null; room_url?: string | null; scheduled_at?: string | null; started_at?: string | null; status?: string | null; sub_project_id?: string | null; title?: string; transcription_enabled?: boolean | null; updated_at?: string }
        Relationships: [{ foreignKeyName: "meetings_host_id_fkey"; columns: ["host_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }, { foreignKeyName: "meetings_nda_template_id_fkey"; columns: ["nda_template_id"]; isOneToOne: false; referencedRelation: "nda_templates"; referencedColumns: ["id"] }, { foreignKeyName: "meetings_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }, { foreignKeyName: "meetings_sub_project_id_fkey"; columns: ["sub_project_id"]; isOneToOne: false; referencedRelation: "sub_projects"; referencedColumns: ["id"] }]
      }
      nda_analyses: {
        Row: { created_at: string; generated_by: string; id: string; meeting_id: string | null; missing_clauses: Json | null; model: string; nda_content: string; overall_risk: string | null; risks: Json | null; status: string | null; summary: string | null; template_id: string | null }
        Insert: { created_at?: string; generated_by: string; id?: string; meeting_id?: string | null; missing_clauses?: Json | null; model: string; nda_content: string; overall_risk?: string | null; risks?: Json | null; status?: string | null; summary?: string | null; template_id?: string | null }
        Update: { created_at?: string; generated_by?: string; id?: string; meeting_id?: string | null; missing_clauses?: Json | null; model?: string; nda_content?: string; overall_risk?: string | null; risks?: Json | null; status?: string | null; summary?: string | null; template_id?: string | null }
        Relationships: [{ foreignKeyName: "nda_analyses_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }, { foreignKeyName: "nda_analyses_template_id_fkey"; columns: ["template_id"]; isOneToOne: false; referencedRelation: "nda_templates"; referencedColumns: ["id"] }]
      }
      nda_signatures: {
        Row: { created_at: string; id: string; meeting_id: string; nda_content_snapshot: string; participant_id: string; signature_data: string; signature_hash: string; signed_at: string; signer_email: string; signer_ip: string | null; signer_name: string; template_id: string | null; user_agent: string | null; verification_token: string | null; verified: boolean | null }
        Insert: { created_at?: string; id?: string; meeting_id: string; nda_content_snapshot: string; participant_id: string; signature_data: string; signature_hash: string; signed_at?: string; signer_email: string; signer_ip?: string | null; signer_name: string; template_id?: string | null; user_agent?: string | null; verification_token?: string | null; verified?: boolean | null }
        Update: { created_at?: string; id?: string; meeting_id?: string; nda_content_snapshot?: string; participant_id?: string; signature_data?: string; signature_hash?: string; signed_at?: string; signer_email?: string; signer_ip?: string | null; signer_name?: string; template_id?: string | null; user_agent?: string | null; verification_token?: string | null; verified?: boolean | null }
        Relationships: [{ foreignKeyName: "nda_signatures_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }, { foreignKeyName: "nda_signatures_participant_id_fkey"; columns: ["participant_id"]; isOneToOne: false; referencedRelation: "meeting_participants"; referencedColumns: ["id"] }, { foreignKeyName: "nda_signatures_template_id_fkey"; columns: ["template_id"]; isOneToOne: false; referencedRelation: "nda_templates"; referencedColumns: ["id"] }]
      }
      nda_templates: {
        Row: { category: string | null; content: string; created_at: string; id: string; is_default: boolean | null; name: string; owner_id: string; status: string | null; template_vars: Json | null; updated_at: string; version: number | null }
        Insert: { category?: string | null; content: string; created_at?: string; id?: string; is_default?: boolean | null; name: string; owner_id: string; status?: string | null; template_vars?: Json | null; updated_at?: string; version?: number | null }
        Update: { category?: string | null; content?: string; created_at?: string; id?: string; is_default?: boolean | null; name?: string; owner_id?: string; status?: string | null; template_vars?: Json | null; updated_at?: string; version?: number | null }
        Relationships: [{ foreignKeyName: "nda_templates_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      notifications: {
        Row: { body: string; created_at: string; email_sent: boolean | null; id: string; read: boolean | null; resource_id: string | null; resource_type: string | null; title: string; type: string; user_id: string }
        Insert: { body: string; created_at?: string; email_sent?: boolean | null; id?: string; read?: boolean | null; resource_id?: string | null; resource_type?: string | null; title: string; type: string; user_id: string }
        Update: { body?: string; created_at?: string; email_sent?: boolean | null; id?: string; read?: boolean | null; resource_id?: string | null; resource_type?: string | null; title?: string; type?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      profiles: {
        Row: { avatar_url: string | null; company: string | null; created_at: string; email: string; full_name: string | null; id: string; preferences: Json | null; role: string | null; timezone: string | null; updated_at: string }
        Insert: { avatar_url?: string | null; company?: string | null; created_at?: string; email: string; full_name?: string | null; id: string; preferences?: Json | null; role?: string | null; timezone?: string | null; updated_at?: string }
        Update: { avatar_url?: string | null; company?: string | null; created_at?: string; email?: string; full_name?: string | null; id?: string; preferences?: Json | null; role?: string | null; timezone?: string | null; updated_at?: string }
        Relationships: []
      }
      project_members: {
        Row: { accepted_at: string | null; id: string; invited_at: string; project_id: string; role: string | null; user_id: string }
        Insert: { accepted_at?: string | null; id?: string; invited_at?: string; project_id: string; role?: string | null; user_id: string }
        Update: { accepted_at?: string | null; id?: string; invited_at?: string; project_id?: string; role?: string | null; user_id?: string }
        Relationships: [{ foreignKeyName: "project_members_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }, { foreignKeyName: "project_members_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      projects: {
        Row: { created_at: string; description: string | null; id: string; metadata: Json | null; name: string; owner_id: string; status: string | null; updated_at: string }
        Insert: { created_at?: string; description?: string | null; id?: string; metadata?: Json | null; name: string; owner_id: string; status?: string | null; updated_at?: string }
        Update: { created_at?: string; description?: string | null; id?: string; metadata?: Json | null; name?: string; owner_id?: string; status?: string | null; updated_at?: string }
        Relationships: [{ foreignKeyName: "projects_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      recordings: {
        Row: { created_at: string; duration_seconds: number | null; encryption_key_id: string | null; ended_at: string | null; file_size_bytes: number | null; id: string; meeting_id: string; mime_type: string | null; provider_id: string | null; started_at: string | null; status: string | null; storage_path: string | null; storage_url: string | null; updated_at: string }
        Insert: { created_at?: string; duration_seconds?: number | null; encryption_key_id?: string | null; ended_at?: string | null; file_size_bytes?: number | null; id?: string; meeting_id: string; mime_type?: string | null; provider_id?: string | null; started_at?: string | null; status?: string | null; storage_path?: string | null; storage_url?: string | null; updated_at?: string }
        Update: { created_at?: string; duration_seconds?: number | null; encryption_key_id?: string | null; ended_at?: string | null; file_size_bytes?: number | null; id?: string; meeting_id?: string; mime_type?: string | null; provider_id?: string | null; started_at?: string | null; status?: string | null; storage_path?: string | null; storage_url?: string | null; updated_at?: string }
        Relationships: [{ foreignKeyName: "recordings_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }]
      }
      resource_tags: {
        Row: { created_at: string; id: string; resource_id: string; resource_type: string; tag_id: string }
        Insert: { created_at?: string; id?: string; resource_id: string; resource_type: string; tag_id: string }
        Update: { created_at?: string; id?: string; resource_id?: string; resource_type?: string; tag_id?: string }
        Relationships: [{ foreignKeyName: "resource_tags_tag_id_fkey"; columns: ["tag_id"]; isOneToOne: false; referencedRelation: "tags"; referencedColumns: ["id"] }]
      }
      sub_projects: {
        Row: { created_at: string; description: string | null; id: string; name: string; parent_sub_project_id: string | null; project_id: string; status: string | null; updated_at: string }
        Insert: { created_at?: string; description?: string | null; id?: string; name: string; parent_sub_project_id?: string | null; project_id: string; status?: string | null; updated_at?: string }
        Update: { created_at?: string; description?: string | null; id?: string; name?: string; parent_sub_project_id?: string | null; project_id?: string; status?: string | null; updated_at?: string }
        Relationships: [{ foreignKeyName: "sub_projects_parent_sub_project_id_fkey"; columns: ["parent_sub_project_id"]; isOneToOne: false; referencedRelation: "sub_projects"; referencedColumns: ["id"] }, { foreignKeyName: "sub_projects_project_id_fkey"; columns: ["project_id"]; isOneToOne: false; referencedRelation: "projects"; referencedColumns: ["id"] }]
      }
      subscriptions: {
        Row: { created_at: string; current_period_end: string | null; current_period_start: string | null; id: string; meetings_limit: number | null; meetings_used: number | null; plan: string | null; status: string | null; stripe_customer_id: string | null; stripe_subscription_id: string | null; updated_at: string; user_id: string }
        Insert: { created_at?: string; current_period_end?: string | null; current_period_start?: string | null; id?: string; meetings_limit?: number | null; meetings_used?: number | null; plan?: string | null; status?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; updated_at?: string; user_id: string }
        Update: { created_at?: string; current_period_end?: string | null; current_period_start?: string | null; id?: string; meetings_limit?: number | null; meetings_used?: number | null; plan?: string | null; status?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null; updated_at?: string; user_id?: string }
        Relationships: [{ foreignKeyName: "subscriptions_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      tags: {
        Row: { color: string; created_at: string; id: string; name: string; owner_id: string }
        Insert: { color?: string; created_at?: string; id?: string; name: string; owner_id: string }
        Update: { color?: string; created_at?: string; id?: string; name?: string; owner_id?: string }
        Relationships: [{ foreignKeyName: "tags_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }]
      }
      transcripts: {
        Row: { content: Json; created_at: string; full_text: string | null; id: string; language: string | null; meeting_id: string; model: string | null; provider: string | null; recording_id: string | null; status: string | null; updated_at: string; word_count: number | null }
        Insert: { content?: Json; created_at?: string; full_text?: string | null; id?: string; language?: string | null; meeting_id: string; model?: string | null; provider?: string | null; recording_id?: string | null; status?: string | null; updated_at?: string; word_count?: number | null }
        Update: { content?: Json; created_at?: string; full_text?: string | null; id?: string; language?: string | null; meeting_id?: string; model?: string | null; provider?: string | null; recording_id?: string | null; status?: string | null; updated_at?: string; word_count?: number | null }
        Relationships: [{ foreignKeyName: "transcripts_meeting_id_fkey"; columns: ["meeting_id"]; isOneToOne: false; referencedRelation: "meetings"; referencedColumns: ["id"] }, { foreignKeyName: "transcripts_recording_id_fkey"; columns: ["recording_id"]; isOneToOne: false; referencedRelation: "recordings"; referencedColumns: ["id"] }]
      }
    }
    Views: { [_ in never]: never }
    Functions: { delete_user_data: { Args: { target_user_id: string }; Returns: undefined } }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
