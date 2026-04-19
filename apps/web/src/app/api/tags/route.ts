import { NextRequest, NextResponse } from 'next/server';
import { mockTags, mockResourceTags } from '../lib/mock-store';

export async function GET() {
  return NextResponse.json(mockTags);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const tag = {
    id: `tag-${crypto.randomUUID().slice(0, 8)}`,
    name: body.name,
    color: body.color || '#6b7280',
    ownerId: 'mock-user-001',
    createdAt: new Date().toISOString(),
  };
  mockTags.push(tag);
  return NextResponse.json(tag, { status: 201 });
}

// DELETE — remove tag
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const idx = mockTags.findIndex((t: any) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
  mockTags.splice(idx, 1);

  // Remove all resource associations
  for (let i = mockResourceTags.length - 1; i >= 0; i--) {
    if (mockResourceTags[i].tagId === id) mockResourceTags.splice(i, 1);
  }

  return NextResponse.json({ success: true });
}

// PATCH — assign/remove tag from resource
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { tagId, resourceType, resourceId, action } = body;

  if (action === 'remove') {
    const idx = mockResourceTags.findIndex(
      (rt: any) => rt.tagId === tagId && rt.resourceType === resourceType && rt.resourceId === resourceId
    );
    if (idx !== -1) mockResourceTags.splice(idx, 1);
    return NextResponse.json({ success: true });
  }

  // Default: assign
  const existing = mockResourceTags.find(
    (rt: any) => rt.tagId === tagId && rt.resourceType === resourceType && rt.resourceId === resourceId
  );
  if (existing) return NextResponse.json(existing);

  const rt = {
    id: `rt-${crypto.randomUUID().slice(0, 8)}`,
    tagId, resourceType, resourceId,
    createdAt: new Date().toISOString(),
  };
  mockResourceTags.push(rt);
  return NextResponse.json(rt, { status: 201 });
}
