/**
 * SMTP Module
 *
 * NestJS module for SMTP configuration and email sending.
 */

import { Module } from '@nestjs/common';
import { SmtpController } from './smtp.controller.js';
import { SmtpService } from './smtp.service.js';
import { SmtpRepository } from './smtp.repository.js';
import { SmtpCryptoService } from './smtp-crypto.service.js';
import { SmtpEmailService } from './smtp-email.service.js';

import { DomainsModule } from '../domains/domains.module.js';

@Module({
  imports: [DomainsModule],
  controllers: [SmtpController],
  providers: [SmtpService, SmtpRepository, SmtpCryptoService, SmtpEmailService],
  exports: [SmtpService, SmtpEmailService, SmtpCryptoService],
})
export class SmtpModule {}
