type MeetingParticipant = {
  user_id?: string | null;
};

type MeetingAuthorizationRecord = {
  host_id?: string | null;
  meeting_participants?: MeetingParticipant[] | null;
};

export function canManageMeeting(meeting: MeetingAuthorizationRecord, profileId: string) {
  return meeting.host_id === profileId;
}

export function canViewMeeting(meeting: MeetingAuthorizationRecord, profileId: string) {
  return canManageMeeting(meeting, profileId)
    || Boolean(meeting.meeting_participants?.some((participant) => participant.user_id === profileId));
}
