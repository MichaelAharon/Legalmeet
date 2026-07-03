type SignableParticipant = {
  ndaSignedAt?: unknown;
  nda_signed_at?: unknown;
};

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
