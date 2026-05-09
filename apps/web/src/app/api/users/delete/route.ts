import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDb, useMock } from '../../lib/db';
import { mockProjects, mockMeetings, mockSignatures, mockRecordings, mockBundles, mockParticipants } from '../../lib/mock-store';

export async function POST() {
  if (useMock()) {
    // GDPR delete: clear all user data from mock stores
    mockProjects.length = 0;
    mockMeetings.length = 0;
    mockSignatures.length = 0;
    mockRecordings.length = 0;
    mockBundles.length = 0;
    mockParticipants.length = 0;
    return NextResponse.json({ success: true, message: 'All user data deleted', deletedAt: new Date().toISOString() });
  }

  const session = await getSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const db = getDb();
  const { data: profiles, error: profileError } = await db
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .limit(2);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  if (profiles.length > 1) {
    return NextResponse.json({ error: 'Cannot safely resolve user profile for deletion' }, { status: 409 });
  }

  const { error: deleteError } = await db.rpc('delete_user_data', { target_user_id: profiles[0].id });
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'All user data deleted', deletedAt: new Date().toISOString() });
}
