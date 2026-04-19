import { NextRequest, NextResponse } from 'next/server';
import { mockRecordings } from '../../lib/mock-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Daily.co webhook format
    if (body.event === 'recording.ready' || body.type === 'recording.ready') {
      const recording = {
        id: crypto.randomUUID(),
        meetingId: body.meetingId || body.room_name || 'unknown',
        providerId: body.recording_id || crypto.randomUUID(),
        storagePath: null,
        storageUrl: `https://mock-storage.local/recordings/${crypto.randomUUID()}.mp4`,
        durationSeconds: body.duration || 300,
        fileSizeBytes: body.size || 52428800,
        mimeType: 'video/mp4',
        status: 'ready',
        encryptionKeyId: null,
        startedAt: body.started_at || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRecordings.push(recording);
      return NextResponse.json({ received: true, recordingId: recording.id });
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}
