export interface RoomAccessMeeting {
  host_id?: string | null;
  hostId?: string | null;
}

export interface RoomAccessParticipant {
  id?: string | null;
  user_id?: string | null;
  userId?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface RoomAccessDecision {
  authorized: boolean;
  isOwner: boolean;
  userId: string | null;
}

export function normalizeEmail(value: unknown): string | null {
  return typeof value === 'string' && value.trim()
    ? value.trim().toLowerCase()
    : null;
}

function normalizeId(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function participantUserId(participant: RoomAccessParticipant): string | null {
  return normalizeId(participant.user_id ?? participant.userId);
}

function meetingHostId(meeting: RoomAccessMeeting): string | null {
  return normalizeId(meeting.host_id ?? meeting.hostId);
}

export function authorizeRoomAccess({
  meeting,
  participants,
  sessionEmail,
  profileId,
}: {
  meeting: RoomAccessMeeting;
  participants: RoomAccessParticipant[];
  sessionEmail: unknown;
  profileId?: string | null;
}): RoomAccessDecision {
  const normalizedEmail = normalizeEmail(sessionEmail);
  const normalizedProfileId = normalizeId(profileId);
  const hostId = meetingHostId(meeting);

  if (!normalizedEmail && !normalizedProfileId) {
    return { authorized: false, isOwner: false, userId: null };
  }

  const matchingParticipant = participants.find((participant) => {
    const emailMatches = normalizedEmail && normalizeEmail(participant.email) === normalizedEmail;
    const userIdMatches = normalizedProfileId && participantUserId(participant) === normalizedProfileId;
    return Boolean(emailMatches || userIdMatches);
  });

  const isOwner = Boolean(
    (hostId && normalizedProfileId && hostId === normalizedProfileId) ||
    (matchingParticipant && matchingParticipant.role === 'host')
  );

  if (!isOwner && !matchingParticipant) {
    return { authorized: false, isOwner: false, userId: null };
  }

  return {
    authorized: true,
    isOwner,
    userId: isOwner
      ? hostId ?? participantUserId(matchingParticipant!) ?? normalizeId(matchingParticipant?.id) ?? normalizedProfileId ?? normalizedEmail
      : participantUserId(matchingParticipant!) ?? normalizeId(matchingParticipant?.id) ?? normalizedProfileId ?? normalizedEmail,
  };
}
