import type { ITranscriptionService, TranscriptionOptions, TranscriptionSession, TranscriptSegment } from './interface';

const MOCK_PHRASES = [
  { speaker: 'Host', text: 'Thank you for joining this meeting today.' },
  { speaker: 'Participant', text: 'Happy to be here. Shall we discuss the terms?' },
  { speaker: 'Host', text: "Yes, let's go through the key deliverables first." },
  { speaker: 'Participant', text: 'I agree. The timeline looks reasonable.' },
  { speaker: 'Host', text: 'We should also address the confidentiality clause.' },
  { speaker: 'Participant', text: 'Absolutely. Our legal team reviewed the NDA.' },
  { speaker: 'Host', text: 'Great. Let me share the proposed milestones.' },
  { speaker: 'Participant', text: 'The payment terms need some adjustment though.' },
];

export class MockTranscriptionService implements ITranscriptionService {
  async connect(options: TranscriptionOptions): Promise<TranscriptionSession> {
    let index = 0;
    let interval: ReturnType<typeof setInterval> | null = null;

    interval = setInterval(() => {
      const phrase = MOCK_PHRASES[index % MOCK_PHRASES.length];
      const segment: TranscriptSegment = {
        text: phrase.text,
        speaker: phrase.speaker,
        timestamp: new Date().toISOString(),
        confidence: 0.95 + Math.random() * 0.05,
        isFinal: true,
      };
      options.onTranscript(segment);
      index++;
    }, 4000);

    return {
      send(_audioData: ArrayBuffer) {
        // Mock: ignore audio data
      },
      async close() {
        if (interval) clearInterval(interval);
      },
    };
  }
}
