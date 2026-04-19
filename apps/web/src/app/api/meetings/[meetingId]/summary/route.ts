import { NextRequest, NextResponse } from 'next/server';
import { mockSummaries, mockTranscripts, mockMeetings, mockParticipants } from '../../../lib/mock-store';

// GET — fetch summary for a meeting
export async function GET(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const summary = mockSummaries.find((s: any) => s.meetingId === params.meetingId);
  if (!summary) return NextResponse.json(null);
  return NextResponse.json(summary);
}

// POST — generate summary for a meeting
export async function POST(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const meeting = mockMeetings.find((m: any) => m.id === params.meetingId);
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const transcript = mockTranscripts.find((t: any) => t.meetingId === params.meetingId);
  if (!transcript) return NextResponse.json({ error: 'No transcript found for this meeting' }, { status: 400 });

  const participants = mockParticipants.filter((p: any) => p.meetingId === params.meetingId);
  const speakerNames = [...new Set(transcript.content.map((s: any) => s.speaker))];

  const summary = {
    id: `summary-${crypto.randomUUID().slice(0, 8)}`,
    meetingId: params.meetingId,
    summary: `Meeting "${meeting.title}" covered key discussion topics. ${speakerNames.join(' and ')} discussed deliverables, timelines, and confidentiality requirements. Both parties expressed alignment on core objectives.`,
    keyDecisions: [
      'Proceed with proposed framework',
      'Legal team to finalize amendments by end of week',
      'Quarterly review cadence agreed upon',
    ],
    actionItems: participants.slice(0, 3).map((p: any, i: number) => ({
      id: `ai-${crypto.randomUUID().slice(0, 8)}`,
      description: ['Draft revised agreement', 'Schedule follow-up call', 'Share compliance documentation'][i] || 'Follow up on discussion points',
      assignee: p.displayName,
      dueDate: new Date(Date.now() + (7 + i * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
    })),
    keyTopics: ['Partnership Terms', 'Compliance', 'Next Steps'],
    sentiment: 'positive',
    generatedBy: 'claude',
    model: 'claude-sonnet-4-6',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockSummaries.push(summary);
  return NextResponse.json(summary, { status: 201 });
}
