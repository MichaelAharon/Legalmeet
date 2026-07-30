import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../../lib/db';
import { mockMeetings, mockSignatures, mockTemplates } from '../../../lib/mock-store';
import {
  getTemplateContentMutationRejection,
  meetingDependsOnLiveTemplate,
} from '@/lib/nda-template-immutability';

function mockHasDependentSignedMeetings(templateId: string): boolean {
  const dependentMeetingIds = new Set(
    mockMeetings
      .filter((meeting) => meetingDependsOnLiveTemplate(meeting, templateId))
      .map((meeting) => meeting.id),
  );
  return mockSignatures.some((signature) => dependentMeetingIds.has(signature.meetingId));
}

export async function GET(_req: NextRequest, { params }: { params: { templateId: string } }) {
  if (useMock()) {
    const template = mockTemplates.find(t => t.id === params.templateId);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json(template);
  }

  const db = getDb();
  const { data, error } = await db.from('nda_templates').select('*').eq('id', params.templateId).single();
  if (error || !data) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  return NextResponse.json(toCamel(data));
}

export async function PATCH(request: NextRequest, { params }: { params: { templateId: string } }) {
  if (useMock()) {
    const template = mockTemplates.find(t => t.id === params.templateId);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    const body = await request.json();
    const contentChanging =
      body.content !== undefined && body.content !== template.content;
    const rejection = getTemplateContentMutationRejection({
      contentChanging,
      hasDependentSignedMeetings: mockHasDependentSignedMeetings(params.templateId),
    });
    if (rejection) {
      return NextResponse.json({ error: rejection.error }, { status: rejection.status });
    }
    Object.assign(template, body, { updatedAt: new Date().toISOString() });
    return NextResponse.json(template);
  }

  const db = getDb();
  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.content !== undefined) updates.content = body.content;
  if (body.templateVars !== undefined) updates.template_vars = body.templateVars;
  if (body.status !== undefined) updates.status = body.status;
  if (body.category !== undefined) updates.category = body.category;

  if (body.content !== undefined) {
    const { data: existing, error: existingError } = await db
      .from('nda_templates')
      .select('content')
      .eq('id', params.templateId)
      .single();
    if (existingError || !existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const contentChanging = body.content !== existing.content;
    if (contentChanging) {
      const { data: meetings, error: meetingsError } = await db
        .from('meetings')
        .select('id, nda_template_id, nda_customized_content')
        .eq('nda_template_id', params.templateId);
      if (meetingsError) {
        return NextResponse.json({ error: meetingsError.message }, { status: 500 });
      }

      const dependentMeetingIds = (meetings || [])
        .filter((meeting) => meetingDependsOnLiveTemplate(meeting, params.templateId))
        .map((meeting) => meeting.id);

      let hasDependentSignedMeetings = false;
      if (dependentMeetingIds.length > 0) {
        const { count, error: signatureError } = await db
          .from('nda_signatures')
          .select('id', { count: 'exact', head: true })
          .in('meeting_id', dependentMeetingIds);
        if (signatureError) {
          return NextResponse.json({ error: signatureError.message }, { status: 500 });
        }
        hasDependentSignedMeetings = (count ?? 0) > 0;
      }

      const rejection = getTemplateContentMutationRejection({
        contentChanging,
        hasDependentSignedMeetings,
      });
      if (rejection) {
        return NextResponse.json({ error: rejection.error }, { status: rejection.status });
      }
    }
  }

  const { data, error } = await db.from('nda_templates').update(updates)
    .eq('id', params.templateId).select().single();
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
  const { error } = await db.from('nda_templates').delete().eq('id', params.templateId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
