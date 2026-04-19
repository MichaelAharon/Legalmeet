import { NextRequest, NextResponse } from 'next/server';
import { mockRecordings } from '../../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const recording = mockRecordings.find(r => r.meetingId === params.meetingId);
  if (!recording) return NextResponse.json({ error: 'No recording found' }, { status: 404 });
  return NextResponse.json({ ...recording, signedUrl: `https://mock-storage.local/recordings/${recording.id}.mp4?token=mock` });
}
