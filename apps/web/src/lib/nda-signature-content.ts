/**
 * Resolve the NDA text that should be frozen into a signature snapshot.
 *
 * Once any signature exists for a meeting, later signers must reuse that
 * immutable snapshot so live template edits (or other content drift) cannot
 * produce divergent legal records for the same meeting.
 */
export function resolveNdaContentForSignature(
  existingSnapshots: Array<string | null | undefined>,
  meetingCustomizedContent: string | null | undefined,
  templateContent: string | null | undefined,
): string | null {
  for (const snapshot of existingSnapshots) {
    if (typeof snapshot === 'string' && snapshot.length > 0) {
      return snapshot;
    }
  }

  if (typeof meetingCustomizedContent === 'string' && meetingCustomizedContent.length > 0) {
    return meetingCustomizedContent;
  }

  if (typeof templateContent === 'string' && templateContent.length > 0) {
    return templateContent;
  }

  return null;
}
