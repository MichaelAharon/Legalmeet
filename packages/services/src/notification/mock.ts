import type { INotificationService, NotificationInput, EmailInput } from './interface';

export class MockNotificationService implements INotificationService {
  private sent: NotificationInput[] = [];
  private emails: EmailInput[] = [];

  async send(notification: NotificationInput): Promise<void> {
    this.sent.push(notification);
    console.log(`[MockNotification] ${notification.type}: ${notification.title} → user ${notification.userId}`);
  }

  async sendBatch(notifications: NotificationInput[]): Promise<void> {
    for (const n of notifications) {
      await this.send(n);
    }
  }

  async sendEmail(input: EmailInput): Promise<void> {
    this.emails.push(input);
    console.log(`[MockEmail] To: ${input.to}, Subject: ${input.subject}`);
  }
}
