import { Module } from '@nestjs/common';
import { DomainsController } from './domains.controller.js';
import { DomainsService } from './domains.service.js';
import { DomainsRepository } from './domains.repository.js';
import { DomainVerificationService } from './domain-verification.service.js';

import { SesClientService } from './ses/ses.client.js';
import { SesVerificationService } from './ses/ses-verification.service.js';
import { SesSyncService } from './ses/ses-sync.service.js';
import { CloudflareModule } from '../cloudflare/cloudflare.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [CloudflareModule, UsersModule],
  controllers: [DomainsController],
  providers: [
    DomainsService,
    DomainsRepository,
    DomainVerificationService,
    SesClientService,
    SesVerificationService,
    SesSyncService,
  ],
  exports: [
    DomainsService,
    DomainsRepository,
    DomainVerificationService,
    SesVerificationService,
    SesSyncService,
    SesClientService,
  ],
})
export class DomainsModule {}
