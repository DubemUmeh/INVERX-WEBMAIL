import { Module } from '@nestjs/common';
import { DomainsController } from './domains.controller.js';
import { DomainsService } from './domains.service.js';
import { DomainsRepository } from './domains.repository.js';
import { DomainVerificationService } from './domain-verification.service.js';

@Module({
  controllers: [DomainsController],
  providers: [DomainsService, DomainsRepository, DomainVerificationService],
  exports: [DomainsService, DomainVerificationService],
})
export class DomainsModule {}
