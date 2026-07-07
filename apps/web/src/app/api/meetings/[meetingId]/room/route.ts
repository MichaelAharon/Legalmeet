import { NextRequest, NextResponse } from 'next/server';
import { mockMeetings, mockParticipants } from '../../../lib/mock-store';
import { canCreateMeetingRoom } from '@/lib/meeting-readiness';

export async function POST(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const meeting = mockMeetings.find(m => m.id === params.meetingId);
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  const participants = mockParticipants.filter(p => p.meetingId === params.meetingId);

  if (!canCreateMeetingRoom(meeting.ndaRequired, participants)) {
    return NextResponse.json({ error: 'All required NDA signatures must be completed before creating a room' }, { status: 409 });
  }

  const roomName = `legalmeet-${params.meetingId.slice(0, 8)}`;
  meeting.roomName = roomName;
  meeting.roomUrl = `https://mock.daily.co/${roomName}`;
  meeting.status = 'in_progress';
  meeting.startedAt = new Date().toISOString();
  meeting.updatedAt = new Date().toISOString();

  return NextResponse.json({ roomName, roomUrl: meeting.roomUrl, token: `mock-token-${roomName}` });
}
