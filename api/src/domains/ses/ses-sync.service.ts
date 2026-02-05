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

      // Get existing SES integration record
      let sesIntegration =
        await this.domainsRepository.getSesByDomainId(domainId);

      // If no integration record exists (e.g. created before migration), create one
      if (!sesIntegration) {
        sesIntegration = await this.domainsRepository.createSesIntegration({
          domainId,
          verificationStatus: 'unverified',
        });
      }

      let verificationStatus: 'verified' | 'unverified' | 'pending' =
        sesIntegration?.verificationStatus || 'unverified';

      if (status === 'Success') {
        verificationStatus = 'verified';
      } else if (status === 'Pending') {
        verificationStatus = 'pending';
      } else if (status === 'Failed' || status === 'TemporaryFailure') {
        verificationStatus = 'unverified';
      } else if (status === 'NotStarted') {
        verificationStatus = 'unverified';
      }

      // Update SES integration status if changed or just to refresh checkedAt
      if (verificationStatus !== sesIntegration?.verificationStatus) {
        await this.domainsRepository.updateSesStatus(domainId, {
          verificationStatus,
          lastCheckedAt: new Date(),
        });

        // If SES is verified, we can mark the domain as active overall
        if (verificationStatus === 'verified' && domain.status !== 'active') {
          await this.domainsRepository.update(domainId, {
            status: 'active',
          });
        }

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
