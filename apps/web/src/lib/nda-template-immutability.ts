/**
 * Templates are shared library documents. Content edits remain allowed for
 * future meetings, but must not rewrite the agreement mid-signature for
 * meetings that still resolve NDA text from the live template.
 */
export function getTemplateContentMutationRejection(options: {
  contentChanging: boolean;
  hasDependentSignedMeetings: boolean;
}): { error: string; status: 409 } | null {
  if (!options.contentChanging) return null;
  if (!options.hasDependentSignedMeetings) return null;

  return {
    error:
      'Cannot change template content while meetings with signatures still depend on the live template text',
    status: 409,
  };
}

export function meetingDependsOnLiveTemplate(meeting: {
  ndaTemplateId?: string | null;
  nda_template_id?: string | null;
  ndaCustomizedContent?: string | null;
  nda_customized_content?: string | null;
}, templateId: string): boolean {
  const meetingTemplateId = meeting.ndaTemplateId ?? meeting.nda_template_id ?? null;
  if (meetingTemplateId !== templateId) return false;

  const customized =
    meeting.ndaCustomizedContent ?? meeting.nda_customized_content ?? null;
  return !(typeof customized === 'string' && customized.length > 0);
}
