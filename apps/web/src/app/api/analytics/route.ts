import { NextRequest, NextResponse } from 'next/server';
import { mockAnalytics, mockMeetings, mockSignatures, mockTemplates, mockRecordings, mockTranscripts } from '../lib/mock-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period');

  if (period) {
    const snapshot = mockAnalytics.find((a: any) => a.period === period);
    if (snapshot) return NextResponse.json(snapshot);
  }

  // Generate live analytics from current data
  const totalMeetings = mockMeetings.length;
  const completedMeetings = mockMeetings.filter((m: any) => m.status === 'completed').length;
  const totalSignatures = mockSignatures.length;

  // Template usage
  const templateCounts = new Map<string, number>();
  mockMeetings.forEach((m: any) => {
    if (m.ndaTemplateId) {
      templateCounts.set(m.ndaTemplateId, (templateCounts.get(m.ndaTemplateId) || 0) + 1);
    }
  });
  const topTemplates = Array.from(templateCounts.entries())
    .map(([id, count]) => {
      const template = mockTemplates.find((t: any) => t.id === id);
      return { templateId: id, name: template?.name || 'Unknown', count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Status distribution
  const statusCounts: Record<string, number> = {};
  mockMeetings.forEach((m: any) => {
    statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
  });

  return NextResponse.json({
    meetingsTotal: totalMeetings,
    meetingsCompleted: completedMeetings,
    ndasSigned: totalSignatures,
    recordingsCount: mockRecordings.length,
    transcriptsCount: mockTranscripts.length,
    avgMeetingDurationMinutes: completedMeetings > 0
      ? Math.round(mockMeetings.filter((m: any) => m.durationSeconds).reduce((sum: number, m: any) => sum + (m.durationSeconds || 0), 0) / completedMeetings / 60)
      : null,
    topTemplates,
    statusDistribution: statusCounts,
    recentActivity: mockMeetings.slice(0, 5).map((m: any) => ({
      id: m.id, title: m.title, status: m.status, scheduledAt: m.scheduledAt,
    })),
  });
}
