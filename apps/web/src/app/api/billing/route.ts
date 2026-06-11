import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../lib/db';
import { requireApiUser } from '../lib/auth';
import { mockSubscriptions } from '../lib/mock-store';

export async function GET() {
  if (useMock()) {
    const sub = mockSubscriptions.find((s: any) => s.userId === 'mock-user-001');
    if (!sub) return NextResponse.json(null);
    return NextResponse.json(sub);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  const { data } = await db.from('subscriptions').select('*').eq('user_id', auth.user.id).maybeSingle();
  if (!data) return NextResponse.json(null);
  return NextResponse.json(toCamel(data));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'checkout') {
    // TODO: Replace with real Stripe checkout session
    return NextResponse.json({
      url: `https://checkout.stripe.com/mock?plan=${body.plan || 'team'}`,
    });
  }

  if (action === 'portal') {
    // TODO: Replace with real Stripe billing portal
    return NextResponse.json({
      url: 'https://billing.stripe.com/mock/portal',
    });
  }

  if (action === 'cancel') {
    if (useMock()) {
      const sub = mockSubscriptions.find((s: any) => s.userId === 'mock-user-001');
      if (sub) {
        sub.status = 'canceled';
        sub.updatedAt = new Date().toISOString();
      }
      return NextResponse.json({ success: true });
    }

    const db = getDb();
    const auth = await requireApiUser(db);
    if (auth.response) return auth.response;

    await db.from('subscriptions').update({ status: 'canceled' }).eq('user_id', auth.user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
