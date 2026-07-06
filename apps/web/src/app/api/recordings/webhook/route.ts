import { NextRequest, NextResponse } from 'next/server';
import { getDb, toCamel, useMock } from '../../lib/db';
import { mockRecordings } from '../../lib/mock-store';

type WebhookPayload = Record<string, any>;

function nestedPayload(body: WebhookPayload) {
  return (body.payload && typeof body.payload === 'object' ? body.payload : body) as WebhookPayload;
}

function stringValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function timestampValue(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return new Date(value < 10_000_000_000 ? value * 1000 : value).toISOString();
    }
  }
  return null;
}

function isRecordingReady(body: WebhookPayload) {
  const payload = nestedPayload(body);
  const event = stringValue(body.event, body.type, payload.event, payload.type);
  return event === 'recording.ready' || event === 'recording.ready-to-download';
}

function hasValidWebhookSecret(request: NextRequest) {
  const secret = process.env.RECORDING_WEBHOOK_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null;
  const headerSecret = request.headers.get('x-recording-webhook-secret') || request.headers.get('x-webhook-secret');

  return bearerToken === secret || headerSecret === secret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WebhookPayload;
    // Daily.co webhook format
    if (isRecordingReady(body)) {
      const payload = nestedPayload(body);
      const meetingId = stringValue(body.meetingId, body.meeting_id, payload.meetingId, payload.meeting_id);
      const roomName = stringValue(body.room_name, body.roomName, payload.room_name, payload.roomName);
      const providerId = stringValue(body.recording_id, body.recordingId, payload.recording_id, payload.recordingId, payload.id);
      const storageUrl = stringValue(body.download_link, body.downloadLink, body.recording_url, body.recordingUrl, payload.download_link, payload.downloadLink, payload.recording_url, payload.recordingUrl);
      const startedAt = timestampValue(body.started_at, body.startedAt, body.start_ts, payload.started_at, payload.startedAt, payload.start_ts);
      const endedAt = timestampValue(body.ended_at, body.endedAt, body.end_ts, payload.ended_at, payload.endedAt, payload.end_ts) || new Date().toISOString();
      const durationSeconds = numberValue(body.duration, body.duration_seconds, payload.duration, payload.duration_seconds);
      const fileSizeBytes = numberValue(body.size, body.file_size, body.fileSizeBytes, payload.size, payload.file_size, payload.fileSizeBytes);

      if (!useMock()) {
        if (!hasValidWebhookSecret(request)) {
          return NextResponse.json({ error: 'Invalid recording webhook secret' }, { status: 401 });
        }

        const db = getDb();
        let resolvedMeetingId = meetingId;

        if (!resolvedMeetingId && roomName) {
          const { data: meeting, error: meetingError } = await db
            .from('meetings')
            .select('id')
            .eq('room_name', roomName)
            .single();

          if (meetingError || !meeting) {
            return NextResponse.json({ error: 'Meeting not found for recording webhook' }, { status: 404 });
          }

          resolvedMeetingId = meeting.id;
        }

        if (!resolvedMeetingId) {
          return NextResponse.json({ error: 'Missing meetingId or room_name' }, { status: 400 });
        }

        const recordingRow = {
          meeting_id: resolvedMeetingId,
          provider_id: providerId,
          storage_path: stringValue(body.s3_key, body.storage_path, payload.s3_key, payload.storage_path),
          storage_url: storageUrl,
          duration_seconds: durationSeconds,
          file_size_bytes: fileSizeBytes,
          mime_type: stringValue(body.mime_type, body.mimeType, payload.mime_type, payload.mimeType) || 'video/mp4',
          status: 'ready',
          encryption_key_id: null,
          started_at: startedAt,
          ended_at: endedAt,
        };

        let existingRecordingId: string | null = null;
        if (providerId) {
          const { data: existing } = await db
            .from('recordings')
            .select('id')
            .eq('meeting_id', resolvedMeetingId)
            .eq('provider_id', providerId)
            .maybeSingle();
          existingRecordingId = existing?.id ?? null;
        }

        const query = existingRecordingId
          ? db.from('recordings').update(recordingRow).eq('id', existingRecordingId).select('*').single()
          : db.from('recordings').insert(recordingRow).select('*').single();
        const { data: recording, error } = await query;

        if (error || !recording) {
          return NextResponse.json({ error: error?.message || 'Failed to persist recording' }, { status: 500 });
        }

        return NextResponse.json({ received: true, recordingId: recording.id, recording: toCamel(recording) });
      }

      const recording = {
        id: crypto.randomUUID(),
        meetingId: meetingId || roomName || 'unknown',
        providerId: providerId || crypto.randomUUID(),
        storagePath: null,
        storageUrl: `https://mock-storage.local/recordings/${crypto.randomUUID()}.mp4`,
        durationSeconds: durationSeconds || 300,
        fileSizeBytes: fileSizeBytes || 52428800,
        mimeType: 'video/mp4',
        status: 'ready',
        encryptionKeyId: null,
        startedAt: startedAt || new Date().toISOString(),
        endedAt,
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
