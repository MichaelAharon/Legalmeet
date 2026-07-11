export function getCallAccessState({
  meeting,
  meetingLoading = false,
  meetingError = false,
  signatureStatus,
  signatureLoading = false,
  signatureError = false,
}) {
  if (meetingError) return 'not_found';
  if (meetingLoading || !meeting) return 'checking';
  if (!meeting.ndaRequired) return 'allowed';
  if (signatureLoading) return 'checking';
  if (signatureError || !signatureStatus?.allSigned) return 'blocked';
  return 'allowed';
}
