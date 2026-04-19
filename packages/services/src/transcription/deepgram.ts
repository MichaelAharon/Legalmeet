import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import type { ITranscriptionService, TranscriptionOptions, TranscriptionSession } from './interface';

export class DeepgramTranscriptionService implements ITranscriptionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(options: TranscriptionOptions): Promise<TranscriptionSession> {
    const deepgram = createClient(this.apiKey);

    const connection = deepgram.listen.live({
      model: options.model || 'nova-3',
      language: options.language || 'en',
      smart_format: true,
      diarize: true,
      interim_results: true,
      utterance_end_ms: 1000,
      vad_events: true,
    });

    return new Promise((resolve, reject) => {
      connection.on(LiveTranscriptionEvents.Open, () => {
        connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
          const alternative = data.channel?.alternatives?.[0];
          if (!alternative?.transcript) return;

          options.onTranscript({
            text: alternative.transcript,
            speaker: `Speaker ${data.channel?.alternatives?.[0]?.words?.[0]?.speaker ?? 0}`,
            timestamp: new Date().toISOString(),
            confidence: alternative.confidence || 0,
            isFinal: data.is_final || false,
          });
        });

        connection.on(LiveTranscriptionEvents.Error, (err: any) => {
          options.onError(new Error(err.message || 'Deepgram error'));
        });

        resolve({
          send(audioData: ArrayBuffer) {
            connection.send(Buffer.from(audioData));
          },
          async close() {
            connection.requestClose();
          },
        });
      });

      connection.on(LiveTranscriptionEvents.Error, (err: any) => {
        reject(new Error(err.message || 'Failed to connect to Deepgram'));
      });
    });
  }
}
