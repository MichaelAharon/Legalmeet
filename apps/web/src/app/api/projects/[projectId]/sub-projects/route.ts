import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../../lib/db';
import { mockSubProjects } from '../../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { projectId: string } }) {
  if (useMock()) {
    const subs = mockSubProjects.filter(s => s.projectId === params.projectId);
    return NextResponse.json(subs);
  }

  const db = getDb();
  const { data, error } = await db.from('sub_projects').select('*')
    .eq('project_id', params.projectId).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toCamel));
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    if (useMock()) {
      const sub = {
        id: crypto.randomUUID(),
        projectId: params.projectId,
        parentSubProjectId: body.parentSubProjectId || null,
        name: body.name,
        description: body.description || null,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockSubProjects.push(sub);
      return NextResponse.json(sub, { status: 201 });
    }

    const db = getDb();
    const { data, error } = await db.from('sub_projects').insert({
      project_id: params.projectId,
      parent_sub_project_id: body.parentSubProjectId || null,
      name: body.name,
      description: body.description || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toCamel(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
