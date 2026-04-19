import { NextRequest, NextResponse } from 'next/server';
import { mockBundles, mockMeetings, mockSignatures, mockRecordings } from '../../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const bundle = mockBundles.find(b => b.meetingId === params.meetingId);
  if (!bundle) return NextResponse.json({ error: 'No bundle found' }, { status: 404 });
  return NextResponse.json(bundle);
}

export async function POST(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const meeting = mockMeetings.find(m => m.id === params.meetingId);
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const hasNda = mockSignatures.some(s => s.meetingId === params.meetingId);
  const hasRecording = mockRecordings.some(r => r.meetingId === params.meetingId);

  const bundle = {
    id: crypto.randomUUID(),
    meetingId: params.meetingId,
    pdfStoragePath: null,
    pdfUrl: `https://mock-storage.local/bundles/${params.meetingId}.pdf`,
    includesNda: hasNda,
    includesRecording: hasRecording,
    includesTranscript: true,
    status: 'ready',
    generatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  mockBundles.push(bundle);
  return NextResponse.json(bundle, { status: 201 });
}
