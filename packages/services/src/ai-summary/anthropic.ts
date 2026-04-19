import Anthropic from '@anthropic-ai/sdk';
import type { IAISummaryService, SummaryInput, SummaryOutput } from './interface';

export class AnthropicAISummaryService implements IAISummaryService {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateSummary(input: SummaryInput): Promise<SummaryOutput> {
    const transcriptText = input.transcript
      .map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
      .join('\n');

    const participantList = input.participants
      .map(p => `${p.name} (${p.email}) - ${p.role}`)
      .join('\n');

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a legal meeting analyst. Analyze this meeting transcript and produce a structured summary.

Meeting: ${input.meetingTitle}
${input.meetingDescription ? `Description: ${input.meetingDescription}` : ''}

Participants:
${participantList}

Transcript:
${transcriptText}

Respond in JSON with this exact structure:
{
  "summary": "2-3 paragraph summary of the meeting",
  "keyDecisions": ["decision 1", "decision 2"],
  "actionItems": [{"description": "task", "assignee": "name or null", "dueDate": "date or null"}],
  "keyTopics": ["topic 1", "topic 2"],
  "sentiment": "positive" | "neutral" | "negative" | "mixed"
}

Return ONLY valid JSON, no markdown.`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary,
      keyDecisions: parsed.keyDecisions || [],
      actionItems: (parsed.actionItems || []).map((a: any) => ({
        description: a.description,
        assignee: a.assignee || null,
        dueDate: a.dueDate || null,
      })),
      keyTopics: parsed.keyTopics || [],
      sentiment: parsed.sentiment || 'neutral',
    };
  }
}
