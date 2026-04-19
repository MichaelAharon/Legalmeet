import { NextRequest, NextResponse } from 'next/server';
import { mockSignatures, mockParticipants } from '../../lib/mock-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const meetingId = searchParams.get('meetingId');
  const checkAll = searchParams.get('checkAll');

  if (token) {
    const sig = mockSignatures.find(s => s.verificationToken === token);
    if (!sig) return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
    return NextResponse.json(sig);
  }

  if (meetingId && checkAll === 'true') {
    const participants = mockParticipants.filter(p => p.meetingId === meetingId);
    const signatures = mockSignatures.filter(s => s.meetingId === meetingId);
    const signed = participants.filter(p => p.ndaSignedAt != null);
    const pending = participants.filter(p => p.ndaSignedAt == null);
    const allSigned = pending.length === 0 && participants.length > 0;
    return NextResponse.json({ allSigned, participants, signatures, signed, pending });
  }

  if (meetingId) {
    const sigs = mockSignatures.filter(s => s.meetingId === meetingId);
    return NextResponse.json(sigs);
  }

  return NextResponse.json({ error: 'Provide token or meetingId' }, { status: 400 });
}
