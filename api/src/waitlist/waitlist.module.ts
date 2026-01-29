import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller.js';
import { WaitlistService } from './waitlist.service.js';
import { WaitlistRepository } from './waitlist.repository.js';
import { DatabaseModule } from '../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistRepository],
  exports: [WaitlistService],
})
export class WaitlistModule {}
