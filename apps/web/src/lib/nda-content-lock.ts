/**
 * Once any NDA signature exists for a meeting, the meeting's NDA text and
 * template binding are part of an in-progress legal record. Allowing PATCH to
 * change ndaCustomizedContent / ndaTemplateId lets later signers commit to
 * different terms than earlier signers under the same meeting.
 */
export function isNdaContentFieldPatch(body: Record<string, unknown>): boolean {
  return body.ndaCustomizedContent !== undefined || body.ndaTemplateId !== undefined;
}

export function getNdaContentLockRejection(
  signatureCount: number,
  body: Record<string, unknown>,
): { error: string; status: number } | null {
  if (!isNdaContentFieldPatch(body)) return null;
  if (signatureCount <= 0) return null;

  return {
    error:
      'Cannot change NDA content or template after signatures have been collected. Create a new meeting to use different terms.',
    status: 409,
  };
}
