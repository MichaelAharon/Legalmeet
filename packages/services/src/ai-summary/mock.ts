import type { IAISummaryService, SummaryInput, SummaryOutput } from './interface';

export class MockAISummaryService implements IAISummaryService {
  async generateSummary(input: SummaryInput): Promise<SummaryOutput> {
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1500));

    const speakerNames = [...new Set(input.transcript.map(s => s.speaker))];

    return {
      summary: `Meeting "${input.meetingTitle}" covered key partnership terms and next steps. ${speakerNames.join(' and ')} discussed deliverables, timelines, and confidentiality requirements. Both parties expressed alignment on core objectives with minor adjustments needed on payment terms.`,
      keyDecisions: [
        'Proceed with the proposed partnership framework',
        'Legal team to finalize NDA amendments by end of week',
        'Quarterly review cadence agreed upon',
      ],
      actionItems: [
        {
          description: 'Draft revised partnership agreement with updated payment terms',
          assignee: speakerNames[0] || null,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          description: 'Schedule follow-up call to review final contract',
          assignee: speakerNames[1] || null,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          description: 'Share compliance documentation with counterparty legal team',
          assignee: speakerNames[0] || null,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ],
      keyTopics: ['Partnership Terms', 'Payment Schedule', 'Confidentiality', 'Quarterly Reviews', 'Compliance'],
      sentiment: 'positive',
    };
  }
}
