import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service.js';
import { CreateWebhookDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AccountGuard, RoleGuard } from '../common/guards/index.js';

@Controller('webhooks')
@UseGuards(AccountGuard, RoleGuard)
@Roles('owner', 'admin')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get()
  getWebhooks(@CurrentUser('accountId') accountId: string) {
    return this.webhooksService.getWebhooks(accountId);
  }

  @Post()
  createWebhook(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateWebhookDto,
  ) {
    return this.webhooksService.createWebhook(accountId, dto);
  }

  @Delete(':id')
  deleteWebhook(
    @CurrentUser('accountId') accountId: string,
    @Param('id') webhookId: string,
  ) {
    return this.webhooksService.deleteWebhook(accountId, webhookId);
  }
}
