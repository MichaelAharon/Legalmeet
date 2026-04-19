import { NextResponse } from 'next/server';
import { mockProjects, mockMeetings, mockSignatures, mockRecordings, mockBundles, mockParticipants } from '../../lib/mock-store';

export async function POST() {
  // GDPR delete: clear all user data from mock stores
  mockProjects.length = 0;
  mockMeetings.length = 0;
  mockSignatures.length = 0;
  mockRecordings.length = 0;
  mockBundles.length = 0;
  mockParticipants.length = 0;
  return NextResponse.json({ success: true, message: 'All user data deleted', deletedAt: new Date().toISOString() });
}
