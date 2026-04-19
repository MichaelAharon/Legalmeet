import { NextRequest, NextResponse } from 'next/server';
import { mockAuditLogs } from '../../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { meetingId: string } }) {
  const logs = mockAuditLogs
    .filter((l: any) => l.resourceId === params.meetingId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: { meetingId: string } }) {
  const body = await req.json();
  const log = {
    id: `audit-${crypto.randomUUID().slice(0, 8)}`,
    userId: body.userId || 'mock-user-001',
    action: body.action,
    resourceType: 'meeting',
    resourceId: params.meetingId,
    details: body.details || {},
    ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || '',
    createdAt: new Date().toISOString(),
  };
  mockAuditLogs.push(log);
  return NextResponse.json(log, { status: 201 });
}
