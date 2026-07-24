import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../lib/db';
import { mockMeetings, mockParticipants } from '../../lib/mock-store';
import { buildMeetingPatch } from '@/lib/meeting-update-policy';

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
  const body = await request.json();
  const patch = buildMeetingPatch(body);
  if (!patch.ok) {
    return NextResponse.json({ error: patch.error }, { status: patch.status });
  }

  if (useMock()) {
    const meeting = mockMeetings.find(m => m.id === params.meetingId);
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    Object.assign(meeting, patch.mockUpdates, { updatedAt: new Date().toISOString() });
    const participants = mockParticipants.filter(p => p.meetingId === params.meetingId);
    return NextResponse.json({ ...meeting, participants });
  }

  const db = getDb();
  const { data, error } = await db.from('meetings').update(patch.dbUpdates)
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
    mockMeetings.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  const db = getDb();
  const { error } = await db.from('meetings').delete().eq('id', params.meetingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
