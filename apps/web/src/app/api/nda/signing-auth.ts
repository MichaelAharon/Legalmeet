import { mockGuestTokens, mockParticipants } from '../lib/mock-store';

type MockSignatureAuthorizationInput = {
  meetingId: string;
  participantId?: string;
  signerEmail: string;
  guestToken?: string;
};

type AuthorizedMockSignature = {
  ok: true;
  participant: any;
  guestToken?: any;
};

type RejectedMockSignature = {
  ok: false;
  status: number;
  error: string;
};

export type MockSignatureAuthorization = AuthorizedMockSignature | RejectedMockSignature;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function authorizeMockSignature({
  meetingId,
  participantId,
  signerEmail,
  guestToken,
}: MockSignatureAuthorizationInput): MockSignatureAuthorization {
  const normalizedSignerEmail = normalizeEmail(signerEmail);
  const participant = mockParticipants.find((p: any) => {
    if (p.meetingId !== meetingId) return false;
    if (participantId) return p.id === participantId;
    return normalizeEmail(p.email) === normalizedSignerEmail;
  });

  if (!participant) {
    return { ok: false, status: 403, error: 'Participant is not authorized for this meeting' };
  }

  if (normalizeEmail(participant.email) !== normalizedSignerEmail) {
    return { ok: false, status: 403, error: 'Signer identity does not match participant' };
  }

  // Hosts sign from the authenticated dashboard flow. External participants must
  // present their unique invitation token so a public meeting id cannot forge a signature.
  if (participant.role === 'host') {
    return { ok: true, participant };
  }

  if (!guestToken) {
    return { ok: false, status: 403, error: 'Guest token is required to sign for this participant' };
  }

  const token = mockGuestTokens.find((gt: any) =>
    gt.token === guestToken &&
    gt.meetingId === meetingId &&
    gt.participantId === participant.id &&
    normalizeEmail(gt.email) === normalizeEmail(participant.email)
  );

  if (!token) {
    return { ok: false, status: 403, error: 'Guest token is not authorized for this participant' };
  }

  if (new Date(token.expiresAt) < new Date()) {
    return { ok: false, status: 403, error: 'Guest token has expired' };
  }

  return { ok: true, participant, guestToken: token };
}
