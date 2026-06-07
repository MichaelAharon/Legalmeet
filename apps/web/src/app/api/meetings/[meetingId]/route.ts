import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../lib/db';
import { requireCurrentProfile } from '../../lib/auth';
import { canViewMeeting } from '../../lib/authorization';
import { mockMeetings, mockParticipants } from '../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  if (useMock()) {
    const meeting = mockMeetings.find(m => m.id === params.meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    const participants = mockParticipants.filter(p => p.meetingId === params.meetingId);
    return NextResponse.json({ ...meeting, participants });
  }

  const db = getDb();
  const auth = await requireCurrentProfile(db);
  if (auth.response) return auth.response;

  const { data, error } = await db.from('meetings').select('*, meeting_participants(*)').eq('id', params.meetingId).single();
  if (error || !data) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  if (!canViewMeeting(data, auth.profile.id)) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const { meeting_participants, ...meeting } = data;
  return NextResponse.json({
    ...toCamel(meeting),
    participants: (meeting_participants || []).map(toCamel),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { meetingId: string } }) {
  if (useMock()) {
    const meeting = mockMeetings.find(m => m.id === params.meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    const body = await request.json();
    Object.assign(meeting, body, { updatedAt: new Date().toISOString() });
    const participants = mockParticipants.filter(p => p.meetingId === params.meetingId);
    return NextResponse.json({ ...meeting, participants });
  }

  const db = getDb();
  const auth = await requireCurrentProfile(db);
  if (auth.response) return auth.response;

  const body = await request.json();
  // Map camelCase body to snake_case columns
  const updates: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    title: 'title', description: 'description', status: 'status',
    scheduledAt: 'scheduled_at', ndaTemplateId: 'nda_template_id',
    ndaRequired: 'nda_required', ndaCustomizedContent: 'nda_customized_content',
    hostSignedAt: 'host_signed_at', invitesSentAt: 'invites_sent_at',
    recordingEnabled: 'recording_enabled', transcriptionEnabled: 'transcription_enabled',
    roomName: 'room_name', roomUrl: 'room_url',
  };
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (body[camel] !== undefined) updates[snake] = body[camel];
  }
  const { data, error } = await db.from('meetings').update(updates)
    .eq('id', params.meetingId).eq('host_id', auth.profile.id).select('*, meeting_participants(*)').maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  const { meeting_participants, ...meeting } = data;
  return NextResponse.json({
    ...toCamel(meeting),
    participants: (meeting_participants || []).map(toCamel),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  if (useMock()) {
    const idx = mockMeetings.findIndex(m => m.id === params.meetingId);
    if (idx === -1) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    mockMeetings.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  const db = getDb();
  const auth = await requireCurrentProfile(db);
  if (auth.response) return auth.response;

  const { data, error } = await db.from('meetings').delete()
    .eq('id', params.meetingId)
    .eq('host_id', auth.profile.id)
    .select('id')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
