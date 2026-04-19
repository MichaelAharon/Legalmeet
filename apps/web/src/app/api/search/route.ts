import { NextRequest, NextResponse } from 'next/server';
import { mockProjects, mockMeetings, mockTemplates, mockTags, mockResourceTags } from '../lib/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const type = searchParams.get('type'); // 'projects' | 'meetings' | 'templates' | null (all)
  const tagId = searchParams.get('tagId');

  if (!q && !tagId) return NextResponse.json({ projects: [], meetings: [], templates: [] });

  const results: { projects: any[]; meetings: any[]; templates: any[] } = { projects: [], meetings: [], templates: [] };

  // Get resources with specific tag
  const taggedResourceIds = tagId
    ? new Set(mockResourceTags.filter((rt: any) => rt.tagId === tagId).map((rt: any) => rt.resourceId))
    : null;

  if (!type || type === 'projects') {
    results.projects = mockProjects.filter((p: any) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      const matchesTag = !taggedResourceIds || taggedResourceIds.has(p.id);
      return matchesQuery && matchesTag;
    });
  }

  if (!type || type === 'meetings') {
    results.meetings = mockMeetings.filter((m: any) => {
      const matchesQuery = !q || m.title.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q);
      const matchesTag = !taggedResourceIds || taggedResourceIds.has(m.id);
      return matchesQuery && matchesTag;
    });
  }

  if (!type || type === 'templates') {
    results.templates = mockTemplates.filter((t: any) => {
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q) || t.content.toLowerCase().includes(q);
      return matchesQuery;
    });
  }

  return NextResponse.json(results);
}
