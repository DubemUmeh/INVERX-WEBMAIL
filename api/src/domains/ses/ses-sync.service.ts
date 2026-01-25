import { Injectable, Logger } from '@nestjs/common';
import { SesVerificationService } from './ses-verification.service.js';
import { DomainsRepository } from '../domains.repository.js';

@Injectable()
export class SesSyncService {
  private readonly logger = new Logger(SesSyncService.name);

  constructor(
    private readonly sesVerificationService: SesVerificationService,
    private readonly domainsRepository: DomainsRepository,
  ) {}

  async syncDomainStatus(domainId: string) {
    const domain =
      await this.domainsRepository.findByIdWithoutAccount(domainId);
    if (!domain) return;

    try {
      const status = await this.sesVerificationService.getVerificationStatus(
        domain.name,
      );

      let verificationStatus: 'verified' | 'unverified' | 'pending' =
        (domain.verificationStatus as 'verified' | 'unverified' | 'pending') ||
        'unverified';

      if (status === 'Success') {
        verificationStatus = 'verified';
      } else if (status === 'Pending') {
        verificationStatus = 'pending';
      } else if (status === 'Failed' || status === 'TemporaryFailure') {
        verificationStatus = 'unverified';
      } else if (status === 'NotStarted') {
        verificationStatus = 'unverified';
      }

      // Update if changed
      if (verificationStatus !== domain.verificationStatus) {
        await this.domainsRepository.update(domainId, {
          verificationStatus,
          lastCheckedAt: new Date(),
        });
        this.logger.log(
          `Synced domain ${domain.name} status to ${verificationStatus}`,
        );
      }

      return { verified: verificationStatus === 'verified', status };
    } catch (error) {
      this.logger.error(`Failed to sync domain ${domain.name}`, error);
      throw error;
    }
  }
}
