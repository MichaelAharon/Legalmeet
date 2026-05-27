import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
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

function removeWhere<T>(items: T[], predicate: (item: T) => boolean) {
  const before = items.length;
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (predicate(items[i])) items.splice(i, 1);
  }
  return before - items.length;
}

function deleteMockUserData(userId: string) {
  const projectIds = new Set(
    mockProjects
      .filter((project: any) => project.ownerId === userId)
      .map((project: any) => project.id)
  );
  const tagIds = new Set(mockTags.filter((tag: any) => tag.ownerId === userId).map((tag: any) => tag.id));
  const meetingIds = new Set(
    mockMeetings
      .filter((meeting: any) => meeting.hostId === userId || projectIds.has(meeting.projectId))
      .map((meeting: any) => meeting.id)
  );
  const participantIds = new Set(
    mockParticipants
      .filter((participant: any) => participant.userId === userId || meetingIds.has(participant.meetingId))
      .map((participant: any) => participant.id)
  );

  return {
    projects: removeWhere(mockProjects, (project: any) => project.ownerId === userId),
    subProjects: removeWhere(mockSubProjects, (subProject: any) => projectIds.has(subProject.projectId)),
    meetings: removeWhere(mockMeetings, (meeting: any) => meetingIds.has(meeting.id)),
    participants: removeWhere(mockParticipants, (participant: any) => participantIds.has(participant.id)),
    signatures: removeWhere(
      mockSignatures,
      (signature: any) => meetingIds.has(signature.meetingId) || participantIds.has(signature.participantId)
    ),
    recordings: removeWhere(mockRecordings, (recording: any) => meetingIds.has(recording.meetingId)),
    transcripts: removeWhere(mockTranscripts, (transcript: any) => meetingIds.has(transcript.meetingId)),
    bundles: removeWhere(mockBundles, (bundle: any) => meetingIds.has(bundle.meetingId)),
    templates: removeWhere(mockTemplates, (template: any) => template.ownerId === userId),
    summaries: removeWhere(mockSummaries, (summary: any) => meetingIds.has(summary.meetingId)),
    auditLogs: removeWhere(
      mockAuditLogs,
      (auditLog: any) => auditLog.userId === userId || meetingIds.has(auditLog.resourceId) || projectIds.has(auditLog.resourceId)
    ),
    guestTokens: removeWhere(
      mockGuestTokens,
      (guestToken: any) => meetingIds.has(guestToken.meetingId) || participantIds.has(guestToken.participantId)
    ),
    calendarEvents: removeWhere(mockCalendarEvents, (event: any) => meetingIds.has(event.meetingId)),
    documentVersions: removeWhere(mockDocumentVersions, (version: any) => version.createdBy === userId),
    notifications: removeWhere(mockNotifications, (notification: any) => notification.userId === userId),
    ndaAnalyses: removeWhere(mockNDAAnalyses, (analysis: any) => meetingIds.has(analysis.meetingId)),
    tags: removeWhere(mockTags, (tag: any) => tag.ownerId === userId),
    resourceTags: removeWhere(
      mockResourceTags,
      (resourceTag: any) =>
        tagIds.has(resourceTag.tagId) || projectIds.has(resourceTag.resourceId) || meetingIds.has(resourceTag.resourceId)
    ),
    subscriptions: removeWhere(mockSubscriptions, (subscription: any) => subscription.userId === userId),
    analytics: removeWhere(mockAnalytics, (analytics: any) => analytics.userId === userId),
  };
}

export async function POST() {
  if (useMock()) {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Mock account deletion is disabled outside development' },
        { status: 403 }
      );
    }

    const deleted = deleteMockUserData(MOCK_USER_ID);
    return NextResponse.json({
      success: true,
      message: 'Mock user data deleted',
      deleted,
      deletedAt: new Date().toISOString(),
    });
  }

  const session = await getSession();
  const userId = session?.user?.sub;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await getDb().rpc('delete_user_data', { target_user_id: userId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deletedAt: new Date().toISOString() });
}
