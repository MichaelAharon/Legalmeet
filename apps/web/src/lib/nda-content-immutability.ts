/**
 * Once any NDA signature exists for a meeting, the agreement text and template
 * binding must stay frozen. Later signers snapshot meeting.ndaCustomizedContent
 * (or the linked template), while readiness only checks participant timestamps —
 * so mutating those fields after the first signature creates inconsistent legal
 * records that still mark the meeting ready.
 */
export function getNdaContentMutationRejection(
  hasExistingSignatures: boolean,
  current: {
    ndaCustomizedContent?: string | null;
    ndaTemplateId?: string | null;
  },
  patch: {
    ndaCustomizedContent?: unknown;
    ndaTemplateId?: unknown;
  },
): { error: string; status: number } | null {
  if (!hasExistingSignatures) return null;

  const contentChanging =
    patch.ndaCustomizedContent !== undefined &&
    patch.ndaCustomizedContent !== current.ndaCustomizedContent;
  const templateChanging =
    patch.ndaTemplateId !== undefined &&
    patch.ndaTemplateId !== current.ndaTemplateId;

  if (!contentChanging && !templateChanging) return null;

  return {
    error:
      'Cannot change NDA content or template after signatures exist. Create a new meeting to use a different agreement.',
    status: 409,
  };
}
