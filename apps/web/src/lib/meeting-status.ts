type ParticipantSignatureState = {
  ndaSignedAt?: unknown;
  nda_signed_at?: unknown;
};

/** True when there is at least one participant and every participant has signed. */
export function allParticipantsHaveSigned(participants: ParticipantSignatureState[]): boolean {
  return participants.length > 0 && participants.every(
    (participant) => participant.ndaSignedAt != null || participant.nda_signed_at != null,
  );
}

/**
 * Promote a meeting to `ready` once every participant has signed.
 *
 * Hosts normally sign while status is still `scheduled`; invites then move the
 * meeting to `awaiting_signatures`. Without promoting from both states (and
 * re-checking on invite activation), host-only / already-complete meetings stay
 * stuck and never expose the Join CTA.
 */
export function resolveStatusAfterSignatures(
  currentStatus: string | null | undefined,
  participants: ParticipantSignatureState[],
): string | null {
  if (!allParticipantsHaveSigned(participants)) return null;
  if (currentStatus === 'awaiting_signatures' || currentStatus === 'scheduled') {
    return 'ready';
  }
  return null;
}

/**
 * When activating invites, prefer `ready` if signatures are already complete
 * instead of leaving the meeting stuck in `awaiting_signatures`.
 */
export function resolveStatusForInviteActivation(
  requestedStatus: string | null | undefined,
  participants: ParticipantSignatureState[],
): string | null | undefined {
  if (requestedStatus !== 'awaiting_signatures') return requestedStatus;
  return allParticipantsHaveSigned(participants) ? 'ready' : requestedStatus;
}
