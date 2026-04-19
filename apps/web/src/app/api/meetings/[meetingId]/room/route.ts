import { NextRequest, NextResponse } from 'next/server';
import { mockMeetings } from '../../../lib/mock-store';

export async function POST(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const meeting = mockMeetings.find(m => m.id === params.meetingId);
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const roomName = `legalmeet-${params.meetingId.slice(0, 8)}`;
  meeting.roomName = roomName;
  meeting.roomUrl = `https://mock.daily.co/${roomName}`;
  meeting.status = 'in_progress';
  meeting.startedAt = new Date().toISOString();
  meeting.updatedAt = new Date().toISOString();

  return NextResponse.json({ roomName, roomUrl: meeting.roomUrl, token: `mock-token-${roomName}` });
}
