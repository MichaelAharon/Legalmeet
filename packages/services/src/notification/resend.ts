import { Resend } from 'resend';
import type { INotificationService, NotificationInput, EmailInput } from './interface';

export class ResendNotificationService implements INotificationService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string = 'notifications@legalmeet.com') {
    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  async send(notification: NotificationInput): Promise<void> {
    // In-app notifications are handled by DB insert.
    // This service handles email delivery.
    console.log(`[Notification] ${notification.type}: ${notification.title}`);
  }

  async sendBatch(notifications: NotificationInput[]): Promise<void> {
    for (const n of notifications) {
      await this.send(n);
    }
  }

  async sendEmail(input: EmailInput): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  }
}
