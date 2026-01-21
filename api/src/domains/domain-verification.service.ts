/**
 * Domain Verification Service
 *
 * Handles the verification lifecycle for domains:
 * - SPF verification
 * - DKIM verification
 * - DMARC verification
 * - Aggregate verification status
 */

import { Injectable } from '@nestjs/common';
import { DomainsRepository } from './domains.repository.js';
import {
  verifySpf,
  generateSpfRecord,
  SpfVerificationResult,
} from './dns/spf.js';
import {
  verifyDkim,
  generateDkimKeyPair,
  getDkimSetupInstructions,
  DkimVerificationResult,
  DkimKeyPair,
} from './dns/dkim.js';
import {
  verifyDmarc,
  generateDmarcRecord,
  getDmarcSetupInstructions,
  DmarcVerificationResult,
} from './dns/dmarc.js';

export interface VerificationStatus {
  spf: SpfVerificationResult;
  dkim: DkimVerificationResult;
  dmarc: DmarcVerificationResult;
  overallValid: boolean;
  checkedAt: Date;
}

export interface DnsSetupInstructions {
  spf: {
    type: 'TXT';
    name: string;
    value: string;
    required: boolean;
  };
  dkim: {
    type: 'CNAME';
    name: string;
    value: string;
    required: boolean;
    alternativeTxt?: {
      type: 'TXT';
      name: string;
      value: string;
    };
  };
  dmarc: {
    type: 'TXT';
    name: string;
    value: string;
    required: boolean;
    explanation: string;
  };
  mx?: {
    type: 'MX';
    name: string;
    value: string;
    priority: number;
    required: boolean;
  };
}

@Injectable()
export class DomainVerificationService {
  constructor(private domainsRepository: DomainsRepository) {}

  /**
   * Perform full DNS verification for a domain
   */
  async verifyDomain(
    domain: string,
    dkimSelector?: string,
  ): Promise<VerificationStatus> {
    // Perform all DNS checks in parallel
    const [spfResult, dkimResult, dmarcResult] = await Promise.all([
      verifySpf(domain),
      verifyDkim(domain, dkimSelector),
      verifyDmarc(domain),
    ]);

    // Domain is verified if SPF and DKIM pass (DMARC is recommended but not required)
    const overallValid = spfResult.valid && dkimResult.valid;

    return {
      spf: spfResult,
      dkim: dkimResult,
      dmarc: dmarcResult,
      overallValid,
      checkedAt: new Date(),
    };
  }

  /**
   * Verify and update domain status in database
   */
  async verifyAndUpdateDomain(
    domainId: string,
    domainName: string,
    dkimSelector?: string,
  ): Promise<VerificationStatus> {
    const status = await this.verifyDomain(domainName, dkimSelector);

    // Update domain verification status in database
    await this.domainsRepository.update(domainId, {
      spfVerified: status.spf.valid,
      dkimVerified: status.dkim.valid,
      dmarcVerified: status.dmarc.valid,
      verificationStatus: status.overallValid ? 'verified' : 'unverified',
      status: status.overallValid ? 'active' : 'pending',
      lastCheckedAt: status.checkedAt,
    });

    return status;
  }

  /**
   * Generate DNS setup instructions for a new domain
   */
  generateDnsSetupInstructions(
    domain: string,
    dkimSelector: string = 'inverx',
    reportEmail?: string,
  ): DnsSetupInstructions {
    const dmarcInstructions = getDmarcSetupInstructions(
      domain,
      reportEmail || `dmarc@${domain}`,
    );
    const dkimInstructions = getDkimSetupInstructions(domain, dkimSelector);

    return {
      spf: {
        type: 'TXT',
        name: domain,
        value: generateSpfRecord(),
        required: true,
      },
      dkim: {
        type: 'CNAME',
        name: dkimInstructions.cname.name,
        value: dkimInstructions.cname.value,
        required: true,
        alternativeTxt: {
          type: 'TXT',
          name: dkimInstructions.txt.name,
          value: dkimInstructions.txt.value,
        },
      },
      dmarc: {
        type: 'TXT',
        name: dmarcInstructions.name,
        value: dmarcInstructions.value,
        required: false, // Recommended but not blocking
        explanation: dmarcInstructions.explanation,
      },
      mx: {
        type: 'MX',
        name: domain,
        value: 'mx.inverx.com',
        priority: 10,
        required: false, // Only needed for receiving mail
      },
    };
  }

  /**
   * Generate DKIM key pair for a domain
   * This should be called once per domain and stored securely
   */
  generateDkimKeys(domain: string): DkimKeyPair {
    return generateDkimKeyPair(domain);
  }

  /**
   * Check if domain verification is still valid (re-verification)
   * This should be called periodically via cron job
   */
  async reVerifyDomain(
    domainId: string,
    domainName: string,
    dkimSelector?: string,
  ): Promise<{
    wasVerified: boolean;
    isVerified: boolean;
    changed: boolean;
    status: VerificationStatus;
  }> {
    // Get current domain state
    const domain =
      await this.domainsRepository.findByIdWithoutAccount(domainId);
    const wasVerified = domain?.verificationStatus === 'verified';

    // Perform verification
    const status = await this.verifyAndUpdateDomain(
      domainId,
      domainName,
      dkimSelector,
    );

    return {
      wasVerified,
      isVerified: status.overallValid,
      changed: wasVerified !== status.overallValid,
      status,
    };
  }
}
