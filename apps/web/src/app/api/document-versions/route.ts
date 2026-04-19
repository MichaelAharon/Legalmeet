import { NextRequest, NextResponse } from 'next/server';
import { mockDocumentVersions } from '../lib/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get('documentId');
  const documentType = searchParams.get('documentType');

  let results = [...mockDocumentVersions];
  if (documentId) results = results.filter((v: any) => v.documentId === documentId);
  if (documentType) results = results.filter((v: any) => v.documentType === documentType);

  results.sort((a: any, b: any) => b.versionNumber - a.versionNumber);
  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.documentId || !body.content) {
    return NextResponse.json({ error: 'documentId and content are required' }, { status: 400 });
  }

  const existing = mockDocumentVersions
    .filter((v: any) => v.documentId === body.documentId)
    .sort((a: any, b: any) => b.versionNumber - a.versionNumber);
  const nextVersion = existing.length > 0 ? existing[0].versionNumber + 1 : 1;

  const version = {
    id: `dv-${crypto.randomUUID().slice(0, 8)}`,
    documentType: body.documentType || 'nda_template',
    documentId: body.documentId,
    versionNumber: nextVersion,
    content: body.content,
    changeSummary: body.changeSummary || null,
    createdBy: 'mock-user-001',
    createdAt: new Date().toISOString(),
  };

  mockDocumentVersions.push(version);
  return NextResponse.json(version, { status: 201 });
}
