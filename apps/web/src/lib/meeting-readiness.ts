type ParticipantSignatureState = {
  ndaSignedAt?: unknown;
  nda_signed_at?: unknown;
};

export function canCreateMeetingRoom(ndaRequired: boolean, participants: ParticipantSignatureState[]) {
  if (!ndaRequired) return true;
  return participants.length > 0 && participants.every((participant) => (
    participant.ndaSignedAt != null || participant.nda_signed_at != null
  ));
}
