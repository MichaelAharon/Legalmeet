import { NextRequest, NextResponse } from 'next/server';
import { useMock, getDb, toCamel } from '../../lib/db';
import { mockTemplates } from '../../lib/mock-store';

export async function GET() {
  if (useMock()) return NextResponse.json(mockTemplates);

  const db = getDb();
  const { data, error } = await db.from('nda_templates').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toCamel));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.content) return NextResponse.json({ error: 'Name and content required' }, { status: 400 });

    if (useMock()) {
      const template = {
        id: crypto.randomUUID(),
        ownerId: 'mock-user-001',
        name: body.name,
        content: body.content,
        templateVars: body.templateVars || [],
        isDefault: false,
        version: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTemplates.push(template);
      return NextResponse.json(template, { status: 201 });
    }

    const db = getDb();
    const { data, error } = await db.from('nda_templates').insert({
      owner_id: 'mock-user-001',
      name: body.name,
      content: body.content,
      template_vars: body.templateVars || [],
      category: body.category || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(toCamel(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
