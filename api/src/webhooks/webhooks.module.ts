import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller.js';
import { WebhooksService } from './webhooks.service.js';
import { WebhooksRepository } from './webhooks.repository.js';
import { BrevoWebhooksController } from './brevo-webhooks.controller.js';
import { BrevoModule } from '../brevo/brevo.module.js';

@Module({
  imports: [BrevoModule],
  controllers: [WebhooksController, BrevoWebhooksController],
  providers: [WebhooksService, WebhooksRepository],
  exports: [WebhooksService],
})
export class WebhooksModule {}
