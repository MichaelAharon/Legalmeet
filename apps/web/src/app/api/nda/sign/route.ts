import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { useMock, getDb, toCamel } from '../../lib/db';
import { mockSignatures, mockMeetings, mockTemplates, mockParticipants } from '../../lib/mock-store';
import { authorizeMockSignature } from '../signing-auth';

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
      const authorization = authorizeMockSignature({ meetingId, participantId, signerEmail, guestToken });
      if (!authorization.ok) {
        return NextResponse.json({ error: authorization.error }, { status: authorization.status });
      }
      const template = mockTemplates.find(t => t.id === meeting.ndaTemplateId) || mockTemplates[0];
      const signedAt = new Date().toISOString();
      const hashInput = `${template.content}|${signatureData}|${signedAt}`;
      let hash = 0;
      for (let i = 0; i < hashInput.length; i++) {
        hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
        hash |= 0;
      }
      const participant = authorization.participant;
      const resolvedParticipantId = participant.id;
      if (participant) participant.ndaSignedAt = signedAt;
      if (authorization.guestToken && !authorization.guestToken.usedAt) {
        authorization.guestToken.usedAt = signedAt;
      }
      const ndaContent = meeting.ndaCustomizedContent || template.content;
      const signature = {
        id: crypto.randomUUID(),
        meetingId, participantId: resolvedParticipantId, templateId: template.id,
        ndaContentSnapshot: ndaContent, signatureData,
        signatureHash: Math.abs(hash).toString(16).padStart(16, '0'),
        signerEmail: participant.email,
        signerName: participant.displayName || signerName,
        signerIp: '127.0.0.1',
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

    // Resolve participant and bind the signer to that participant's email.
    let participantQuery = db.from('meeting_participants')
      .select('id, email, display_name')
      .eq('meeting_id', meetingId);
    participantQuery = participantId
      ? participantQuery.eq('id', participantId)
      : participantQuery.eq('email', signerEmail);
    const { data: participant } = await participantQuery.single();
    if (!participant) {
      return NextResponse.json({ error: 'Participant is not authorized for this meeting' }, { status: 403 });
    }

    if (participant.email.toLowerCase() !== signerEmail.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Signer identity does not match participant' }, { status: 403 });
    }

    const session = await getSession();
    const sessionEmail = session?.user?.email;
    if (!sessionEmail || sessionEmail.toLowerCase() !== participant.email.toLowerCase()) {
      return NextResponse.json({ error: 'Authenticated user cannot sign for this participant' }, { status: 403 });
    }

    const resolvedPid = participant.id;

    // Create hash
    const hashInput = `${ndaContent}|${signatureData}|${signedAt}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
      hash |= 0;
    }

    // Insert signature
    const { data: signature, error: sigErr } = await db.from('nda_signatures').insert({
      meeting_id: meetingId,
      participant_id: resolvedPid,
      template_id: template?.id || '',
      nda_content_snapshot: ndaContent,
      signature_data: signatureData,
      signature_hash: Math.abs(hash).toString(16).padStart(16, '0'),
      signer_email: participant.email,
      signer_name: participant.display_name || signerName,
      signer_ip: '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'unknown',
      signed_at: signedAt,
      verified: true,
    }).select().single();
    if (sigErr) return NextResponse.json({ error: sigErr.message }, { status: 500 });

    // Update participant nda_signed_at
    await db.from('meeting_participants').update({ nda_signed_at: signedAt }).eq('id', resolvedPid);

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
