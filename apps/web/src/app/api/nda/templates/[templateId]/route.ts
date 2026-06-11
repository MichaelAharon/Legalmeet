import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../../lib/db';
import { requireApiUser } from '../../../lib/auth';
import { mockTemplates } from '../../../lib/mock-store';

export async function GET(_req: NextRequest, { params }: { params: { templateId: string } }) {
  if (useMock()) {
    const template = mockTemplates.find(t => t.id === params.templateId);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json(template);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  const { data, error } = await db.from('nda_templates').select('*')
    .eq('id', params.templateId)
    .or(`owner_id.eq.${auth.user.id},is_default.eq.true`)
    .single();
  if (error || !data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function PATCH(request: NextRequest, { params }: { params: { templateId: string } }) {
  if (useMock()) {
    const template = mockTemplates.find(t => t.id === params.templateId);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    const body = await request.json();
    Object.assign(template, body, { updatedAt: new Date().toISOString() });
    return NextResponse.json(template);
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.content !== undefined) updates.content = body.content;
  if (body.templateVars !== undefined) updates.template_vars = body.templateVars;
  if (body.status !== undefined) updates.status = body.status;
  if (body.category !== undefined) updates.category = body.category;

  const { data, error } = await db.from('nda_templates').update(updates)
    .eq('id', params.templateId).eq('owner_id', auth.user.id).select().single();
  if (error || !data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function DELETE(_req: NextRequest, { params }: { params: { templateId: string } }) {
  if (useMock()) {
    const idx = mockTemplates.findIndex(t => t.id === params.templateId);
    if (idx === -1) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    mockTemplates.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  const db = getDb();
  const auth = await requireApiUser(db);
  if (auth.response) return auth.response;

  const { data, error } = await db.from('nda_templates').delete()
    .eq('id', params.templateId).eq('owner_id', auth.user.id).select('id').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
