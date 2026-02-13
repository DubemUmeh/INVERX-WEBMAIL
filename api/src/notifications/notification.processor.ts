import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service.js';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(
      `Processing job ${job.name} with data: ${JSON.stringify(job.data)}`,
    );

    try {
      switch (job.name) {
        case 'send-otp-email':
          const { to, otp, expiresIn } = job.data;
          await this.notificationsService.sendEmail({
            to,
            subject: 'Your Password Reset Code',
            template: 'forgot-password-otp',
            data: { otp, expiresIn },
          });
          break;

        case 'password-changed':
          const { email, timestamp, ip, userAgent } = job.data;
          await this.notificationsService.sendEmail({
            to: email,
            subject: 'Your Password Was Changed',
            template: 'password-changed',
            data: { timestamp, ip, userAgent },
          });
          break;

        case 'waitlist-confirmation':
          await this.notificationsService.sendEmail({
            to: job.data.email,
            subject: "You're on the waitlist!",
            template: 'waitlist-confirmation',
            data: { email: job.data.email },
          });
          break;

        case 'waitlist-admin-notify':
          const { newEmail, recipients, totalCount, name } = job.data;
          await this.notificationsService.sendEmail({
            to: recipients,
            subject: 'New Waitlist Signup',
            template: 'waitlist-admin-notify',
            data: {
              newEmail,
              totalCount,
              name,
              createdAt: new Date().toLocaleString(),
            },
          });
          break;

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process job ${job.name}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
