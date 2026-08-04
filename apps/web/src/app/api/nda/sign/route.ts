import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../lib/db';
import { mockSignatures, mockMeetings, mockTemplates, mockParticipants } from '../../lib/mock-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, participantId, signatureData, signerName, signerEmail } = body;

    if (!meetingId || !signatureData || !signerName || !signerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (useMock()) {
      const meeting = mockMeetings.find(m => m.id === meetingId);
      if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      const template = mockTemplates.find(t => t.id === meeting.ndaTemplateId) || mockTemplates[0];
      const signedAt = new Date().toISOString();
      const hashInput = `${template.content}|${signatureData}|${signedAt}`;
      let hash = 0;
      for (let i = 0; i < hashInput.length; i++) {
        hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
        hash |= 0;
      }
      let resolvedParticipantId = participantId;
      if (!resolvedParticipantId) {
        const participant = mockParticipants.find(p => p.meetingId === meetingId && p.email === signerEmail);
        resolvedParticipantId = participant?.id || crypto.randomUUID();
      }
      const participant = mockParticipants.find(p => p.id === resolvedParticipantId);
      if (participant) {
        participant.ndaSignedAt = signedAt;
        // Keep meeting.hostSignedAt in sync with an actual host signature — never trust client PATCH alone.
        if (participant.meetingId === meetingId && participant.role === 'host') {
          meeting.hostSignedAt = signedAt;
          meeting.updatedAt = new Date().toISOString();
        }
      }
      const ndaContent = meeting.ndaCustomizedContent || template.content;
      const signature = {
        id: crypto.randomUUID(),
        meetingId, participantId: resolvedParticipantId, templateId: template.id,
        ndaContentSnapshot: ndaContent, signatureData,
        signatureHash: Math.abs(hash).toString(16).padStart(16, '0'),
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
    let resolvedPid = participantId;
    let resolvedRole: string | null = null;
    if (!resolvedPid) {
      const { data: p } = await db.from('meeting_participants').select('id, role')
        .eq('meeting_id', meetingId).eq('email', signerEmail).single();
      resolvedPid = p?.id || crypto.randomUUID();
      resolvedRole = p?.role ?? null;
    } else {
      const { data: p } = await db.from('meeting_participants').select('role')
        .eq('id', resolvedPid).eq('meeting_id', meetingId).single();
      resolvedRole = p?.role ?? null;
    }

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
      signer_email: signerEmail,
      signer_name: signerName,
      signer_ip: '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'unknown',
      signed_at: signedAt,
      verified: true,
    }).select().single();
    if (sigErr) return NextResponse.json({ error: sigErr.message }, { status: 500 });

    // Update participant nda_signed_at
    await db.from('meeting_participants').update({ nda_signed_at: signedAt }).eq('id', resolvedPid);

    // Sync hostSignedAt only when the host participant actually signed
    if (resolvedRole === 'host') {
      await db.from('meetings').update({ host_signed_at: signedAt }).eq('id', meetingId);
    }

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
