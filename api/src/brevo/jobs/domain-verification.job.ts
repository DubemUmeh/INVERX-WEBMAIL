/**
 * Domain Verification Job
 *
 * Background job that polls Brevo for domain verification status.
 * Runs every 5 minutes to update pending domains.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BrevoRepository } from '../brevo.repository.js';
import { BrevoApiService } from '../brevo-api.service.js';
import {
  SmtpCryptoService,
  EncryptedData,
} from '../../smtp/smtp-crypto.service.js';
import { db } from '../../database/drizzle.js';
import { brevoConnections, brevoDomains } from '../../database/schema/index.js';
import { eq, and, or } from 'drizzle-orm';

@Injectable()
export class DomainVerificationJob {
  private readonly logger = new Logger(DomainVerificationJob.name);
  private isRunning = false;

  constructor(
    private repository: BrevoRepository,
    private brevoApi: BrevoApiService,
    private cryptoService: SmtpCryptoService,
  ) {}

  /**
   * Run every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    if (this.isRunning) {
      this.logger.debug('Skipping - previous run still in progress');
      return;
    }

    this.isRunning = true;
    try {
      await this.checkPendingDomains();
    } catch (error: any) {
      this.logger.error(`Domain verification job failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Check all pending domains for verification status
   */
  private async checkPendingDomains() {
    // Find all domains that are pending_dns or verifying
    const pendingDomains = await db
      .select({
        domain: brevoDomains,
        connection: brevoConnections,
      })
      .from(brevoDomains)
      .innerJoin(
        brevoConnections,
        eq(brevoDomains.connectionId, brevoConnections.id),
      )
      .where(
        and(
          eq(brevoDomains.isArchived, false),
          eq(brevoConnections.isArchived, false),
          or(
            eq(brevoDomains.status, 'pending_dns'),
            eq(brevoDomains.status, 'verifying'),
          ),
        ),
      );

    if (pendingDomains.length === 0) {
      return;
    }

    this.logger.log(`Checking ${pendingDomains.length} pending domains`);

    for (const { domain, connection } of pendingDomains) {
      try {
        await this.checkDomain(domain, connection);
      } catch (error: any) {
        this.logger.error(
          `Failed to check domain ${domain.domainName}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Check a single domain's verification status
   */
  private async checkDomain(domain: any, connection: any) {
    // Decrypt API key
    const encryptedData: EncryptedData = {
      encrypted: connection.apiKeyEncrypted,
      iv: connection.apiKeyIv,
      tag: connection.apiKeyTag,
    };
    const apiKey = this.cryptoService.decrypt(encryptedData);

    // Trigger Brevo to actively re-check DNS records (forces immediate verification attempt)
    try {
      await this.brevoApi.authenticateDomain(apiKey, domain.domainName);
      this.logger.debug(
        `Triggered authentication check for ${domain.domainName}`,
      );
    } catch (error: any) {
      // Don't fail the whole check if authenticate fails - continue to get current status
      this.logger.warn(
        `Authentication trigger failed for ${domain.domainName}: ${error.message}`,
      );
    }

    // Get current domain status from Brevo
    const brevoResult = await this.brevoApi.getDomain(
      apiKey,
      domain.domainName,
    );

    // Extract verification status
    const dkimVerified = brevoResult.dns_records?.dkim_record?.status || false;
    const authenticated = brevoResult.authenticated;

    // Determine new status
    let newStatus = domain.status;
    if (authenticated && dkimVerified) {
      newStatus = 'verified';
    } else if (dkimVerified && !authenticated) {
      newStatus = 'verifying';
    }

    // Update if changed
    if (newStatus !== domain.status || dkimVerified !== domain.dkimVerified) {
      await this.repository.updateDomain(domain.id, {
        status: newStatus,
        dkimVerified,
        lastCheckedAt: new Date(),
      });

      this.logger.log(
        `Domain ${domain.domainName} updated: ${domain.status} → ${newStatus}`,
      );
    }
  }
}
