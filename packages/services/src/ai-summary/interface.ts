export interface IAISummaryService {
  generateSummary(input: SummaryInput): Promise<SummaryOutput>;
}

export interface SummaryInput {
  meetingTitle: string;
  meetingDescription: string | null;
  transcript: Array<{ speaker: string; text: string; timestamp: string }>;
  participants: Array<{ name: string; email: string; role: string }>;
}

export interface SummaryOutput {
  summary: string;
  keyDecisions: string[];
  actionItems: Array<{
    description: string;
    assignee: string | null;
    dueDate: string | null;
  }>;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
}
