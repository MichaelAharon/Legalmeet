import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { useMock, getDb, toCamel } from '../../lib/db';
import { mockSignatures, mockMeetings, mockTemplates, mockParticipants, mockGuestTokens } from '../../lib/mock-store';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSignatureHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

function validateMockGuestToken(token: string | undefined, participant: any, meetingId: string, signerEmail: string) {
  if (!token) return false;
  const guestToken = mockGuestTokens.find((gt: any) => gt.token === token);
  if (!guestToken) return false;
  if (new Date(guestToken.expiresAt) < new Date()) return false;
  if (guestToken.usedAt) return false;
  return guestToken.meetingId === meetingId
    && guestToken.participantId === participant.id
    && normalizeEmail(guestToken.email) === normalizeEmail(signerEmail)
    && normalizeEmail(participant.email) === normalizeEmail(signerEmail);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, participantId, signatureData, signerName, signerEmail, guestToken } = body;

    if (!meetingId || !signatureData || !signerName || !signerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (useMock()) {
      const meeting = mockMeetings.find(m => m.id === meetingId);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      const template = mockTemplates.find(t => t.id === meeting.ndaTemplateId) || mockTemplates[0];
      const signedAt = new Date().toISOString();

      const participant = mockParticipants.find(p => {
        const participantMatches = participantId ? p.id === participantId : normalizeEmail(p.email) === normalizeEmail(signerEmail);
        return p.meetingId === meetingId && participantMatches;
      });
      if (!participant || normalizeEmail(participant.email) !== normalizeEmail(signerEmail)) {
        return NextResponse.json({ error: 'Participant does not match signer' }, { status: 403 });
      }

      if (participant.role !== 'host' && !validateMockGuestToken(guestToken, participant, meetingId, signerEmail)) {
        return NextResponse.json({ error: 'Valid guest token required to sign this NDA' }, { status: 403 });
      }

      participant.ndaSignedAt = signedAt;
      if (guestToken) {
        const token = mockGuestTokens.find((gt: any) => gt.token === guestToken);
        if (token && !token.usedAt) token.usedAt = signedAt;
      }
      const ndaContent = meeting.ndaCustomizedContent || template.content;
      const signature = {
        id: crypto.randomUUID(),
        meetingId, participantId: participant.id, templateId: template.id,
        ndaContentSnapshot: ndaContent, signatureData,
        signatureHash: createSignatureHash(`${ndaContent}|${signatureData}|${signedAt}`),
        signerEmail, signerName, signerIp: '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'unknown',
        signedAt, verificationToken: crypto.randomUUID(), verified: true, createdAt: signedAt,
      };
      mockSignatures.push(signature);
      const meetingParticipants = mockParticipants.filter(p => p.meetingId === meetingId);
      const allSigned = meetingParticipants.every(p => p.ndaSignedAt != null);
      if (allSigned && meeting.status === 'awaiting_signatures') {
        meeting.status = 'ready';
        meeting.updatedAt = new Date().toISOString();
      }
      return NextResponse.json(signature, { status: 201 });
    }

    // --- Real Supabase path ---
    const db = getDb();

    const { data: meeting } = await db.from('meetings').select('*, nda_templates(*)').eq('id', meetingId).single();
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const template = meeting.nda_templates || (await db.from('nda_templates').select('*').limit(1).single()).data;
    const signedAt = new Date().toISOString();
    const ndaContent = meeting.nda_customized_content || template?.content || '';

    // Resolve participant
    let participantQuery = db.from('meeting_participants')
      .select('id, email, role')
      .eq('meeting_id', meetingId);
    participantQuery = participantId
      ? participantQuery.eq('id', participantId)
      : participantQuery.eq('email', signerEmail);
    const { data: participant } = await participantQuery.single();

    if (!participant || normalizeEmail(participant.email) !== normalizeEmail(signerEmail)) {
      return NextResponse.json({ error: 'Participant does not match signer' }, { status: 403 });
    }

    if (participant.role === 'host') {
      const session = await getSession();
      const sessionEmail = session?.user?.email;
      if (!sessionEmail || normalizeEmail(sessionEmail) !== normalizeEmail(signerEmail)) {
        return NextResponse.json({ error: 'Authenticated host session required to sign this NDA' }, { status: 403 });
      }
    } else {
      if (!guestToken) {
        return NextResponse.json({ error: 'Valid guest token required to sign this NDA' }, { status: 403 });
      }
      const { data: token, error: tokenErr } = await db.from('guest_tokens')
        .select('id, expires_at')
        .eq('token', guestToken)
        .eq('meeting_id', meetingId)
        .eq('participant_id', participant.id)
        .eq('email', signerEmail)
        .is('used_at', null)
        .single();
      if (tokenErr || !token || new Date(token.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Valid guest token required to sign this NDA' }, { status: 403 });
      }
    }

    // Insert signature
    const { data: signature, error: sigErr } = await db.from('nda_signatures').insert({
      meeting_id: meetingId,
      participant_id: participant.id,
      template_id: template?.id || '',
      nda_content_snapshot: ndaContent,
      signature_data: signatureData,
      signature_hash: createSignatureHash(`${ndaContent}|${signatureData}|${signedAt}`),
      signer_email: signerEmail,
      signer_name: signerName,
      signer_ip: '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'unknown',
      signed_at: signedAt,
      verified: true,
    }).select().single();
    if (sigErr) return NextResponse.json({ error: sigErr.message }, { status: 500 });

    // Update participant nda_signed_at
    await db.from('meeting_participants').update({ nda_signed_at: signedAt }).eq('id', participant.id);
    if (guestToken) await db.from('guest_tokens').update({ used_at: signedAt }).eq('token', guestToken);

    // Check if all participants have signed
    const { data: allParts } = await db.from('meeting_participants').select('nda_signed_at').eq('meeting_id', meetingId);
    const allSigned = allParts?.every((p: any) => p.nda_signed_at != null);
    if (allSigned && meeting.status === 'awaiting_signatures') {
      await db.from('meetings').update({ status: 'ready' }).eq('id', meetingId);
    }

    return NextResponse.json(toCamel(signature), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
