type SignableParticipant = {
  ndaSignedAt?: unknown;
  nda_signed_at?: unknown;
};

type Row = Record<string, unknown>;

function readField(row: Row, camelKey: string, snakeKey?: string) {
  return row[camelKey] ?? row[snakeKey ?? camelKey.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)];
}

export function normalizeEmail(email: unknown) {
  return typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
}

export function canAccessMeetingByEmail(userEmail: unknown, participants: Row[], hostEmail?: unknown) {
  const normalizedUserEmail = normalizeEmail(userEmail);
  if (!normalizedUserEmail) return false;

  if (normalizeEmail(hostEmail) === normalizedUserEmail) return true;

  return participants.some((participant) => (
    normalizeEmail(readField(participant, 'email')) === normalizedUserEmail
  ));
}

export function redactParticipant(participant: Row) {
  return {
    id: readField(participant, 'id'),
    meetingId: readField(participant, 'meetingId'),
    email: readField(participant, 'email'),
    displayName: readField(participant, 'displayName'),
    role: readField(participant, 'role'),
    ndaSignedAt: readField(participant, 'ndaSignedAt'),
    status: readField(participant, 'status'),
    createdAt: readField(participant, 'createdAt'),
  };
}

export function redactSignature(signature: Row) {
  return {
    id: readField(signature, 'id'),
    meetingId: readField(signature, 'meetingId'),
    participantId: readField(signature, 'participantId'),
    templateId: readField(signature, 'templateId'),
    signatureHash: readField(signature, 'signatureHash'),
    signerEmail: readField(signature, 'signerEmail'),
    signerName: readField(signature, 'signerName'),
    signedAt: readField(signature, 'signedAt'),
    verified: readField(signature, 'verified'),
    createdAt: readField(signature, 'createdAt'),
  };
}

export function buildSignatureStatus<
  TParticipant extends SignableParticipant,
  TSignature,
>(participants: TParticipant[], signatures: TSignature[]) {
  const signed = participants.filter((participant) => (
    participant.ndaSignedAt != null || participant.nda_signed_at != null
  ));
  const pending = participants.filter((participant) => (
    participant.ndaSignedAt == null && participant.nda_signed_at == null
  ));

  return {
    allSigned: pending.length === 0 && participants.length > 0,
    participants,
    signatures,
    signed,
    pending,
  };
}
