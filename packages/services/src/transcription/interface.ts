export interface ITranscriptionService {
  connect(options: TranscriptionOptions): Promise<TranscriptionSession>;
}

export interface TranscriptionOptions {
  language: string;
  model: string;
  onTranscript: (segment: TranscriptSegment) => void;
  onError: (error: Error) => void;
}

export interface TranscriptionSession {
  send(audioData: ArrayBuffer): void;
  close(): Promise<void>;
}

export interface TranscriptSegment {
  text: string;
  speaker: string;
  timestamp: string;
  confidence: number;
  isFinal: boolean;
}
