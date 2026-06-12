import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { getDb, useMock } from '../../lib/db';
import {
  mockAnalytics,
  mockAuditLogs,
  mockBundles,
  mockCalendarEvents,
  mockDocumentVersions,
  mockGuestTokens,
  mockMeetings,
  mockNDAAnalyses,
  mockNotifications,
  mockParticipants,
  mockProjects,
  mockRecordings,
  mockResourceTags,
  mockSignatures,
  mockSubProjects,
  mockSubscriptions,
  mockSummaries,
  mockTags,
  mockTemplates,
  mockTranscripts,
} from '../../lib/mock-store';

const MOCK_USER_ID = 'mock-user-001';
const MOCK_USER_EMAIL = 'demo@legalmeet.com';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MutableRecord = Record<string, any>;

function removeWhere<T>(records: T[], shouldRemove: (record: T) => boolean) {
  let removed = 0;
  for (let index = records.length - 1; index >= 0; index--) {
    if (shouldRemove(records[index])) {
      records.splice(index, 1);
      removed++;
    }
  }
  return removed;
}

function deleteMockUserData() {
  const ownedProjectIds = new Set(mockProjects.filter((project: MutableRecord) => project.ownerId === MOCK_USER_ID).map((project: MutableRecord) => project.id));
  const ownedTemplateIds = new Set(mockTemplates.filter((template: MutableRecord) => template.ownerId === MOCK_USER_ID).map((template: MutableRecord) => template.id));
  const ownedTagIds = new Set(mockTags.filter((tag: MutableRecord) => tag.ownerId === MOCK_USER_ID).map((tag: MutableRecord) => tag.id));
  const ownedMeetingIds = new Set(
    mockMeetings
      .filter((meeting: MutableRecord) => meeting.hostId === MOCK_USER_ID || ownedProjectIds.has(meeting.projectId))
      .map((meeting: MutableRecord) => meeting.id),
  );
  const ownedParticipantIds = new Set(
    mockParticipants
      .filter((participant: MutableRecord) =>
        participant.userId === MOCK_USER_ID ||
        participant.email === MOCK_USER_EMAIL ||
        ownedMeetingIds.has(participant.meetingId),
      )
      .map((participant: MutableRecord) => participant.id),
  );
  const ownedRecordingIds = new Set(
    mockRecordings
      .filter((recording: MutableRecord) => ownedMeetingIds.has(recording.meetingId))
      .map((recording: MutableRecord) => recording.id),
  );

  return {
    projects: removeWhere(mockProjects, (project: MutableRecord) => ownedProjectIds.has(project.id)),
    subProjects: removeWhere(mockSubProjects, (subProject: MutableRecord) => ownedProjectIds.has(subProject.projectId)),
    meetings: removeWhere(mockMeetings, (meeting: MutableRecord) => ownedMeetingIds.has(meeting.id)),
    participants: removeWhere(mockParticipants, (participant: MutableRecord) => ownedParticipantIds.has(participant.id)),
    signatures: removeWhere(mockSignatures, (signature: MutableRecord) =>
      ownedMeetingIds.has(signature.meetingId) ||
      ownedParticipantIds.has(signature.participantId) ||
      signature.signerEmail === MOCK_USER_EMAIL,
    ),
    recordings: removeWhere(mockRecordings, (recording: MutableRecord) => ownedMeetingIds.has(recording.meetingId)),
    transcripts: removeWhere(mockTranscripts, (transcript: MutableRecord) =>
      ownedMeetingIds.has(transcript.meetingId) || ownedRecordingIds.has(transcript.recordingId),
    ),
    bundles: removeWhere(mockBundles, (bundle: MutableRecord) => ownedMeetingIds.has(bundle.meetingId)),
    summaries: removeWhere(mockSummaries, (summary: MutableRecord) => ownedMeetingIds.has(summary.meetingId)),
    templates: removeWhere(mockTemplates, (template: MutableRecord) => ownedTemplateIds.has(template.id)),
    auditLogs: removeWhere(mockAuditLogs, (entry: MutableRecord) => entry.userId === MOCK_USER_ID || ownedMeetingIds.has(entry.resourceId)),
    guestTokens: removeWhere(mockGuestTokens, (token: MutableRecord) =>
      ownedMeetingIds.has(token.meetingId) ||
      ownedParticipantIds.has(token.participantId) ||
      token.email === MOCK_USER_EMAIL,
    ),
    calendarEvents: removeWhere(mockCalendarEvents, (event: MutableRecord) =>
      event.userId === MOCK_USER_ID ||
      event.attendeeEmails?.includes(MOCK_USER_EMAIL) ||
      ownedMeetingIds.has(event.meetingId),
    ),
    documentVersions: removeWhere(mockDocumentVersions, (version: MutableRecord) =>
      version.createdBy === MOCK_USER_ID ||
      ownedTemplateIds.has(version.documentId),
    ),
    notifications: removeWhere(mockNotifications, (notification: MutableRecord) => notification.userId === MOCK_USER_ID),
    ndaAnalyses: removeWhere(mockNDAAnalyses, (analysis: MutableRecord) =>
      analysis.generatedBy === MOCK_USER_ID ||
      ownedMeetingIds.has(analysis.meetingId) ||
      ownedTemplateIds.has(analysis.templateId),
    ),
    resourceTags: removeWhere(mockResourceTags, (resourceTag: MutableRecord) =>
      ownedTagIds.has(resourceTag.tagId) ||
      ownedMeetingIds.has(resourceTag.resourceId) ||
      ownedProjectIds.has(resourceTag.resourceId) ||
      ownedTemplateIds.has(resourceTag.resourceId),
    ),
    tags: removeWhere(mockTags, (tag: MutableRecord) => ownedTagIds.has(tag.id)),
    subscriptions: removeWhere(mockSubscriptions, (subscription: MutableRecord) => subscription.userId === MOCK_USER_ID),
    analytics: removeWhere(mockAnalytics, (analytics: MutableRecord) => analytics.userId === MOCK_USER_ID),
  };
}

async function resolveProfileId(user: { sub?: string; email?: string | null }) {
  if (user.sub && UUID_PATTERN.test(user.sub)) {
    return user.sub;
  }

  if (!user.email) {
    return null;
  }

  const db = getDb();
  const { data, error } = await db.from('profiles').select('id').eq('email', user.email).limit(2);
  if (error || data?.length !== 1) {
    return null;
  }

  return data[0].id;
}

export async function POST() {
  if (useMock()) {
    const deletedCounts = deleteMockUserData();
    return NextResponse.json({
      success: true,
      message: 'Demo user data deleted',
      deletedAt: new Date().toISOString(),
      deletedCounts,
    });
  }

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const profileId = await resolveProfileId(session.user);
  if (!profileId) {
    return NextResponse.json({ error: 'Unable to resolve user profile for deletion' }, { status: 409 });
  }

  const db = getDb();
  const { error } = await db.rpc('delete_user_data', { target_user_id: profileId });
  if (error) {
    return NextResponse.json({ error: 'Failed to delete user data' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'User data deleted', deletedAt: new Date().toISOString() });
}
