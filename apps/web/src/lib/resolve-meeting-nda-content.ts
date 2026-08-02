/**
 * Resolve the NDA text invitees should review before signing.
 *
 * Meetings often store only `ndaTemplateId` with null `ndaCustomizedContent`
 * (API create default and several fixtures). Sign/guest paths already fall back
 * to the live template body; display surfaces must use the same resolution or
 * invitees can consent to empty text while the API snapshots the template.
 */
export function resolveMeetingNdaContent(
  customizedContent: string | null | undefined,
  templateContent: string | null | undefined,
): string {
  if (typeof customizedContent === 'string' && customizedContent.length > 0) {
    return customizedContent;
  }

  if (typeof templateContent === 'string' && templateContent.length > 0) {
    return templateContent;
  }

  return '';
}
