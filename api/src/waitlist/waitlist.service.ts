import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { WaitlistRepository } from './waitlist.repository.js';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly waitlistRepository: WaitlistRepository,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async join(data: { name?: string; email: string }) {
    try {
      const result = await this.waitlistRepository.create({
        email: data.email,
        name: data.name || null,
      });

      // Send user confirmation (fire-and-forget)
      this.notificationsService
        .sendWaitlistConfirmation(data.email)
        .catch((err) =>
          this.logger.error(
            `Failed to send waitlist confirmation: ${err.message}`,
          ),
        );

      // Send admin notification (fire-and-forget)
      const adminEmails = this.configService.get<string>(
        'WAITLIST_ADMIN_EMAILS',
      );
      if (adminEmails) {
        const totalCount = await this.waitlistRepository.count();
        this.notificationsService
          .sendWaitlistAdminNotify(
            data.email,
            data.name || null,
            adminEmails.split(','),
            totalCount,
          )
          .catch((err) =>
            this.logger.error(
              `Failed to send admin notification: ${err.message}`,
            ),
          );
      }

      return {
        message: 'Thanks for joining! Check your email for confirmation.',
      };
    } catch (error) {
      if (error.code === '23505') {
        // Postgres unique violation
        return {
          message: "You're already on the waitlist! We'll notify you soon.",
        };
      }
      this.logger.error(
        `Failed to join waitlist: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getAll() {
    return await this.waitlistRepository.findAll();
  }
}
