import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../../../lib/db';
import { canAccessProject, isProjectOwner, requireApiUser } from '../../../../lib/auth';
import { mockSubProjects } from '../../../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { projectId: string; subProjectId: string } }) {
  if (useMock()) {
    const sub = mockSubProjects.find(s => s.id === params.subProjectId && s.projectId === params.projectId);
    if (!sub) return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
    return NextResponse.json(sub);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;
  if (!(await canAccessProject(db, auth.user.id, params.projectId))) {
    return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
  }

  const { data, error } = await db.from('sub_projects').select('*')
    .eq('id', params.subProjectId).eq('project_id', params.projectId).single();
  if (error || !data) return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function PATCH(request: NextRequest, { params }: { params: { projectId: string; subProjectId: string } }) {
  if (useMock()) {
    const sub = mockSubProjects.find(s => s.id === params.subProjectId && s.projectId === params.projectId);
    if (!sub) return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
    const body = await request.json();
    Object.assign(sub, body, { updatedAt: new Date().toISOString() });
    return NextResponse.json(sub);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;
  if (!(await isProjectOwner(db, auth.user.id, params.projectId))) {
    return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
  }

  const body = await request.json();
  const { data, error } = await db.from('sub_projects').update({
    ...(body.name !== undefined && { name: body.name }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.status !== undefined && { status: body.status }),
  }).eq('id', params.subProjectId).eq('project_id', params.projectId).select().single();
  if (error || !data) return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function DELETE(_req: NextRequest, { params }: { params: { projectId: string; subProjectId: string } }) {
  if (useMock()) {
    const idx = mockSubProjects.findIndex(s => s.id === params.subProjectId && s.projectId === params.projectId);
    if (idx === -1) return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
    mockSubProjects.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;
  if (!(await isProjectOwner(db, auth.user.id, params.projectId))) {
    return NextResponse.json({ error: 'Sub-project not found' }, { status: 404 });
  }

  const { error } = await db.from('sub_projects').delete()
    .eq('id', params.subProjectId).eq('project_id', params.projectId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
