import { NextRequest, NextResponse } from 'next/server';
import { mockCalendarEvents, mockMeetings } from '../lib/mock-store';

export async function GET() {
  const enriched = mockCalendarEvents.map((ce: any) => {
    const meeting = mockMeetings.find((m: any) => m.id === ce.meetingId);
    return { ...ce, meeting: meeting ? { id: meeting.id, title: meeting.title, scheduledAt: meeting.scheduledAt } : null };
  });
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.meetingId) return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });

  const meeting = mockMeetings.find((m: any) => m.id === body.meetingId);
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const existing = mockCalendarEvents.find((ce: any) => ce.meetingId === body.meetingId);
  if (existing) return NextResponse.json({ error: 'Calendar event already exists' }, { status: 409 });

  const event = {
    id: `cal-${crypto.randomUUID().slice(0, 8)}`,
    meetingId: body.meetingId,
    provider: body.provider || 'google',
    providerEventId: `gcal-evt-${crypto.randomUUID().slice(0, 8)}`,
    calendarId: body.calendarId || 'primary',
    syncStatus: 'synced',
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockCalendarEvents.push(event);
  return NextResponse.json(event, { status: 201 });
}
