export type ParticipantSignatureState = {
  role?: string | null;
  ndaSignedAt?: unknown;
  nda_signed_at?: unknown;
};

/**
 * Host readiness must key off the host participant's NDA signature timestamp,
 * not meeting.hostSignedAt. Clients can PATCH hostSignedAt (and awaiting_signatures)
 * without creating an nda_signatures row; prepare/meeting-link then permanently
 * block the host from signing while allSigned stays false forever.
 */
export function hostParticipantHasSigned(
  participants: ParticipantSignatureState[] | null | undefined,
): boolean {
  if (!participants?.length) return false;
  const host = participants.find((p) => p.role === 'host');
  if (!host) return false;
  return host.ndaSignedAt != null || host.nda_signed_at != null;
}

/** Prepare UI should only lock once the host actually signed. */
export function isHostNdaPrepareComplete(
  participants: ParticipantSignatureState[] | null | undefined,
): boolean {
  return hostParticipantHasSigned(participants);
}
