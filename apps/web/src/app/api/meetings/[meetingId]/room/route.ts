import { NextRequest, NextResponse } from 'next/server';
import { createVideoService } from '@legalmeet/services';
import { useMock, getDb } from '../../../lib/db';
import { mockMeetings } from '../../../lib/mock-store';

export async function POST(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  if (useMock()) {
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

  const db = getDb();
  const { data: meeting, error: fetchError } = await db
    .from('meetings')
    .select('id, host_id, room_name, room_url, recording_enabled')
    .eq('id', params.meetingId)
    .single();

  if (fetchError || !meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  const video = createVideoService();
  const startedAt = new Date().toISOString();
  const existingRoomName = meeting.room_name;
  const existingRoomUrl = meeting.room_url;
  const room = existingRoomName && existingRoomUrl
    ? { name: existingRoomName, url: existingRoomUrl }
    : await video.createRoom({
        name: `legalmeet-${params.meetingId.slice(0, 8)}`,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        enableRecording: meeting.recording_enabled ?? true,
        maxParticipants: 20,
      });

  const { error: updateError } = await db
    .from('meetings')
    .update({
      room_name: room.name,
      room_url: room.url,
      status: 'in_progress',
      started_at: startedAt,
    })
    .eq('id', params.meetingId);

  if (updateError) {
    if (!existingRoomName) {
      await video.deleteRoom(room.name).catch(() => undefined);
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const token = await video.getRoomToken(room.name, meeting.host_id, true);
  return NextResponse.json({ roomName: room.name, roomUrl: room.url, token });
}
