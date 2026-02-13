/**
 * Brevo Module
 *
 * NestJS module for Brevo email infrastructure integration.
 */

import { Module } from '@nestjs/common';
import { BrevoController } from './brevo.controller.js';
import { BrevoService } from './brevo.service.js';
import { BrevoRepository } from './brevo.repository.js';
import { BrevoApiService } from './brevo-api.service.js';
import { DomainVerificationJob } from './jobs/domain-verification.job.js';
import { SmtpModule } from '../smtp/smtp.module.js';
import { CloudflareModule } from '../cloudflare/cloudflare.module.js';
import { DomainsModule } from '../domains/domains.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [SmtpModule, CloudflareModule, DomainsModule, UsersModule], // For SmtpCryptoService, CloudflareService, DomainsRepository, UsersRepository
  controllers: [BrevoController],
  providers: [
    BrevoService,
    BrevoRepository,
    BrevoApiService,
    DomainVerificationJob,
  ],
  exports: [BrevoService, BrevoRepository, BrevoApiService],
})
export class BrevoModule {}
