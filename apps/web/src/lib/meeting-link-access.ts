/**
 * Whether Join should be offered once the meeting is loaded.
 * Non-NDA meetings are joinable without signatures (meeting-link + join page).
 */
export function canJoinMeeting(meeting: {
  ndaRequired?: boolean | null;
}, allSigned: boolean): boolean {
  return !meeting.ndaRequired || allSigned;
}

/**
 * Whether the meeting-link page should show NDA signature UI
 * (status tracker, sign flow, waiting-for-others).
 */
export function shouldShowMeetingLinkNdaFlow(meeting: {
  ndaRequired?: boolean | null;
}): boolean {
  return !!meeting.ndaRequired;
}
