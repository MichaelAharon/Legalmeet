import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { mockSignatures, mockParticipants } from '../../lib/mock-store';
import { useMock, getDb } from '../../lib/db';
import {
  buildSignatureStatus,
  canAccessMeetingByEmail,
  redactParticipant,
  redactSignature,
} from '../verification';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const meetingId = searchParams.get('meetingId');
  const checkAll = searchParams.get('checkAll');

  if (useMock()) {
    if (token) {
      const sig = mockSignatures.find(s => s.verificationToken === token);
      if (!sig) return NextResponse.json({ error: 'Signature not found' }, { status: 404 });
      return NextResponse.json(sig);
    }

    if (meetingId && checkAll === 'true') {
      const participants = mockParticipants.filter(p => p.meetingId === meetingId);
      const signatures = mockSignatures.filter(s => s.meetingId === meetingId);
      return NextResponse.json(buildSignatureStatus(participants, signatures));
    }

    if (meetingId) {
      const sigs = mockSignatures.filter(s => s.meetingId === meetingId);
      return NextResponse.json(sigs);
    }

    return NextResponse.json({ error: 'Provide token or meetingId' }, { status: 400 });
  }

  const db = getDb();

  if (token) {
    const { data: signature, error } = await db.from('nda_signatures')
      .select('id, meeting_id, participant_id, template_id, signature_hash, signer_email, signer_name, signed_at, verified, created_at')
      .eq('verification_token', token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!signature) return NextResponse.json({ error: 'Signature not found' }, { status: 404 });

    return NextResponse.json(redactSignature(signature));
  }

  if (meetingId) {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      { data: meeting, error: meetingError },
      { data: participants, error: participantsError },
    ] = await Promise.all([
      db.from('meetings').select('id, host_id').eq('id', meetingId).maybeSingle(),
      db.from('meeting_participants')
        .select('id, meeting_id, email, display_name, role, nda_signed_at, status, created_at')
        .eq('meeting_id', meetingId),
    ]);

    if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 });
    if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 });
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const { data: hostProfile, error: hostProfileError } = await db.from('profiles')
      .select('email')
      .eq('id', meeting.host_id)
      .maybeSingle();

    if (hostProfileError) return NextResponse.json({ error: hostProfileError.message }, { status: 500 });

    if (!canAccessMeetingByEmail(session.user.email, participants || [], hostProfile?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: signatures, error: signaturesError } = await db.from('nda_signatures')
      .select('id, meeting_id, participant_id, template_id, signature_hash, signer_email, signer_name, signed_at, verified, created_at')
      .eq('meeting_id', meetingId);

    if (signaturesError) return NextResponse.json({ error: signaturesError.message }, { status: 500 });

    const redactedParticipants = (participants || []).map(redactParticipant);
    const redactedSignatures = (signatures || []).map(redactSignature);

    if (checkAll === 'true') {
      return NextResponse.json(buildSignatureStatus(redactedParticipants, redactedSignatures));
    }

    return NextResponse.json(redactedSignatures);
  }

  return NextResponse.json({ error: 'Provide token or meetingId' }, { status: 400 });
}
