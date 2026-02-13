import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WaitlistService } from './waitlist.service.js';
import { WaitlistController } from './waitlist.controller.js';
import { WaitlistRepository } from './waitlist.repository.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [NotificationsModule, JwtModule.register({})],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistRepository],
  exports: [WaitlistService],
})
export class WaitlistModule {}
