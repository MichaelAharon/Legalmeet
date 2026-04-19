import Anthropic from '@anthropic-ai/sdk';
import type { IClauseAnalyzerService, ClauseAnalysisInput, ClauseAnalysisOutput } from './interface';

export class AnthropicClauseAnalyzerService implements IClauseAnalyzerService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeNDA(input: ClauseAnalysisInput): Promise<ClauseAnalysisOutput> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a legal NDA analyst. Analyze this NDA for risks, missing clauses, and provide recommendations.

${input.templateName ? `Template: ${input.templateName}` : ''}
${input.context ? `Context: ${input.context}` : ''}

NDA Content:
${input.ndaContent}

Analyze each clause for risk level. Check for common missing clauses like:
- Governing law / jurisdiction
- Term and termination
- Return/destruction of confidential information
- Non-solicitation
- Remedies for breach
- Carve-outs for legally required disclosures

Respond in JSON with this exact structure:
{
  "overallRisk": "low" | "medium" | "high",
  "risks": [
    {
      "clauseText": "exact text from NDA",
      "riskLevel": "low" | "medium" | "high" | "critical",
      "category": "category name",
      "explanation": "why this is risky",
      "suggestion": "recommended fix or null"
    }
  ],
  "missingClauses": ["clause name 1", "clause name 2"],
  "summary": "overall assessment in 2-3 sentences"
}

Return ONLY valid JSON, no markdown.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    return {
      overallRisk: parsed.overallRisk || 'medium',
      risks: (parsed.risks || []).map((r: any) => ({
        clauseText: r.clauseText,
        riskLevel: r.riskLevel,
        category: r.category,
        explanation: r.explanation,
        suggestion: r.suggestion || null,
      })),
      missingClauses: parsed.missingClauses || [],
      summary: parsed.summary || '',
    };
  }
}
