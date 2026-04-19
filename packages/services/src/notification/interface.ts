export interface INotificationService {
  send(notification: NotificationInput): Promise<void>;
  sendBatch(notifications: NotificationInput[]): Promise<void>;
  sendEmail(input: EmailInput): Promise<void>;
}

export interface NotificationInput {
  userId: string;
  type: 'meeting_scheduled' | 'nda_ready' | 'nda_signed' | 'all_signed' | 'recording_ready' | 'summary_ready' | 'meeting_reminder';
  title: string;
  body: string;
  resourceType?: string;
  resourceId?: string;
}

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}
