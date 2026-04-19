import type { IClauseAnalyzerService, ClauseAnalysisInput, ClauseAnalysisOutput } from './interface';

export class MockClauseAnalyzerService implements IClauseAnalyzerService {
  async analyzeNDA(input: ClauseAnalysisInput): Promise<ClauseAnalysisOutput> {
    await new Promise(r => setTimeout(r, 1200));

    const hasNonCompete = input.ndaContent.toLowerCase().includes('non-compete') || input.ndaContent.toLowerCase().includes('non-solicitation');
    const hasGoverningLaw = input.ndaContent.toLowerCase().includes('governing law');
    const hasSurvival = input.ndaContent.toLowerCase().includes('survival');

    const risks = [];

    if (hasNonCompete) {
      risks.push({
        clauseText: 'Non-solicitation clause detected',
        riskLevel: 'medium' as const,
        category: 'Restrictive Covenant',
        explanation: 'Non-solicitation clauses may be difficult to enforce in certain jurisdictions and could limit future business opportunities.',
        suggestion: 'Consider limiting the non-solicitation period to 12 months and defining "solicitation" narrowly.',
      });
    }

    if (!hasGoverningLaw) {
      risks.push({
        clauseText: 'Missing governing law clause',
        riskLevel: 'high' as const,
        category: 'Jurisdiction',
        explanation: 'Without a governing law clause, disputes may be subject to unpredictable jurisdiction rules.',
        suggestion: 'Add a governing law clause specifying the jurisdiction for dispute resolution.',
      });
    }

    risks.push({
      clauseText: 'Broad definition of Confidential Information',
      riskLevel: 'low' as const,
      category: 'Scope',
      explanation: 'The definition covers "any and all non-public information" which is standard but broadly inclusive.',
      suggestion: null,
    });

    const missingClauses = [];
    if (!input.ndaContent.toLowerCase().includes('indemnif')) missingClauses.push('Indemnification clause');
    if (!input.ndaContent.toLowerCase().includes('force majeure')) missingClauses.push('Force majeure clause');
    if (!hasSurvival) missingClauses.push('Explicit survival period after termination');

    const overallRisk = risks.some(r => r.riskLevel === 'critical') ? 'high'
      : risks.some(r => r.riskLevel === 'high') ? 'high'
      : risks.some(r => r.riskLevel === 'medium') ? 'medium'
      : 'low';

    return {
      overallRisk,
      risks,
      missingClauses,
      summary: `Analysis of ${input.templateName || 'NDA'}: Found ${risks.length} risk(s) and ${missingClauses.length} potentially missing clause(s). Overall risk level: ${overallRisk}.`,
    };
  }
}
