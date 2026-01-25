import { Module } from '@nestjs/common';
import { MailController } from './mail.controller.js';
import { MailService } from './mail.service.js';
import { MailRepository } from './mail.repository.js';
import { SesEmailService } from './ses-email.service.js';
import { DomainsModule } from '../domains/domains.module.js';

@Module({
  imports: [DomainsModule],
  controllers: [MailController],
  providers: [MailService, MailRepository, SesEmailService],
  exports: [MailService],
})
export class MailModule {}
