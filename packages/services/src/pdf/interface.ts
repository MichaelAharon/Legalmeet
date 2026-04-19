export interface IPDFService {
  generateNDAPdf(data: NDAPdfData): Promise<Buffer>;
  generateTranscriptPdf(data: TranscriptPdfData): Promise<Buffer>;
  generateBundlePdf(data: BundlePdfData): Promise<Buffer>;
}

export interface NDAPdfData {
  templateContent: string;
  signatures: Array<{ name: string; email: string; signedAt: string; signatureImage: string }>;
  meetingTitle: string;
}

export interface TranscriptPdfData {
  segments: Array<{ speaker: string; text: string; timestamp: string }>;
  meetingTitle: string;
  meetingDate: string;
}

export interface BundlePdfData {
  nda: NDAPdfData;
  transcript: TranscriptPdfData;
  recordingUrl: string;
  meetingTitle: string;
}
