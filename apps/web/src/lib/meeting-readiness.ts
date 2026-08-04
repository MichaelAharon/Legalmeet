/**
 * Initial meeting status after creation.
 * NDA-required meetings start as scheduled and advance through signature flow.
 * Non-NDA meetings are immediately joinable.
 */
export function getInitialMeetingStatus(ndaRequired: boolean): 'scheduled' | 'ready' {
  return ndaRequired ? 'scheduled' : 'ready';
}

/**
 * Whether the host-facing meeting detail UI should offer Join
 * (as opposed to Prepare / Waiting for Signatures).
 */
export function canShowMeetingJoinCta(meeting: {
  status?: string | null;
  ndaRequired?: boolean | null;
}): boolean {
  if (meeting.status === 'ready') return true;
  // Non-NDA meetings created before status-on-create fix, or left scheduled
  // (production initial schema CHECK lacks `ready`).
  if (meeting.ndaRequired === false && meeting.status === 'scheduled') return true;
  return false;
}
