/**
 * NDA requirement is a create-time commitment for a meeting.
 * Allowing clients to PATCH ndaRequired=false after creation short-circuits
 * join/room/call gates that treat !ndaRequired as "signatures not needed".
 */
export function getNdaRequirementDisableRejection(
  currentNdaRequired: boolean | null | undefined,
  patchNdaRequired: unknown,
): { error: string; status: number } | null {
  if (patchNdaRequired === undefined) return null;
  if (patchNdaRequired !== false) return null;
  // Treat null/undefined as required (matches create default of true).
  if (currentNdaRequired === false) return null;

  return {
    error:
      'Cannot disable NDA requirement after the meeting was created with NDA required. Create a new meeting without an NDA instead.',
    status: 409,
  };
}
