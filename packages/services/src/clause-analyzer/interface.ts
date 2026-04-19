export interface IClauseAnalyzerService {
  analyzeNDA(input: ClauseAnalysisInput): Promise<ClauseAnalysisOutput>;
}

export interface ClauseAnalysisInput {
  ndaContent: string;
  templateName?: string;
  context?: string;
}

export interface ClauseRiskResult {
  clauseText: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  explanation: string;
  suggestion: string | null;
}

export interface ClauseAnalysisOutput {
  overallRisk: 'low' | 'medium' | 'high';
  risks: ClauseRiskResult[];
  missingClauses: string[];
  summary: string;
}
