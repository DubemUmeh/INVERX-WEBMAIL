import { Module } from '@nestjs/common';
import { MailController } from './mail.controller.js';
import { MailService } from './mail.service.js';
import { MailRepository } from './mail.repository.js';

@Module({
  controllers: [MailController],
  providers: [MailService, MailRepository],
  exports: [MailService],
})
export class MailModule {}
