import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DomainsRepository } from './domains.repository.js';
import { DomainVerificationService } from './domain-verification.service.js';
import { SesVerificationService } from './ses/ses-verification.service.js';
import { SesSyncService } from './ses/ses-sync.service.js';
import {
  CreateDomainDto,
  CreateAddressDto,
  DomainQueryDto,
} from './dto/index.js';

import { CloudflareService } from '../cloudflare/cloudflare.service.js';

@Injectable()
export class DomainsService {
  constructor(
    private domainsRepository: DomainsRepository,
    private domainVerificationService: DomainVerificationService,
    private sesVerificationService: SesVerificationService,
    private sesSyncService: SesSyncService,
    private cloudflareService: CloudflareService,
  ) {}

  async getDomains(accountId: string, query: DomainQueryDto) {
    console.log(`[DomainsService] Fetching domains for account: ${accountId}`);
    return this.domainsRepository.findAll(accountId, query);
  }

  async getDomain(accountId: string, idOrName: string) {
    // Check if it's a UUID format (8-4-4-4-12 hex pattern)
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrName,
      );

    const domain = isUuid
      ? await this.domainsRepository.findById(accountId, idOrName)
      : await this.domainsRepository.findByName(accountId, idOrName);

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }
    return domain;
  }

  async createDomain(accountId: string, dto: CreateDomainDto) {
    const domainName = dto.name.toLowerCase().trim();

    if (!this.isValidDomainName(domainName)) {
      throw new BadRequestException('Invalid domain name format');
    }

    try {
      const domain = await this.domainsRepository.create({
        accountId,
        name: domainName,
      });

      // Handle Cloudflare-managed mode: Create zone and return nameservers
      // This is for DNS control via Cloudflare - email provider (Brevo) integration comes later
      if (
        dto.dnsMode === 'cloudflare-managed' &&
        this.cloudflareService.isAvailable()
      ) {
        console.log(
          `[DomainsService] Creating Cloudflare zone for ${domainName}`,
        );

        try {
          // Create or find existing Cloudflare zone
          let zone;
          try {
            zone = await this.cloudflareService.createZone(domainName);
          } catch (error: any) {
            if (error.message?.includes('already exists')) {
              zone = await this.cloudflareService.getZoneByName(domainName);
            } else {
              throw error;
            }
          }

          if (zone) {
            console.log(
              `[DomainsService] Cloudflare zone created for ${domainName}, nameservers: ${zone.name_servers?.join(', ')}`,
            );

            // Persist Cloudflare integration details so later verification can check delegation
            try {
              await this.domainsRepository.createCloudflareIntegration({
                domainId: domain.id,
                zoneId: zone.id,
                nameservers: zone.name_servers || [],
                mode: 'managed',
                status: zone.status,
                lastSyncedAt: new Date(),
              });
            } catch (err) {
              this.domainsRepository.delete(domain.id).catch(() => {});
              console.error(
                '[DomainsService] Failed to persist Cloudflare integration:',
                err,
              );
              throw new BadRequestException(
                `Failed to save Cloudflare integration: ${err?.message || err}`,
              );
            }

            return {
              id: domain.id,
              name: domain.name,
              status: 'pending',
              dnsMode: 'cloudflare-managed',
              cloudflare: {
                zoneId: zone.id,
                zoneStatus: zone.status,
                nameservers: zone.name_servers || [],
              },
              message:
                'Please update your domain nameservers at your registrar to the Cloudflare nameservers provided.',
              createdAt: domain.createdAt,
            };
          }
        } catch (error: any) {
          console.error(
            `[DomainsService] Cloudflare zone creation failed: ${error.message}`,
          );

          // Cleanup: Delete the domain from DB so the user can try again
          await this.domainsRepository.delete(domain.id);

          throw new BadRequestException(
            `Failed to create Cloudflare zone: ${error.message}`,
          );
        }
      }

      // Manual mode: Use SES for email domain verification
      // This is the legacy flow for users not using Cloudflare DNS management
      const verificationToken =
        await this.sesVerificationService.verifyDomainIdentity(domainName);

      const dkimTokens =
        await this.sesVerificationService.getDkimTokens(domainName);

      const dnsRecords: any = {
        spf: {
          type: 'TXT',
          name: domainName,
          value: 'v=spf1 include:amazonses.com ~all',
        },
        dkim: dkimTokens.map((token) => ({
          type: 'CNAME',
          name: `${token}._domainkey.${domainName}`,
          value: `${token}.dkim.amazonses.com`,
        })),
        verification: {
          type: 'TXT',
          name: `_amazonses.${domainName}`,
          value: verificationToken,
        },
        mx: {
          type: 'MX',
          name: domainName,
          value: `inbound-smtp.${process.env.AWS_SES_REGION || 'us-east-1'}.amazonaws.com`,
          priority: 10,
        },
      };

      await this.saveSesDnsRecords(domain.id, domainName, dnsRecords);

      return {
        id: domain.id,
        name: domain.name,
        status: 'pending',
        dnsMode: 'manual',
        dnsRecords,
        createdAt: domain.createdAt,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Domain already exists for this account');
      }
      throw error;
    }
  }

  async deleteDomain(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    await this.domainsRepository.delete(domain.id);
    return { message: 'Domain deleted successfully' };
  }

  async verifyDomain(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);

    console.log(
      `[verifyDomain] Verifying domain: ${domain.name} (ID: ${domain.id})`,
    );

    // 1. Check Cloudflare status if managed
    let cloudflareStatus = 'pending';
    const cfIntegration = await this.domainsRepository.getCloudflareByDomainId(
      domain.id,
    );

    console.log(
      `[verifyDomain] Cloudflare integration found: ${!!cfIntegration}`,
    );

    if (
      cfIntegration &&
      cfIntegration.mode === 'managed' &&
      this.cloudflareService.isAvailable()
    ) {
      try {
        const zone = await this.cloudflareService.getZone(cfIntegration.zoneId);
        cloudflareStatus = zone.status;

        console.log(`[verifyDomain] Cloudflare zone status: ${zone.status}`);

        // Update Cloudflare integration status
        if (zone.status !== cfIntegration.status) {
          await this.domainsRepository.updateCloudflareStatus(domain.id, {
            status: zone.status,
            lastSyncedAt: new Date(),
          });
        }

        // If active in Cloudflare, ensure domain is active in our DB
        if (zone.status === 'active' && domain.status !== 'active') {
          await this.domainsRepository.update(domain.id, {
            status: 'active',
          });
        }

        // Perform delegation check: compare Cloudflare's expected nameservers with current authoritative NS
        try {
          const currentNs = await this.domainVerificationService.getNameservers(
            domain.name,
          );
          const expectedNs = (zone.name_servers || []).map((n) =>
            n.replace(/\.$/, '').toLowerCase(),
          );
          const actualNs = (currentNs || []).map((n) =>
            n.replace(/\.$/, '').toLowerCase(),
          );

          const delegationMatch =
            expectedNs.length > 0 &&
            expectedNs.every((e) => actualNs.includes(e));

          // Delegation Check
          // TRUST CLOUDFLARE: If Cloudflare says 'active', then the nameservers are correct.
          // The local `getNameservers` check is essentially a second opinion but can be flaky due to propagation/caching.
          // So if Cloudflare is active, we consider the domain delegated.
          if (zone.status === 'active') {
            // Ensure our DB matches Cloudflare's reality
            if (cfIntegration.status !== 'active') {
              await this.domainsRepository.updateCloudflareStatus(domain.id, {
                status: 'active',
                lastSyncedAt: new Date(),
              });
            }

            // Mark delegation as successful because Cloudflare is the authority here
            (domain as any)._delegation = {
              expected: expectedNs,
              current: actualNs.length > 0 ? actualNs : expectedNs, // Fallback to expected if local lookup is empty/cached
              delegated: true,
            };
          } else {
            // Only if Cloudflare is NOT active do we rely on the manual check to hint why
            if (!delegationMatch) {
              // Update Cloudflare integration status to 'moved' to indicate not yet delegated
              await this.domainsRepository.updateCloudflareStatus(domain.id, {
                status: 'moved',
                lastSyncedAt: new Date(),
              });
            }

            (domain as any)._delegation = {
              expected: expectedNs,
              current: actualNs,
              delegated: delegationMatch,
            };
          }

          // Attach delegation info to domain object for downstream responses
          (domain as any)._delegation = {
            expected: expectedNs,
            current: actualNs,
            delegated: delegationMatch,
          };
        } catch (err) {
          // swallow delegation errors but log
          console.error('[verifyDomain] Delegation check failed:', err);
        }
      } catch (error) {
        console.error(
          '[verifyDomain] Failed to check Cloudflare status:',
          error,
        );
      }
    }

    // 2. Sync with SES (verification for sending)
    const syncResult = await this.sesSyncService.syncDomainStatus(domain.id);

    console.log(
      `[verifyDomain] SES sync result - verified: ${syncResult?.verified}, status: ${syncResult?.status}`,
    );

    // 3. Get Nameservers for display
    const nameservers = await this.domainVerificationService.getNameservers(
      domain.name,
    );
    const isCloudflare = nameservers.some((ns) =>
      ns.toLowerCase().includes('cloudflare.com'),
    );

    // Get current records to display status
    const response = {
      domainId: domain.id,
      domain: domain.name,
      verified: syncResult?.verified || false,
      status: syncResult?.status, // SES verification status
      cloudflareStatus, // Return Cloudflare status
      nameservers,
      delegation: (domain as any)._delegation || null,
      isCloudflare,
      message: syncResult?.verified
        ? 'Domain verified successfully! You can now create email addresses.'
        : cloudflareStatus === 'active'
          ? 'Cloudflare DNS is active. Finalizing email verification with AWS...'
          : 'Domain verification pending. Please check your DNS records.',
    };

    console.log(`[verifyDomain] Response: ${JSON.stringify(response)}`);

    return response;
  }

  async getDnsRecords(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    const storedRecords = await this.domainsRepository.findDnsRecords(
      domain.id,
    );
    return {
      domain: domain.name,
      storedRecords,
    };
  }

  async checkDns(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);

    // Get stored records to find DKIM selectors
    const storedRecords = await this.domainsRepository.findDnsRecords(
      domain.id,
    );

    // Extract DKIM selectors from stored CNAME records
    // Format: selector._domainkey.domain
    const dkimSelectors = storedRecords
      .filter((r) => r.type === 'CNAME' && r.name.includes('_domainkey'))
      .map((r) => {
        const parts = r.name.split('._domainkey');
        return parts[0];
      });

    // 1. Check real DNS records
    const dnsStatus = await this.domainVerificationService.verifyDomain(
      domain.name,
      dkimSelectors.length > 0 ? dkimSelectors : undefined,
    );

    // 2. Sync with AWS SES
    const syncResult = await this.sesSyncService.syncDomainStatus(domain.id);

    // 3. Update local DB if verification passed
    if (dnsStatus.overallValid) {
      // DNS is valid - mark integration as verified
      await this.domainsRepository.updateSesStatus(domain.id, {
        spfVerified: dnsStatus.spf.valid,
        dkimVerified: dnsStatus.dkim.valid,
        dmarcVerified: dnsStatus.dmarc.valid,
        verificationStatus: 'verified',
        lastCheckedAt: new Date(),
      });

      // And mark domain as active
      await this.domainsRepository.update(domain.id, {
        status: 'active',
      });

      // Also update all DNS records to active
      await this.domainsRepository.updateDnsRecordsStatus(domain.id, 'active');
    }

    const nameservers = await this.domainVerificationService.getNameservers(
      domain.name,
    );
    const isCloudflare = nameservers.some((ns) =>
      ns.toLowerCase().includes('cloudflare.com'),
    );

    // Log for debugging
    console.log(
      `[DNS Check] ${domain.name}: SPF=${dnsStatus.spf.valid}, DKIM=${dnsStatus.dkim.valid}, Overall=${dnsStatus.overallValid}`,
    );

    if (!dnsStatus.overallValid) {
      console.log(
        `[DNS Check] Failed reasons: SPF=${dnsStatus.spf.reason}, DKIM=${dnsStatus.dkim.reason}`,
      );
    }

    return {
      domainId: domain.id,
      domain: domain.name,
      verified: syncResult?.verified || false,
      status: syncResult?.status,
      identifiers: {
        // Detailed verification results
        spf: dnsStatus.spf,
        dkim: dnsStatus.dkim,
        dmarc: dnsStatus.dmarc,
      },
      nameservers,
      isCloudflare,
      message: dnsStatus.overallValid
        ? syncResult?.verified
          ? 'Domain verified successfully!'
          : 'DNS records found! Waiting for AWS to confirm verification.'
        : 'Some DNS records are missing or incorrect.',
    };
  }

  /**
   * Get live DNS records from Cloudflare for a managed domain
   */
  async getCloudflareDnsRecords(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    const cfIntegration = await this.domainsRepository.getCloudflareByDomainId(
      domain.id,
    );

    if (!cfIntegration) {
      throw new NotFoundException(
        'Domain is not Cloudflare-managed. Use standard DNS records endpoint.',
      );
    }

    if (!this.cloudflareService.isAvailable()) {
      throw new BadRequestException('Cloudflare integration is not configured');
    }

    // Fetch live DNS records from Cloudflare
    const records = await this.cloudflareService.listDnsRecords(
      cfIntegration.zoneId,
    );

    return {
      domain: domain.name,
      zoneId: cfIntegration.zoneId,
      mode: cfIntegration.mode,
      lastSyncedAt: cfIntegration.lastSyncedAt,
      records,
    };
  }

  async getAddresses(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    return this.domainsRepository.findAddresses(domain.id);
  }

  async getAllAddresses(accountId: string) {
    return this.domainsRepository.findAllAddressesByAccount(accountId);
  }

  async createAddress(
    accountId: string,
    idOrName: string,
    dto: CreateAddressDto,
  ) {
    const domain = await this.getDomain(accountId, idOrName);

    if (domain.ses?.verificationStatus !== 'verified') {
      throw new BadRequestException(
        'Domain is not verified. Please verify your domain before creating email addresses.',
      );
    }

    try {
      return await this.domainsRepository.createAddress({
        domainId: domain.id,
        localPart: dto.localPart.toLowerCase(),
        email: `${dto.localPart.toLowerCase()}@${domain.name}`,
        displayName: dto.displayName,
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Address already exists for this domain');
      }
      throw error;
    }
  }

  async deleteAddress(accountId: string, idOrName: string, addressId: string) {
    const domain = await this.getDomain(accountId, idOrName);
    await this.domainsRepository.deleteAddress(addressId);
    return { message: 'Address deleted successfully' };
  }

  private async saveSesDnsRecords(
    domainId: string,
    domainName: string,
    records: any,
  ) {
    const promises: Promise<any>[] = [];

    // SPF
    promises.push(
      this.domainsRepository.createDnsRecord({
        domainId,
        type: records.spf.type,
        name: records.spf.name,
        value: records.spf.value,
      }),
    );

    // Verification TXT
    promises.push(
      this.domainsRepository.createDnsRecord({
        domainId,
        type: records.verification.type,
        name: records.verification.name,
        value: records.verification.value,
      }),
    );

    // DKIM CNAMEs
    for (const dkim of records.dkim) {
      promises.push(
        this.domainsRepository.createDnsRecord({
          domainId,
          type: dkim.type,
          name: dkim.name,
          value: dkim.value,
        }),
      );
    }

    // MX
    if (records.mx) {
      promises.push(
        this.domainsRepository.createDnsRecord({
          domainId,
          type: records.mx.type,
          name: records.mx.name,
          value: records.mx.value,
          priority: records.mx.priority,
        }),
      );
    }

    await Promise.all(promises);
  }

  private isValidDomainName(domain: string): boolean {
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }
}
