import { NextRequest, NextResponse } from 'next/server';
import { mockNDAAnalyses } from '../../lib/mock-store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.ndaContent) {
    return NextResponse.json({ error: 'ndaContent is required' }, { status: 400 });
  }

  const content = body.ndaContent as string;
  const hasNonCompete = content.toLowerCase().includes('non-solicitation') || content.toLowerCase().includes('non-compete');
  const hasGoverningLaw = content.toLowerCase().includes('governing law');
  const hasSurvival = content.toLowerCase().includes('survival');

  const risks: any[] = [];

  if (hasNonCompete) {
    risks.push({
      id: `risk-${crypto.randomUUID().slice(0, 8)}`,
      clauseText: 'Non-solicitation / non-compete clause',
      riskLevel: 'medium',
      category: 'Restrictive Covenant',
      explanation: 'Non-solicitation clauses may be difficult to enforce in certain jurisdictions.',
      suggestion: 'Consider limiting the non-solicitation period to 12 months and defining scope narrowly.',
    });
  }

  if (!hasGoverningLaw) {
    risks.push({
      id: `risk-${crypto.randomUUID().slice(0, 8)}`,
      clauseText: 'Missing governing law clause',
      riskLevel: 'high',
      category: 'Jurisdiction',
      explanation: 'Without a governing law clause, disputes may be subject to unpredictable jurisdiction rules.',
      suggestion: 'Add a governing law clause specifying the jurisdiction for dispute resolution.',
    });
  }

  risks.push({
    id: `risk-${crypto.randomUUID().slice(0, 8)}`,
    clauseText: 'Broad definition of Confidential Information',
    riskLevel: 'low',
    category: 'Scope',
    explanation: 'The definition is broadly inclusive, which is standard but may need narrowing for specific use cases.',
    suggestion: null,
  });

  const missingClauses: string[] = [];
  if (!content.toLowerCase().includes('indemnif')) missingClauses.push('Indemnification clause');
  if (!content.toLowerCase().includes('force majeure')) missingClauses.push('Force majeure clause');
  if (!hasSurvival) missingClauses.push('Explicit survival period after termination');
  if (!content.toLowerCase().includes('data protection') && !content.toLowerCase().includes('gdpr')) missingClauses.push('Data protection compliance clause');

  const overallRisk = risks.some((r: any) => r.riskLevel === 'critical' || r.riskLevel === 'high') ? 'high'
    : risks.some((r: any) => r.riskLevel === 'medium') ? 'medium' : 'low';

  const analysis = {
    id: `analysis-${crypto.randomUUID().slice(0, 8)}`,
    meetingId: body.meetingId || null,
    templateId: body.templateId || null,
    ndaContent: content.substring(0, 200) + '...',
    overallRisk,
    risks,
    missingClauses,
    summary: `Analysis complete: Found ${risks.length} risk(s) and ${missingClauses.length} potentially missing clause(s). Overall risk level: ${overallRisk}.`,
    generatedBy: 'claude',
    model: 'claude-sonnet-4-6',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  mockNDAAnalyses.push(analysis);
  return NextResponse.json(analysis, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const meetingId = searchParams.get('meetingId');
  const templateId = searchParams.get('templateId');

  let results = [...mockNDAAnalyses];
  if (meetingId) results = results.filter((a: any) => a.meetingId === meetingId);
  if (templateId) results = results.filter((a: any) => a.templateId === templateId);

  return NextResponse.json(results);
}
