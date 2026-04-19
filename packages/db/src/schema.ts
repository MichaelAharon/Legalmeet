import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
});

export const createSubProjectSchema = z.object({
  name: z.string().min(2, 'Sub-project name must be at least 2 characters'),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  parentSubProjectId: z.string().uuid().optional().nullable(),
});

export const createMeetingSchema = z.object({
  title: z.string().min(2, 'Meeting title is required'),
  description: z.string().optional(),
  projectId: z.string().uuid().optional().nullable(),
  subProjectId: z.string().uuid().optional().nullable(),
  scheduledAt: z.string().min(1, 'Scheduled date/time is required'),
  ndaTemplateId: z.string().uuid().optional().nullable(),
  ndaRequired: z.boolean().default(true),
  recordingEnabled: z.boolean().default(true),
  transcriptionEnabled: z.boolean().default(true),
  newProjectName: z.string().optional(),
  newProjectDescription: z.string().optional(),
  participants: z.array(z.object({
    email: z.string().email(),
    displayName: z.string().optional(),
    role: z.enum(['participant', 'observer']).default('participant'),
  })).optional(),
});

export const updateMeetingSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['scheduled', 'awaiting_signatures', 'ready', 'in_progress', 'completed', 'cancelled']).optional(),
  ndaCustomizedContent: z.string().optional().nullable(),
  hostSignedAt: z.string().optional().nullable(),
  invitesSentAt: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const createNDATemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  content: z.string().min(10, 'Template content is required'),
  templateVars: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'date', 'number', 'email']),
    required: z.boolean().default(true),
  })).optional().default([]),
});

export const updateNDATemplateSchema = z.object({
  name: z.string().min(2).optional(),
  content: z.string().min(10).optional(),
  templateVars: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'date', 'number', 'email']),
    required: z.boolean(),
  })).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

export const signNDASchema = z.object({
  meetingId: z.string().uuid(),
  participantId: z.string().uuid().optional(),
  signatureData: z.string().min(1, 'Signature is required'),
  signerName: z.string().min(1, 'Signer name is required'),
  signerEmail: z.string().email('Valid email is required'),
});

export const createParticipantSchema = z.object({
  meetingId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.enum(['host', 'participant', 'observer']).default('participant'),
});

export type CreateSubProject = z.infer<typeof createSubProjectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type CreateMeeting = z.infer<typeof createMeetingSchema>;
export type UpdateMeeting = z.infer<typeof updateMeetingSchema>;
export type CreateNDATemplate = z.infer<typeof createNDATemplateSchema>;
export type UpdateNDATemplate = z.infer<typeof updateNDATemplateSchema>;
export type SignNDA = z.infer<typeof signNDASchema>;
export type CreateParticipant = z.infer<typeof createParticipantSchema>;
