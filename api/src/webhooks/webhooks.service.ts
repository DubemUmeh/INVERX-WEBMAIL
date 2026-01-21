import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { WebhooksRepository } from './webhooks.repository.js';
import { CreateWebhookDto } from './dto/index.js';

@Injectable()
export class WebhooksService {
  constructor(private webhooksRepository: WebhooksRepository) {}

  async getWebhooks(accountId: string) {
    return this.webhooksRepository.findAll(accountId);
  }

  async createWebhook(accountId: string, dto: CreateWebhookDto) {
    // Generate a signing secret for the webhook
    const secret = randomBytes(32).toString('hex');

    const webhook = await this.webhooksRepository.create({
      accountId,
      url: dto.url,
      secret,
      events: dto.events,
    });

    return {
      id: webhook.id,
      url: webhook.url,
      secret, // Only shown on creation
      events: webhook.events,
      status: webhook.status,
      createdAt: webhook.createdAt,
    };
  }

  async deleteWebhook(accountId: string, webhookId: string) {
    const webhook = await this.webhooksRepository.findById(
      accountId,
      webhookId,
    );
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.webhooksRepository.delete(webhookId);
    return { message: 'Webhook deleted successfully' };
  }
}
