import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import type { getDb } from './db';

type DbClient = ReturnType<typeof getDb>;

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
};

export type ApiUserContext =
  | { db: DbClient; user: ApiUser; response?: never }
  | { response: NextResponse; db?: never; user?: never };

export async function requireApiUser(db: DbClient): Promise<ApiUserContext> {
  const session = await getSession();
  const email = session?.user?.email;

  if (!email) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data, error } = await db.from('profiles').select('id, email, full_name').eq('email', email).limit(2);
  if (error) {
    return { response: NextResponse.json({ error: error.message }, { status: 500 }) };
  }

  if (!data?.length) {
    return { response: NextResponse.json({ error: 'User profile not found' }, { status: 403 }) };
  }

  // Email is the only current Auth0-to-profile link. If it is ambiguous, fail closed.
  if (data.length > 1) {
    return { response: NextResponse.json({ error: 'User profile is ambiguous' }, { status: 403 }) };
  }

  return {
    db,
    user: {
      id: data[0].id,
      email: data[0].email,
      name: data[0].full_name,
    },
  };
}

export async function getAccessibleProjectIds(db: DbClient, userId: string) {
  const [owned, memberships] = await Promise.all([
    db.from('projects').select('id').eq('owner_id', userId),
    db.from('project_members').select('project_id').eq('user_id', userId),
  ]);

  if (owned.error) throw owned.error;
  if (memberships.error) throw memberships.error;

  return Array.from(new Set([
    ...(owned.data || []).map((project: any) => project.id),
    ...(memberships.data || []).map((membership: any) => membership.project_id),
  ]));
}

export async function canAccessProject(db: DbClient, userId: string, projectId: string) {
  const ids = await getAccessibleProjectIds(db, userId);
  return ids.includes(projectId);
}

export async function isProjectOwner(db: DbClient, userId: string, projectId: string) {
  const { data, error } = await db.from('projects').select('id').eq('id', projectId).eq('owner_id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getAccessibleMeetingIds(db: DbClient, userId: string) {
  const [hosted, participating] = await Promise.all([
    db.from('meetings').select('id').eq('host_id', userId),
    db.from('meeting_participants').select('meeting_id').eq('user_id', userId),
  ]);

  if (hosted.error) throw hosted.error;
  if (participating.error) throw participating.error;

  return Array.from(new Set([
    ...(hosted.data || []).map((meeting: any) => meeting.id),
    ...(participating.data || []).map((participant: any) => participant.meeting_id),
  ]));
}

export async function canAccessMeeting(db: DbClient, userId: string, meetingId: string) {
  const ids = await getAccessibleMeetingIds(db, userId);
  return ids.includes(meetingId);
}

export async function isMeetingHost(db: DbClient, userId: string, meetingId: string) {
  const { data, error } = await db.from('meetings').select('id').eq('id', meetingId).eq('host_id', userId).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
