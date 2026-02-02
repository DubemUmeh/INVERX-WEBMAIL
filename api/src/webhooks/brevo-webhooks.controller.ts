/**
 * Brevo Webhooks Controller
 *
 * Handles webhook events from Brevo including spam complaints,
 * bounces, and blocks. Auto-disables senders on threshold.
 */

import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { BrevoRepository } from '../brevo/brevo.repository.js';
import { db } from '../database/drizzle.js';
import { brevoSenders } from '../database/schema/index.js';
import { eq } from 'drizzle-orm';

interface BrevoWebhookEvent {
  event: string;
  email: string;
  'message-id'?: string;
  ts?: number;
  reason?: string;
  tag?: string;
}

@Controller('webhooks/brevo')
export class BrevoWebhooksController {
  private readonly logger = new Logger(BrevoWebhooksController.name);

  constructor(private brevoRepository: BrevoRepository) {}

  /**
   * Handle Brevo webhook events
   * Events: spam, hardBounce, softBounce, blocked, complaint
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() body: BrevoWebhookEvent | BrevoWebhookEvent[],
    @Headers('x-brevo-signature') signature?: string,
  ) {
    // Handle both single event and batch
    const events = Array.isArray(body) ? body : [body];

    for (const event of events) {
      await this.processEvent(event);
    }

    return { received: true };
  }

  private async processEvent(event: BrevoWebhookEvent) {
    const eventType = event.event?.toLowerCase();
    const senderEmail = event.email;

    this.logger.log(`Brevo webhook: ${eventType} for ${senderEmail}`);

    // Find sender by email (across all domains)
    const [sender] = await db
      .select()
      .from(brevoSenders)
      .where(eq(brevoSenders.email, senderEmail));

    if (!sender) {
      this.logger.debug(`Sender ${senderEmail} not found in database`);
      return;
    }

    switch (eventType) {
      case 'spam':
      case 'complaint':
        await this.handleComplaint(sender);
        break;

      case 'hardbounce':
      case 'blocked':
        await this.handleBounce(sender, event.reason);
        break;

      case 'softbounce':
        // Log but don't take action on soft bounces
        this.logger.debug(`Soft bounce for ${senderEmail}: ${event.reason}`);
        break;

      default:
        this.logger.debug(`Unhandled event type: ${eventType}`);
    }
  }

  private async handleComplaint(sender: any) {
    this.logger.warn(`Spam complaint for sender ${sender.email}`);

    // Increment complaint count and potentially disable
    const updated = await this.brevoRepository.incrementSenderComplaintCount(
      sender.id,
    );

    if (updated?.isDisabled) {
      this.logger.error(
        `Sender ${sender.email} DISABLED due to too many complaints`,
      );
    }
  }

  private async handleBounce(sender: any, reason?: string) {
    this.logger.warn(`Hard bounce/block for sender ${sender.email}: ${reason}`);

    // Track bounces (could add bounce counter similar to complaints)
    // For now just log it
  }
}
