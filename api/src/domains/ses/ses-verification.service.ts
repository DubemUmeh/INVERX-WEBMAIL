import { Injectable, Logger } from '@nestjs/common';
import {
  VerifyDomainIdentityCommand,
  VerifyDomainDkimCommand,
  GetIdentityVerificationAttributesCommand,
  DeleteIdentityCommand,
} from '@aws-sdk/client-ses';
import { SesClientService } from './ses.client.js';

@Injectable()
export class SesVerificationService {
  private readonly logger = new Logger(SesVerificationService.name);

  constructor(private readonly sesClientService: SesClientService) {}

  async verifyDomainIdentity(domain: string): Promise<string> {
    try {
      this.logger.log(`Initiating SES verification for domain: ${domain}`);
      const command = new VerifyDomainIdentityCommand({ Domain: domain });
      const response = await this.sesClientService.client.send(command);
      return response.VerificationToken || '';
    } catch (error) {
      this.logger.error(`Failed to verify domain ${domain}`, error);
      throw error;
    }
  }

  async getDkimTokens(domain: string): Promise<string[]> {
    try {
      this.logger.log(`Requesting DKIM tokens for domain: ${domain}`);
      const command = new VerifyDomainDkimCommand({ Domain: domain });
      const response = await this.sesClientService.client.send(command);
      return response.DkimTokens || [];
    } catch (error) {
      this.logger.error(`Failed to get DKIM tokens for ${domain}`, error);
      throw error;
    }
  }

  async getVerificationStatus(domain: string) {
    try {
      const command = new GetIdentityVerificationAttributesCommand({
        Identities: [domain],
      });
      const response = await this.sesClientService.client.send(command);
      const attributes = response.VerificationAttributes?.[domain];
      return attributes?.VerificationStatus;
    } catch (error) {
      this.logger.error(
        `Failed to check verification status for ${domain}`,
        error,
      );
      throw error;
    }
  }

  async deleteIdentity(domain: string): Promise<void> {
    try {
      const command = new DeleteIdentityCommand({ Identity: domain });
      await this.sesClientService.client.send(command);
      this.logger.log(`Deleted SES identity for domain: ${domain}`);
    } catch (error) {
      this.logger.error(`Failed to delete identity ${domain}`, error);
      // Don't throw if it's already gone
    }
  }
}
