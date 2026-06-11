import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../lib/db';
import { requireApiUser } from '../lib/auth';
import { mockNotifications } from '../lib/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  if (useMock()) {
    let results = [...mockNotifications].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (unreadOnly) results = results.filter((n: any) => !n.read);
    return NextResponse.json(results);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  let query = db.from('notifications').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false });
  if (unreadOnly) query = query.eq('read', false);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toCamel));
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, read } = body;

  if (useMock()) {
    if (id === 'all') {
      mockNotifications.forEach((n: any) => { n.read = true; });
      return NextResponse.json({ success: true });
    }
    const notification = mockNotifications.find((n: any) => n.id === id);
    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    notification.read = read !== undefined ? read : true;
    return NextResponse.json(notification);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  if (id === 'all') {
    await db.from('notifications').update({ read: true }).eq('user_id', auth.user.id).eq('read', false);
    return NextResponse.json({ success: true });
  }
  const { data, error } = await db.from('notifications').update({ read: read !== undefined ? read : true })
    .eq('id', id).eq('user_id', auth.user.id).select().single();
  if (error || !data) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}
