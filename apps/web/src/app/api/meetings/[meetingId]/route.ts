import { NextRequest, NextResponse } from 'next/server';
import {
  getMeetingDeletionBlockedMessage,
  getMeetingDeletionBlockers,
  type MeetingDeletionArtifact,
} from '@/lib/meeting-deletion-policy';
import { useMock, getDb, toCamel } from '../../lib/db';
import {
  mockBundles,
  mockMeetings,
  mockParticipants,
  mockRecordings,
  mockSignatures,
  mockTranscripts,
} from '../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  if (useMock()) {
    const meeting = mockMeetings.find(m => m.id === params.meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    const participants = mockParticipants.filter(p => p.meetingId === params.meetingId);
    return NextResponse.json({ ...meeting, participants });
  }

  const db = getDb();
  const { data, error } = await db.from('meetings').select('*, meeting_participants(*)').eq('id', params.meetingId).single();
  if (error || !data) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
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
    .eq('id', params.meetingId).select('*, meeting_participants(*)').single();
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
    const blockers = getMeetingDeletionBlockers({
      nda_signatures: mockSignatures.filter(s => s.meetingId === params.meetingId).length,
      recordings: mockRecordings.filter(r => r.meetingId === params.meetingId).length,
      transcripts: mockTranscripts.filter(t => t.meetingId === params.meetingId).length,
      document_bundles: mockBundles.filter(b => b.meetingId === params.meetingId).length,
    });
    if (blockers.length > 0) {
      return NextResponse.json(
        { error: getMeetingDeletionBlockedMessage(blockers), blockers },
        { status: 409 }
      );
    }
    mockMeetings.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  const db = getDb();
  const { data: meeting, error: meetingError } = await db.from('meetings')
    .select('id')
    .eq('id', params.meetingId)
    .single();
  if (meetingError || !meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const artifactQueries: Array<{
    artifact: MeetingDeletionArtifact;
    query: PromiseLike<{ count: number | null; error: { message: string } | null }>;
  }> = [
    {
      artifact: 'nda_signatures',
      query: db.from('nda_signatures').select('id', { count: 'exact', head: true }).eq('meeting_id', params.meetingId),
    },
    {
      artifact: 'recordings',
      query: db.from('recordings').select('id', { count: 'exact', head: true }).eq('meeting_id', params.meetingId),
    },
    {
      artifact: 'transcripts',
      query: db.from('transcripts').select('id', { count: 'exact', head: true }).eq('meeting_id', params.meetingId),
    },
    {
      artifact: 'document_bundles',
      query: db.from('document_bundles').select('id', { count: 'exact', head: true }).eq('meeting_id', params.meetingId),
    },
  ];

  const artifactResults = await Promise.all(artifactQueries.map(({ query }) => query));
  const artifactError = artifactResults.find(result => result.error)?.error;
  if (artifactError) return NextResponse.json({ error: artifactError.message }, { status: 500 });

  const blockers = getMeetingDeletionBlockers(
    Object.fromEntries(artifactQueries.map(({ artifact }, index) => [artifact, artifactResults[index].count]))
  );
  if (blockers.length > 0) {
    return NextResponse.json(
      { error: getMeetingDeletionBlockedMessage(blockers), blockers },
      { status: 409 }
    );
  }

  const { error } = await db.from('meetings').delete().eq('id', params.meetingId);
  if (error) {
    if (error.code === '23503') {
      return NextResponse.json(
        {
          error: getMeetingDeletionBlockedMessage(['nda_signatures']),
          blockers: ['nda_signatures'],
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
