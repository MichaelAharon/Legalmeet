import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { useMock, getDb } from '../../lib/db';
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
import { clearMockUserData, deleteSupabaseUserData, type UserDeletionDb } from './delete-user-data';

export async function POST() {
  if (useMock()) {
    clearMockUserData({
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
    });
    return NextResponse.json({ success: true, message: 'All user data deleted', deletedAt: new Date().toISOString() });
  }

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await deleteSupabaseUserData(getDb() as unknown as UserDeletionDb, session.user.email);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ success: true, message: 'All user data deleted', deletedAt: new Date().toISOString() });
}
