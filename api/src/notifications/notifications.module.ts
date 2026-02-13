import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { BrevoModule } from '../brevo/brevo.module.js';

@Module({
  imports: [BrevoModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
