import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../lib/db';
import { mockProjects } from '../lib/mock-store';

export async function GET() {
  if (useMock()) return NextResponse.json(mockProjects);

  const db = getDb();
  const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toCamel));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || body.name.length < 2) {
      return NextResponse.json({ error: 'Project name must be at least 2 characters' }, { status: 400 });
    }

    if (useMock()) {
      const project = {
        id: crypto.randomUUID(),
        ownerId: 'mock-user-001',
        name: body.name,
        description: body.description || null,
        status: 'active',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProjects.push(project);
      return NextResponse.json(project, { status: 201 });
    }

    const db = getDb();
    const { data, error } = await db.from('projects').insert({
      owner_id: 'mock-user-001', // TODO: replace with auth.uid()
      name: body.name,
      description: body.description || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toCamel(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
