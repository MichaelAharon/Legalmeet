import type { IVideoService } from './video/interface';
import type { ITranscriptionService } from './transcription/interface';
import type { IStorageService } from './storage/interface';
import type { IPDFService } from './pdf/interface';
import type { IAISummaryService } from './ai-summary/interface';
import type { IClauseAnalyzerService } from './clause-analyzer/interface';
import type { ICalendarService } from './calendar/interface';
import type { INotificationService } from './notification/interface';
import type { IBillingService } from './billing/interface';

export function createVideoService(): IVideoService {
  if (process.env.DAILY_API_KEY && process.env.USE_MOCK_SERVICES !== 'true') {
    const { DailyVideoService } = require('./video/daily');
    return new DailyVideoService(process.env.DAILY_API_KEY);
  }
  const { MockVideoService } = require('./video/mock');
  return new MockVideoService();
}

export function createTranscriptionService(): ITranscriptionService {
  if (process.env.DEEPGRAM_API_KEY && process.env.USE_MOCK_SERVICES !== 'true') {
    const { DeepgramTranscriptionService } = require('./transcription/deepgram');
    return new DeepgramTranscriptionService(process.env.DEEPGRAM_API_KEY);
  }
  const { MockTranscriptionService } = require('./transcription/mock');
  return new MockTranscriptionService();
}

export function createStorageService(): IStorageService {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.USE_MOCK_SERVICES !== 'true') {
    const { SupabaseStorageService } = require('./storage/supabase');
    return new SupabaseStorageService(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  const { MockStorageService } = require('./storage/mock');
  return new MockStorageService();
}

export function createPDFService(): IPDFService {
  if (process.env.USE_MOCK_SERVICES !== 'true') {
    const { HTMLPDFService } = require('./pdf/html');
    return new HTMLPDFService();
  }
  const { MockPDFService } = require('./pdf/mock');
  return new MockPDFService();
}

export function createAISummaryService(): IAISummaryService {
  if (process.env.ANTHROPIC_API_KEY && process.env.USE_MOCK_SERVICES !== 'true') {
    const { AnthropicAISummaryService } = require('./ai-summary/anthropic');
    return new AnthropicAISummaryService(process.env.ANTHROPIC_API_KEY);
  }
  const { MockAISummaryService } = require('./ai-summary/mock');
  return new MockAISummaryService();
}

export function createClauseAnalyzerService(): IClauseAnalyzerService {
  if (process.env.ANTHROPIC_API_KEY && process.env.USE_MOCK_SERVICES !== 'true') {
    const { AnthropicClauseAnalyzerService } = require('./clause-analyzer/anthropic');
    return new AnthropicClauseAnalyzerService(process.env.ANTHROPIC_API_KEY);
  }
  const { MockClauseAnalyzerService } = require('./clause-analyzer/mock');
  return new MockClauseAnalyzerService();
}

export function createCalendarService(): ICalendarService {
  // Google Calendar integration requires OAuth - keep mock until configured
  const { MockCalendarService } = require('./calendar/mock');
  return new MockCalendarService();
}

export function createNotificationService(): INotificationService {
  if (process.env.RESEND_API_KEY && process.env.USE_MOCK_SERVICES !== 'true') {
    const { ResendNotificationService } = require('./notification/resend');
    return new ResendNotificationService(process.env.RESEND_API_KEY);
  }
  const { MockNotificationService } = require('./notification/mock');
  return new MockNotificationService();
}

export function createBillingService(): IBillingService {
  // Stripe integration pending - keep mock until configured
  const { MockBillingService } = require('./billing/mock');
  return new MockBillingService();
}
