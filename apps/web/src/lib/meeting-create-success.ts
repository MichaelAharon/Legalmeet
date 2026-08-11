/**
 * Gate for showing "Meeting Created & NDA Signed" after Book a Meeting.
 * Create alone is not enough when an NDA is required — content save and host
 * sign must also succeed, otherwise the UI would claim a signed meeting.
 */
export function shouldMarkNdaMeetingCreated(steps: {
  meetingCreated: boolean;
  contentSaved: boolean;
  hostSigned: boolean;
}): boolean {
  return Boolean(steps.meetingCreated && steps.contentSaved && steps.hostSigned);
}
