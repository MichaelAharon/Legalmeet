import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { DailyVideoService } from '@legalmeet/services/src/video/daily';
import { MockVideoService } from '@legalmeet/services/src/video/mock';
import { useMock, getDb } from '../../../lib/db';
import { mockMeetings } from '../../../lib/mock-store';
import { authorizeRoomAccess } from './authorization';

function createRoomVideoService() {
  return process.env.DAILY_API_KEY
    ? new DailyVideoService(process.env.DAILY_API_KEY)
    : new MockVideoService();
}

export async function POST(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const meeting = mockMeetings.find(m => m.id === params.meetingId);
  if (useMock()) {
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const roomName = `legalmeet-${params.meetingId.slice(0, 8)}`;
    meeting.roomName = roomName;
    meeting.roomUrl = `https://mock.daily.co/${roomName}`;
    meeting.status = 'in_progress';
    meeting.startedAt = new Date().toISOString();
    meeting.updatedAt = new Date().toISOString();

    return NextResponse.json({ roomName, roomUrl: meeting.roomUrl, token: `mock-token-${roomName}` });
  }

  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const [
    { data: dbMeeting, error: meetingError },
    { data: participants, error: participantsError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    db.from('meetings')
      .select('id, host_id, room_name, room_url, recording_enabled, started_at')
      .eq('id', params.meetingId)
      .maybeSingle(),
    db.from('meeting_participants')
      .select('id, user_id, email, role')
      .eq('meeting_id', params.meetingId),
    db.from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .maybeSingle(),
  ]);

  if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 });
  if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  if (!dbMeeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const access = authorizeRoomAccess({
    meeting: dbMeeting,
    participants: participants || [],
    sessionEmail: session.user.email,
    profileId: profile?.id,
  });

  if (!access.authorized || !access.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const video = createRoomVideoService();
  const existingRoomName = dbMeeting.room_name;
  const existingRoomUrl = dbMeeting.room_url;
  let createdRoom = false;
  let room: { name: string; url: string };

  if (existingRoomName && existingRoomUrl) {
    room = { name: existingRoomName, url: existingRoomUrl };
  } else {
    createdRoom = true;
    room = await video.createRoom({
        name: `legalmeet-${params.meetingId.slice(0, 8)}`,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        enableRecording: dbMeeting.recording_enabled ?? true,
        maxParticipants: 20,
      });
  }

  const { error: updateError } = await db
    .from('meetings')
    .update({
      room_name: room.name,
      room_url: room.url,
      status: 'in_progress',
      started_at: dbMeeting.started_at ?? new Date().toISOString(),
    })
    .eq('id', params.meetingId);

  if (updateError) {
    if (createdRoom) {
      await video.deleteRoom(room.name).catch(() => undefined);
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const token = await video.getRoomToken(room.name, access.userId, access.isOwner);
  return NextResponse.json({ roomName: room.name, roomUrl: room.url, token });
}
