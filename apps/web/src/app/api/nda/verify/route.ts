import { NextRequest, NextResponse } from 'next/server';
import { mockSignatures, mockParticipants } from '../../lib/mock-store';
import { useMock, getDb, toCamel } from '../../lib/db';
import { buildSignatureStatus } from '../verification';

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
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!signature) return NextResponse.json({ error: 'Signature not found' }, { status: 404 });

    return NextResponse.json(toCamel(signature));
  }

  if (meetingId && checkAll === 'true') {
    const [
      { data: participants, error: participantsError },
      { data: signatures, error: signaturesError },
    ] = await Promise.all([
      db.from('meeting_participants').select('*').eq('meeting_id', meetingId),
      db.from('nda_signatures').select('*').eq('meeting_id', meetingId),
    ]);

    if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 });
    if (signaturesError) return NextResponse.json({ error: signaturesError.message }, { status: 500 });

    const camelParticipants = (participants || []).map(toCamel);
    const camelSignatures = (signatures || []).map(toCamel);

    return NextResponse.json(buildSignatureStatus(camelParticipants, camelSignatures));
  }

  if (meetingId) {
    const { data: signatures, error } = await db.from('nda_signatures')
      .select('*')
      .eq('meeting_id', meetingId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json((signatures || []).map(toCamel));
  }

  return NextResponse.json({ error: 'Provide token or meetingId' }, { status: 400 });
}
