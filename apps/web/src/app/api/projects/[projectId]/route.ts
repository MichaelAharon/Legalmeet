import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../lib/db';
import { canAccessProject, isProjectOwner, requireApiUser } from '../../lib/auth';
import { mockProjects } from '../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { projectId: string } }) {
  if (useMock()) {
    const project = mockProjects.find(p => p.id === params.projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json(project);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;
  if (!(await canAccessProject(db, auth.user.id, params.projectId))) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data, error } = await db.from('projects').select('*').eq('id', params.projectId).single();
  if (error || !data) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function PATCH(request: NextRequest, { params }: { params: { projectId: string } }) {
  if (useMock()) {
    const project = mockProjects.find(p => p.id === params.projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const body = await request.json();
    Object.assign(project, body, { updatedAt: new Date().toISOString() });
    return NextResponse.json(project);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;
  if (!(await isProjectOwner(db, auth.user.id, params.projectId))) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await request.json();
  const { data, error } = await db.from('projects').update({
    ...(body.name !== undefined && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.status !== undefined && { status: body.status }),
  }).eq('id', params.projectId).eq('owner_id', auth.user.id).select().single();
  if (error || !data) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function DELETE(_req: NextRequest, { params }: { params: { projectId: string } }) {
  if (useMock()) {
    const idx = mockProjects.findIndex(p => p.id === params.projectId);
    if (idx === -1) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    mockProjects.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;
  if (!(await isProjectOwner(db, auth.user.id, params.projectId))) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { error } = await db.from('projects').delete().eq('id', params.projectId).eq('owner_id', auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
