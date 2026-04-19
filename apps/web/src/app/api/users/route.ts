import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'mock-user-001',
    email: 'demo@legalmeet.com',
    fullName: 'Demo User',
    avatarUrl: null,
    company: 'LegalMeet Demo',
    role: 'admin',
    timezone: 'UTC',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
