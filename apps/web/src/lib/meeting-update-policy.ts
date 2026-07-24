const editableFieldMap = [
  { body: 'title', db: 'title', mock: 'title' },
  { body: 'description', db: 'description', mock: 'description' },
  { body: 'scheduledAt', db: 'scheduled_at', mock: 'scheduledAt' },
  { body: 'ndaTemplateId', db: 'nda_template_id', mock: 'ndaTemplateId' },
  { body: 'ndaRequired', db: 'nda_required', mock: 'ndaRequired' },
  { body: 'ndaCustomizedContent', db: 'nda_customized_content', mock: 'ndaCustomizedContent' },
  { body: 'hostSignedAt', db: 'host_signed_at', mock: 'hostSignedAt' },
  { body: 'invitesSentAt', db: 'invites_sent_at', mock: 'invitesSentAt' },
  { body: 'recordingEnabled', db: 'recording_enabled', mock: 'recordingEnabled' },
  { body: 'transcriptionEnabled', db: 'transcription_enabled', mock: 'transcriptionEnabled' },
] as const;

const clientAllowedStatuses = new Set(['scheduled', 'awaiting_signatures', 'cancelled']);

type MeetingPatch =
  | { ok: true; dbUpdates: Record<string, unknown>; mockUpdates: Record<string, unknown> }
  | { ok: false; error: string; status: number };

export function buildMeetingPatch(body: Record<string, unknown>): MeetingPatch {
  const dbUpdates: Record<string, unknown> = {};
  const mockUpdates: Record<string, unknown> = {};

  for (const field of editableFieldMap) {
    if (body[field.body] !== undefined) {
      dbUpdates[field.db] = body[field.body];
      mockUpdates[field.mock] = body[field.body];
    }
  }

  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !clientAllowedStatuses.has(body.status)) {
      return {
        ok: false,
        error: 'Meeting status is managed by signing and room creation workflows',
        status: 400,
      };
    }

    dbUpdates.status = body.status;
    mockUpdates.status = body.status;
  }

  if (body.roomName !== undefined || body.roomUrl !== undefined) {
    return {
      ok: false,
      error: 'Meeting room details are managed by room creation workflow',
      status: 400,
    };
  }

  if (Object.keys(dbUpdates).length === 0) {
    return { ok: false, error: 'No supported meeting fields provided', status: 400 };
  }

  return { ok: true, dbUpdates, mockUpdates };
}
