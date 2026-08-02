import { NextRequest, NextResponse } from 'next/server';
import { mockGuestTokens, mockMeetings, mockParticipants, mockTemplates } from '../../lib/mock-store';
import { resolveMeetingNdaContent } from '@/lib/resolve-meeting-nda-content';

// GET — validate guest token and return meeting context
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const guestToken = mockGuestTokens.find((gt: any) => gt.token === params.token);
  if (!guestToken) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  if (new Date(guestToken.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 403 });
  }

  const meeting = mockMeetings.find((m: any) => m.id === guestToken.meetingId);
  if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

  const participant = mockParticipants.find((p: any) => p.id === guestToken.participantId);
  const template = meeting.ndaTemplateId ? mockTemplates.find((t: any) => t.id === meeting.ndaTemplateId) : null;

  // Mark token as used
  if (!guestToken.usedAt) guestToken.usedAt = new Date().toISOString();

  const ndaContent = resolveMeetingNdaContent(meeting.ndaCustomizedContent, template?.content);

  return NextResponse.json({
    guest: {
      email: guestToken.email,
      participantId: guestToken.participantId,
      displayName: participant?.displayName || guestToken.email,
    },
    meeting: {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduledAt,
      status: meeting.status,
      ndaRequired: meeting.ndaRequired,
      ndaContent: ndaContent || null,
      hasSignedNDA: !!participant?.ndaSignedAt,
    },
  });
}
