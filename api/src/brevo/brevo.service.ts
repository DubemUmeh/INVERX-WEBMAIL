/**
 * Brevo Service
 *
 * Business logic for Brevo operations including connection management,
 * domain/sender creation with idempotency, and guarded email sending.
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { BrevoRepository } from './brevo.repository.js';
import { BrevoApiService } from './brevo-api.service.js';
import {
  SmtpCryptoService,
  EncryptedData,
} from '../smtp/smtp-crypto.service.js';
import {
  ConnectBrevoDto,
  CreateBrevoDomainDto,
  CreateBrevoSenderDto,
  SendBrevoEmailDto,
} from './dto/index.js';
import { BrevoDnsRecord } from '../database/schema/index.js';

import { CloudflareService } from '../cloudflare/cloudflare.service.js';
import { DomainsRepository } from '../domains/domains.repository.js';
import { UsersRepository } from '../users/users.repository.js';

// Rate limits by tier
const RATE_LIMITS = {
  restricted: 100, // 100 emails per day
  standard: 10000, // 10k emails per day
};

@Injectable()
export class BrevoService {
  private readonly logger = new Logger(BrevoService.name);

  constructor(
    private repository: BrevoRepository,
    private brevoApi: BrevoApiService,
    private cryptoService: SmtpCryptoService,
    private cloudflareService: CloudflareService,
    private domainsRepository: DomainsRepository,
    private usersRepository: UsersRepository,
  ) {}

  // =====================
  // CONNECTION OPERATIONS
  // =====================

  /**
   * Get connection status for an account (fetches real stats from Brevo)
   */
  async getConnectionStatus(accountId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);

    if (!connection) {
      return { connected: false };
    }

    // Decrypt API key to fetch real stats from Brevo
    const apiKey = await this.getApiKey(accountId);

    let dailySendCount = 0;
    let planType = 'free';

    try {
      // Fetch today's send statistics from Brevo
      const stats = await this.brevoApi.getSmtpStatistics(apiKey);
      dailySendCount = stats.requests || 0;

      // Fetch account info for plan type
      const accountInfo = await this.brevoApi.getAccount(apiKey);
      if (accountInfo.plan && accountInfo.plan.length > 0) {
        planType = accountInfo.plan[0].type || 'free';
      }
    } catch (error: any) {
      this.logger.warn(`Failed to fetch Brevo stats: ${error.message}`);
      // Continue with defaults
    }

    return {
      connected: true,
      status: connection.status,
      sendingTier: planType,
      email: connection.email,
      dailySendCount: dailySendCount,
      lastValidatedAt: connection.lastValidatedAt,
      createdAt: connection.createdAt,
      isCloudflareAvailable: this.cloudflareService.isAvailable(),
    };
  }

  /**
   * Connect a Brevo account by validating and storing API key
   */
  async connect(accountId: string, userId: string, dto: ConnectBrevoDto) {
    // Check if user is verified
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.isVerified) {
      throw new ForbiddenException(
        'User verification required to connect Brevo accounts.',
      );
    }

    // Check for existing connection
    const existing = await this.repository.findConnectionByAccountId(accountId);
    if (existing) {
      throw new ConflictException(
        'Brevo account already connected. Disconnect first.',
      );
    }

    // Validate API key by fetching account info
    let accountInfo;
    try {
      accountInfo = await this.brevoApi.getAccount(dto.apiKey);
    } catch {
      throw new BadRequestException('Invalid Brevo API key');
    }

    // Encrypt the API key
    const encrypted = this.cryptoService.encrypt(dto.apiKey);

    // Create connection
    const connection = await this.repository.createConnection({
      accountId,
      apiKeyEncrypted: encrypted.encrypted,
      apiKeyIv: encrypted.iv,
      apiKeyTag: encrypted.tag,
      email: accountInfo.email,
    });

    this.logger.log(`Brevo connected for account ${accountId}`);

    return {
      id: connection.id,
      status: connection.status,
      sendingTier: connection.sendingTier,
      email: connection.email,
    };
  }

  /**
   * Disconnect Brevo account (soft delete)
   */
  async disconnect(accountId: string, deleteAll: boolean = false) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    // Archive the connection
    await this.repository.archiveConnection(connection.id);

    this.logger.log(`Brevo disconnected for account ${accountId}`);

    return { message: 'Brevo account disconnected' };
  }

  /**
   * Get decrypted API key for a connection
   */
  private async getApiKey(connectionId: string): Promise<string> {
    const connection =
      await this.repository.findConnectionByAccountId(connectionId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    const encryptedData: EncryptedData = {
      encrypted: connection.apiKeyEncrypted,
      iv: connection.apiKeyIv,
      tag: connection.apiKeyTag,
    };

    return this.cryptoService.decrypt(encryptedData);
  }

  /**
   * Get API key from account ID
   */
  private async getApiKeyFromAccount(
    accountId: string,
  ): Promise<{ apiKey: string; connection: any }> {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    const encryptedData: EncryptedData = {
      encrypted: connection.apiKeyEncrypted,
      iv: connection.apiKeyIv,
      tag: connection.apiKeyTag,
    };

    const apiKey = this.cryptoService.decrypt(encryptedData);
    return { apiKey, connection };
  }

  // ==========================
  // BREVO ACCOUNT DATA FETCH
  // ==========================

  /**
   * Get domains directly from Brevo account
   * These are all domains in the user's Brevo account, not just ones created via INVERX
   */
  async getBrevoAccountDomains(accountId: string) {
    const { apiKey } = await this.getApiKeyFromAccount(accountId);

    try {
      const result = await this.brevoApi.listDomains(apiKey);
      const domains = result.domains || [];

      // Fetch detailed info for each domain to get DNS records
      // The listDomains endpoint doesn't include DNS records
      const detailedDomains = await Promise.all(
        domains.map(async (d) => {
          try {
            // Fetch individual domain details which includes DNS records
            const details = await this.brevoApi.getDomain(
              apiKey,
              d.domain_name,
            );
            this.logger.log(
              `Domain ${d.domain_name} DNS records: ${JSON.stringify(details.dns_records)}`,
            );
            return {
              id: d.id, // Use ID from list to result
              domainName: d.domain_name, // Use domain_name from list result (confirmed by logs)
              authenticated: details.authenticated,
              dnsRecords: (() => {
                const records = details.dns_records;

                // Handle array format (New Brevo API / Stored DB format)
                if (Array.isArray(records)) {
                  const dkim1 = records.find(
                    (r: any) =>
                      r.host?.includes('brevo1') && r.purpose === 'dkim',
                  );
                  const dkim2 = records.find(
                    (r: any) =>
                      r.host?.includes('brevo2') && r.purpose === 'dkim',
                  );
                  const brevoCode = records.find(
                    (r: any) => r.purpose === 'brevo-code',
                  );
                  const dmarc = records.find(
                    (r: any) => r.purpose === 'dmarc' || r.host === '_dmarc',
                  );

                  return {
                    dkim1Record: dkim1
                      ? {
                          type: dkim1.type,
                          host: dkim1.host,
                          value: dkim1.value,
                          verified: dkim1.verified ?? dkim1.status, // Handle both status/verified
                        }
                      : null,
                    dkim2Record: dkim2
                      ? {
                          type: dkim2.type,
                          host: dkim2.host,
                          value: dkim2.value,
                          verified: dkim2.verified ?? dkim2.status,
                        }
                      : null,
                    brevoCode: brevoCode
                      ? {
                          type: brevoCode.type,
                          host: brevoCode.host,
                          value: brevoCode.value,
                          verified: brevoCode.verified ?? brevoCode.status,
                        }
                      : null,
                    dmarc_record: dmarc
                      ? {
                          type: dmarc.type,
                          host: dmarc.host,
                          value: dmarc.value,
                          verified: dmarc.verified ?? dmarc.status,
                        }
                      : null,
                    dkimRecord: null, // Legacy field
                  };
                }

                // Handle legacy object format (fallback)
                if (records && typeof records === 'object') {
                  return {
                    dkimRecord: records.dkim_record
                      ? {
                          type: records.dkim_record.type,
                          host: records.dkim_record.host_name,
                          value: records.dkim_record.value,
                          verified: records.dkim_record.status,
                        }
                      : null,
                    brevoCode: records.brevo_code
                      ? {
                          type: records.brevo_code.type,
                          host: records.brevo_code.host_name,
                          value: records.brevo_code.value,
                          verified: records.brevo_code.status,
                        }
                      : null,
                    dkim1Record: null,
                    dkim2Record: null,
                    dmarc_record: null,
                  };
                }

                return null;
              })(),
            };
          } catch (detailError: any) {
            this.logger.warn(
              `Failed to fetch details for domain ${d.domain_name}: ${detailError.message}`,
            );
            // Return basic info without DNS records if fetch fails
            return {
              id: d.id,
              domainName: d.domain_name,
              authenticated: d.authenticated,
              dnsRecords: null,
            };
          }
        }),
      );

      return detailedDomains;
    } catch (error: any) {
      this.logger.error(`Failed to fetch Brevo domains: ${error.message}`);
      throw new BadRequestException(
        `Failed to fetch domains from Brevo: ${error.message}`,
      );
    }
  }

  /**
   * Get all senders directly from Brevo account
   * These are all senders in the user's Brevo account, not just ones created via INVERX
   */
  async getBrevoAccountSenders(accountId: string) {
    this.logger.log(`Fetching Brevo account senders for account: ${accountId}`);
    const { apiKey } = await this.getApiKeyFromAccount(accountId);
    try {
      const { senders } = await this.brevoApi.listSenders(apiKey);
      this.logger.log(`Fetched ${senders.length} senders from Brevo API`);
      return senders.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        active: s.active,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to fetch Brevo senders: ${error.message}`);
      // Return empty array instead of failing, so UI can still show local domains
      return [];
    }
  }

  // =================
  // DOMAIN OPERATIONS
  // =================

  /**
   * Get available domains for Brevo (existing Cloudflare-managed domains from Domain Management)
   * These are domains that the user already added to their account and can connect to Brevo
   */
  async getAvailableDomainsForBrevo(accountId: string) {
    // Get all domains from the main domains table
    const userDomains =
      await this.domainsRepository.findCloudflareManaged(accountId);

    // Get domains already added to Brevo to filter them out
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    let brevoDomainNames: string[] = [];

    if (connection) {
      const brevoDomains = await this.repository.findDomainsByConnectionId(
        connection.id,
      );
      brevoDomainNames = brevoDomains.map((d) => d.domainName.toLowerCase());
    }

    // Return domains that are NOT already in Brevo
    return userDomains
      .filter((d) => !brevoDomainNames.includes(d.name.toLowerCase()))
      .map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        verificationStatus: d.status,
      }));
  }

  /**
   * List domains for an account (auto-syncs from Brevo first)
   */
  async listDomains(accountId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    // Sync domains from Brevo API to local DB first
    await this.syncDomainsFromBrevo(accountId);

    this.logger.log(`Fetching domains for connection ${connection.id}`);
    const domains = await this.repository.findDomainsByConnectionId(
      connection.id,
    );
    this.logger.log(
      `Found ${domains.length} domains in DB: ${domains.map((d) => `${d.domainName}(${d.status}, archived=${d.isArchived})`).join(', ')}`,
    );

    return domains.map((d) => ({
      id: d.id,
      domainName: d.domainName,
      status: d.status,
      dnsMode: d.dnsMode,
      dkimVerified: d.dkimVerified,
      spfVerified: d.spfVerified,
      dmarcVerified: d.dmarcVerified,
      dnsRecords: d.dnsRecords,
      nameservers: d.nameservers,
      lastCheckedAt: d.lastCheckedAt,
      createdAt: d.createdAt,
    }));
  }

  /**
   * Sync domains from Brevo API to local database
   * Creates missing domains and updates existing ones with current status
   */
  async syncDomainsFromBrevo(accountId: string) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    try {
      // Fetch domains from Brevo API
      const result = await this.brevoApi.listDomains(apiKey);
      const brevoDomains = result.domains || [];

      this.logger.log(`Syncing ${brevoDomains.length} domains from Brevo API`);

      for (const brevoDomain of brevoDomains) {
        // Check if domain exists locally
        const existing = await this.repository.findDomainByName(
          connection.id,
          brevoDomain.domain_name,
        );

        if (existing) {
          // Update existing domain with Brevo status
          const newStatus = brevoDomain.authenticated
            ? 'verified'
            : 'verifying';
          if (existing.status !== newStatus) {
            this.logger.log(
              `Updating domain ${brevoDomain.domain_name} status: ${existing.status} -> ${newStatus}`,
            );
            await this.repository.updateDomain(existing.id, {
              status: newStatus as 'verified' | 'verifying',
              brevoDomainId: String(brevoDomain.id),
              lastCheckedAt: new Date(),
            });
          }
        } else {
          // Create new domain record from Brevo
          this.logger.log(
            `Creating local record for Brevo domain: ${brevoDomain.domain_name} (authenticated=${brevoDomain.authenticated})`,
          );
          await this.repository.createDomain({
            connectionId: connection.id,
            domainName: brevoDomain.domain_name,
            brevoDomainId: String(brevoDomain.id),
            dnsMode: 'manual', // Default to manual since we don't know how it was set up
          });

          // Update status based on Brevo authentication
          const newDomain = await this.repository.findDomainByName(
            connection.id,
            brevoDomain.domain_name,
          );
          if (newDomain && brevoDomain.authenticated) {
            await this.repository.updateDomain(newDomain.id, {
              status: 'verified',
              lastCheckedAt: new Date(),
            });
          }
        }
      }
    } catch (error: any) {
      this.logger.warn(`Failed to sync domains from Brevo: ${error.message}`);
      // Don't fail the list operation, just continue with local data
    }
  }

  /**
   * Add a domain (idempotent - returns existing if duplicate)
   * Supports two modes:
   * 1. existingDomainId provided: Use existing domain from Domain Management, add Brevo DNS to its Cloudflare zone
   * 2. Manual: Create new domain in Brevo with manual DNS setup
   */
  async addDomain(
    accountId: string,
    userId: string,
    dto: CreateBrevoDomainDto,
  ) {
    // Check if user is verified
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.isVerified) {
      throw new ForbiddenException(
        'User verification required to add Brevo domains.',
      );
    }

    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    // Check for existing domain in local database
    const existing = await this.repository.findDomainByName(
      connection.id,
      dto.domainName,
    );

    // If domain exists locally, check if it's properly set up in Brevo and has DNS records
    if (existing) {
      // Verify domain exists in Brevo
      let brevoDomainExists = false;
      let brevoDomain;
      try {
        brevoDomain = await this.brevoApi.getDomain(apiKey, dto.domainName);
        brevoDomainExists = true;
        this.logger.log(`Domain ${dto.domainName} exists in Brevo`);
      } catch {
        this.logger.log(
          `Domain ${dto.domainName} not found in Brevo, will create`,
        );
      }

      // If domain exists in Brevo and is verified, just return existing
      if (brevoDomainExists && existing.status === 'verified') {
        this.logger.log(
          `Domain ${dto.domainName} already verified, returning existing`,
        );
        return existing;
      }

      // If domain doesn't exist in Brevo, create it
      if (!brevoDomainExists) {
        try {
          brevoDomain = await this.brevoApi.createDomain(
            apiKey,
            dto.domainName,
          );
          this.logger.log(`Created domain ${dto.domainName} in Brevo`);
          // Update local record with Brevo ID
          await this.repository.updateDomain(existing.id, {
            brevoDomainId: String(brevoDomain.id),
          });
        } catch (createError: any) {
          throw new BadRequestException(
            `Failed to create domain in Brevo: ${createError.message}`,
          );
        }
      }

      // Add DNS records to Cloudflare if this is a cloudflare-managed domain
      if (
        dto.existingDomainId &&
        this.cloudflareService.isAvailable() &&
        brevoDomain?.dns_records
      ) {
        await this.addBrevoRecordsToCloudflare(
          apiKey,
          dto.domainName,
          brevoDomain,
          existing.id,
        );
      }

      return existing;
    }

    // Check if domain already exists in Brevo first, then create if not
    let brevoDomain;
    try {
      // Try to get existing domain first
      brevoDomain = await this.brevoApi.getDomain(apiKey, dto.domainName);
      this.logger.log(
        `Domain ${dto.domainName} already exists in Brevo, using existing`,
      );
    } catch {
      // Domain doesn't exist in Brevo, create it
      this.logger.log(`Creating new domain ${dto.domainName} in Brevo`);
      try {
        brevoDomain = await this.brevoApi.createDomain(apiKey, dto.domainName);
        this.logger.log(
          `Created domain ${dto.domainName} in Brevo successfully`,
        );
      } catch (createError: any) {
        throw new BadRequestException(
          `Failed to create domain in Brevo: ${createError.message}`,
        );
      }
    }

    // Extract DNS records from Brevo response (handles both new and legacy format)
    const dnsRecords: BrevoDnsRecord[] = [];
    const dns = brevoDomain.dns_records;

    // New format: dkim1Record and dkim2Record
    if (dns?.dkim1Record) {
      dnsRecords.push({
        type: dns.dkim1Record.type,
        host: dns.dkim1Record.host_name,
        value: dns.dkim1Record.value,
        purpose: 'dkim',
      });
    }
    if (dns?.dkim2Record) {
      dnsRecords.push({
        type: dns.dkim2Record.type,
        host: dns.dkim2Record.host_name,
        value: dns.dkim2Record.value,
        purpose: 'dkim',
      });
    }
    // Legacy format: dkim_record
    if (dns?.dkim_record) {
      dnsRecords.push({
        type: dns.dkim_record.type,
        host: dns.dkim_record.host_name,
        value: dns.dkim_record.value,
        purpose: 'dkim',
      });
    }
    // brevo_code
    if (dns?.brevo_code) {
      dnsRecords.push({
        type: dns.brevo_code.type,
        host: dns.brevo_code.host_name,
        value: dns.brevo_code.value,
        purpose: 'brevo-code',
      });
    }
    // dmarc_record
    if (dns?.dmarc_record) {
      dnsRecords.push({
        type: dns.dmarc_record.type,
        host: dns.dmarc_record.host_name,
        value: dns.dmarc_record.value,
        purpose: 'dmarc',
      });
    }

    // Create domain in our database
    const domain = await this.repository.createDomain({
      connectionId: connection.id,
      domainName: dto.domainName,
      brevoDomainId: String(brevoDomain.id),
      dnsMode: dto.existingDomainId
        ? 'cloudflare-managed'
        : dto.dnsMode || 'manual',
      dnsRecords,
    });

    // Handle existing domain case: Add Brevo DNS records to existing Cloudflare zone
    if (dto.existingDomainId && this.cloudflareService.isAvailable()) {
      try {
        this.logger.log(
          `Using existing domain ${dto.existingDomainId} for Brevo DNS provisioning`,
        );

        // Find the existing Cloudflare zone for this domain
        const zone = await this.cloudflareService.getZoneByName(dto.domainName);

        if (zone) {
          // Add Brevo DNS records to existing zone
          const recordsToCreate = dnsRecords.map((r) => ({
            type: r.type as 'TXT' | 'CNAME',
            host: r.host,
            value: r.value,
          }));

          await this.cloudflareService.createEmailDnsRecords(
            zone.id,
            recordsToCreate,
          );

          // Update domain status to verifying (DNS records added, waiting for Brevo to verify)
          await this.repository.updateDomain(domain.id, {
            nameservers: zone.name_servers,
            status: 'verifying',
          });

          this.logger.log(
            `Brevo DNS records added to existing Cloudflare zone for ${dto.domainName}`,
          );

          // Trigger immediate verification attempt
          try {
            await this.brevoApi.authenticateDomain(apiKey, dto.domainName);
          } catch (authError: any) {
            this.logger.warn(
              `Initial auth trigger failed: ${authError.message}`,
            );
          }
        } else {
          this.logger.warn(
            `No Cloudflare zone found for ${dto.domainName}, falling back to manual`,
          );
        }
      } catch (error: any) {
        this.logger.error(
          `Failed to add Brevo DNS to existing zone for ${dto.domainName}: ${error.message}`,
        );
        // Don't fail, user can still do manual setup
      }
    }
    // Handle new cloudflare-managed domain (creates new zone)
    else if (
      dto.dnsMode === 'cloudflare-managed' &&
      this.cloudflareService.isAvailable()
    ) {
      try {
        this.logger.log(
          `Starting Cloudflare provisioning for ${dto.domainName}`,
        );

        // 1. Create zone (or find existing)
        let zone;
        try {
          zone = await this.cloudflareService.createZone(dto.domainName);
        } catch (error: any) {
          if (error.message?.includes('already exists')) {
            // Find zone by name if it already exists
            zone = await this.cloudflareService.getZoneByName(dto.domainName);
          } else {
            throw error;
          }
        }

        if (zone) {
          // 2. Create DNS records
          const recordsToCreate = dnsRecords.map((r) => ({
            type: r.type as 'TXT' | 'CNAME',
            host: r.host,
            value: r.value,
          }));

          await this.cloudflareService.createEmailDnsRecords(
            zone.id,
            recordsToCreate,
          );

          // 3. Update domain status
          await this.repository.updateDomain(domain.id, {
            nameservers: zone.name_servers,
            status: 'verifying',
          });

          this.logger.log(
            `Cloudflare provisioning complete for ${dto.domainName}`,
          );
        }
      } catch (error: any) {
        this.logger.error(
          `Cloudflare provisioning failed for ${dto.domainName}: ${error.message}`,
        );
        // Don't fail the whole request, just log it. The user can still do manual setup.
      }
    }

    this.logger.log(`Domain ${dto.domainName} added for account ${accountId}`);

    return domain;
  }

  /**
   * Helper: Add Brevo DNS records to existing Cloudflare zone
   */
  private async addBrevoRecordsToCloudflare(
    apiKey: string,
    domainName: string,
    brevoDomain: any,
    localDomainId: string,
  ) {
    try {
      this.logger.log(
        `Adding Brevo DNS records to Cloudflare for ${domainName}`,
      );

      // Extract DNS records from Brevo response
      this.logger.log(
        `Brevo domain response: id=${brevoDomain.id}, authenticated=${brevoDomain.authenticated}`,
      );
      this.logger.log(
        `Brevo dns_records: ${JSON.stringify(brevoDomain.dns_records)}`,
      );

      const dnsRecords: {
        type: 'TXT' | 'CNAME';
        host: string;
        value: string;
      }[] = [];

      const dns = brevoDomain.dns_records;

      // Handle new format: dkim1Record and dkim2Record (CNAME records)
      if (dns?.dkim1Record) {
        this.logger.log(
          `Found dkim1Record: ${JSON.stringify(dns.dkim1Record)}`,
        );
        dnsRecords.push({
          type: dns.dkim1Record.type as 'TXT' | 'CNAME',
          host: dns.dkim1Record.host_name,
          value: dns.dkim1Record.value,
        });
      }
      if (dns?.dkim2Record) {
        this.logger.log(
          `Found dkim2Record: ${JSON.stringify(dns.dkim2Record)}`,
        );
        dnsRecords.push({
          type: dns.dkim2Record.type as 'TXT' | 'CNAME',
          host: dns.dkim2Record.host_name,
          value: dns.dkim2Record.value,
        });
      }

      // Handle legacy format: dkim_record (for older Brevo API versions)
      if (dns?.dkim_record) {
        this.logger.log(
          `Found dkim_record (legacy): ${JSON.stringify(dns.dkim_record)}`,
        );
        dnsRecords.push({
          type: dns.dkim_record.type as 'TXT' | 'CNAME',
          host: dns.dkim_record.host_name,
          value: dns.dkim_record.value,
        });
      }

      // Handle brevo_code (TXT record)
      if (dns?.brevo_code) {
        this.logger.log(`Found brevo_code: ${JSON.stringify(dns.brevo_code)}`);
        dnsRecords.push({
          type: dns.brevo_code.type as 'TXT' | 'CNAME',
          host: dns.brevo_code.host_name,
          value: dns.brevo_code.value,
        });
      }

      // Handle dmarc_record (TXT record)
      if (dns?.dmarc_record) {
        this.logger.log(
          `Found dmarc_record: ${JSON.stringify(dns.dmarc_record)}`,
        );
        dnsRecords.push({
          type: dns.dmarc_record.type as 'TXT' | 'CNAME',
          host: dns.dmarc_record.host_name,
          value: dns.dmarc_record.value,
        });
      }

      if (dnsRecords.length === 0) {
        this.logger.warn(
          `No DNS records found in Brevo response for ${domainName}`,
        );
        this.logger.debug(
          `Brevo response dns_records: ${JSON.stringify(brevoDomain.dns_records)}`,
        );
        return;
      }

      this.logger.log(
        `Extracted ${dnsRecords.length} DNS records from Brevo: ${dnsRecords.map((r) => `${r.type}:${r.host}`).join(', ')}`,
      );

      // Find the existing Cloudflare zone
      const zone = await this.cloudflareService.getZoneByName(domainName);

      if (zone) {
        await this.cloudflareService.createEmailDnsRecords(zone.id, dnsRecords);

        // Update domain status
        await this.repository.updateDomain(localDomainId, {
          nameservers: zone.name_servers,
          status: 'verifying',
        });

        this.logger.log(
          `Brevo DNS records added to Cloudflare zone for ${domainName}`,
        );

        // Trigger immediate verification
        try {
          await this.brevoApi.authenticateDomain(apiKey, domainName);
        } catch (authError: any) {
          this.logger.warn(`Initial auth trigger failed: ${authError.message}`);
        }
      } else {
        this.logger.warn(`No Cloudflare zone found for ${domainName}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to add Brevo DNS to Cloudflare for ${domainName}: ${error.message}`,
      );
      // Don't fail, user can still do manual setup
    }
  }

  /**
   * Get domain details
   */
  async getDomain(accountId: string, domainId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    const domain = await this.repository.findDomainById(domainId);
    if (!domain || domain.connectionId !== connection.id) {
      throw new NotFoundException('Domain not found');
    }

    return domain;
  }

  /**
   * Delete (archive) a domain and remove from Brevo
   */
  async deleteDomain(accountId: string, domainIdOrName: string) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    // Try to find if it's a local domain ID (UUID)
    let domainName = domainIdOrName;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        domainIdOrName,
      );

    if (isUuid) {
      const domain = await this.repository.findDomainById(domainIdOrName);
      if (domain && domain.connectionId === connection.id) {
        domainName = domain.domainName;
        // Archive the domain (soft delete)
        await this.repository.updateDomain(domain.id, {
          isArchived: true,
          archivedAt: new Date(),
        });
      }
    }

    // Always try to delete from Brevo using the domain name
    try {
      await this.brevoApi.deleteDomain(apiKey, domainName);
      this.logger.log(
        `Domain ${domainName} deleted from Brevo for account ${accountId}`,
      );
    } catch (error: any) {
      this.logger.warn(
        `Failed to delete domain ${domainName} from Brevo: ${error.message}`,
      );
      // If we didn't find a local record and Brevo failed, then rethrow
      if (!isUuid) throw error;
    }

    return { message: 'Domain deleted successfully' };
  }

  /**
   * Trigger domain verification
   */
  async verifyDomain(accountId: string, domainId: string) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    const domain = await this.repository.findDomainById(domainId);
    if (!domain || domain.connectionId !== connection.id) {
      throw new NotFoundException('Domain not found');
    }

    // Update status to verifying
    await this.repository.updateDomain(domainId, { status: 'verifying' });

    // Trigger authentication in Brevo
    try {
      // First trigger the authentication check
      await this.brevoApi.authenticateDomain(apiKey, domain.domainName);

      // Then fetch the latest domain status from Brevo
      // The authenticate endpoint may not return the updated status immediately
      const latestDomain = await this.brevoApi.getDomain(
        apiKey,
        domain.domainName,
      );

      this.logger.log(
        `Domain ${domain.domainName} verification result: authenticated=${latestDomain.authenticated}`,
      );

      // Update with results from the fresh domain fetch
      await this.repository.updateDomain(domainId, {
        status: latestDomain.authenticated ? 'verified' : 'verifying',
        dkimVerified: latestDomain.dns_records?.dkim_record?.status || false,
        lastCheckedAt: new Date(),
      });

      return {
        verified: latestDomain.authenticated,
        dkimVerified: latestDomain.dns_records?.dkim_record?.status || false,
      };
    } catch (error: any) {
      await this.repository.updateDomain(domainId, {
        status: 'failed',
        lastCheckedAt: new Date(),
      });
      throw new BadRequestException(
        `Domain verification failed: ${error.message}`,
      );
    }
  }

  // =================
  // SENDER OPERATIONS
  // =================

  /**
   * List senders for a domain (auto-syncs from Brevo first)
   */
  async listSenders(accountId: string, domainId: string) {
    const domain = await this.getDomain(accountId, domainId);

    // Sync senders from Brevo API to local DB first
    await this.syncSendersFromBrevo(accountId, domain.id);

    const senders = await this.repository.findSendersByDomainId(domain.id);

    return senders.map((s) => ({
      id: s.id,
      email: s.email,
      name: s.name,
      isVerified: s.isVerified,
      isDisabled: s.isDisabled,
      disabledReason: s.disabledReason,
      complaintCount: s.complaintCount,
      createdAt: s.createdAt,
    }));
  }

  /**
   * Sync senders from Brevo API to local database
   * Creates missing senders and updates isVerified based on active status from Brevo
   */
  async syncSendersFromBrevo(accountId: string, domainId: string) {
    const { apiKey } = await this.getApiKeyFromAccount(accountId);
    const domain = await this.repository.findDomainById(domainId);

    if (!domain) return;

    try {
      // Fetch all senders from Brevo API
      const { senders: brevoSenders } = await this.brevoApi.listSenders(apiKey);

      // Filter to senders that belong to this domain
      const domainSenders = brevoSenders.filter((s) =>
        s.email.toLowerCase().endsWith(`@${domain.domainName.toLowerCase()}`),
      );

      this.logger.log(
        `Syncing ${domainSenders.length} senders for domain ${domain.domainName}`,
      );

      for (const brevoSender of domainSenders) {
        // Check if sender exists locally
        const existingLocal = await this.repository.findSenderByEmail(
          domainId,
          brevoSender.email,
        );

        if (existingLocal) {
          // Update isVerified based on Brevo's active status
          const shouldBeVerified = brevoSender.active;
          if (existingLocal.isVerified !== shouldBeVerified) {
            this.logger.log(
              `Updating sender ${brevoSender.email} isVerified: ${existingLocal.isVerified} -> ${shouldBeVerified}`,
            );
            await this.repository.updateSender(existingLocal.id, {
              isVerified: shouldBeVerified,
              brevoSenderId: String(brevoSender.id),
            });
          }
        } else {
          // Create new local sender record from Brevo
          this.logger.log(
            `Creating local record for Brevo sender: ${brevoSender.email} (active=${brevoSender.active})`,
          );
          const newSender = await this.repository.createSender({
            domainId: domainId,
            brevoSenderId: String(brevoSender.id),
            email: brevoSender.email,
            name: brevoSender.name,
          });

          // Update isVerified based on active status
          if (brevoSender.active) {
            await this.repository.updateSender(newSender.id, {
              isVerified: true,
            });
          }
        }
      }
    } catch (error: any) {
      this.logger.warn(`Failed to sync senders from Brevo: ${error.message}`);
      // Don't fail the list operation, just continue with local data
    }
  }

  /**
   * Create sender (idempotent - returns existing if duplicate)
   */
  async createSender(
    accountId: string,
    userId: string,
    dto: CreateBrevoSenderDto,
  ) {
    // Check if user is verified
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.isVerified) {
      throw new ForbiddenException(
        'User verification required to create Brevo senders.',
      );
    }

    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    const domain = await this.repository.findDomainById(dto.domainId);
    if (!domain || domain.connectionId !== connection.id) {
      throw new NotFoundException('Domain not found');
    }

    // Check domain is verified
    if (domain.status !== 'verified') {
      throw new BadRequestException(
        'Domain must be verified before creating senders',
      );
    }

    // Check for existing sender (idempotent)
    const existing = await this.repository.findSenderByEmail(
      domain.id,
      dto.email,
    );
    if (existing) {
      this.logger.log(`Sender ${dto.email} already exists, returning existing`);
      return existing;
    }

    // Validate email belongs to domain
    const emailDomain = dto.email.split('@')[1];
    if (emailDomain !== domain.domainName) {
      throw new BadRequestException(
        `Email domain ${emailDomain} does not match ${domain.domainName}`,
      );
    }

    // Create sender in Brevo
    let brevoSender;
    try {
      brevoSender = await this.brevoApi.createSender(
        apiKey,
        dto.email,
        dto.name,
      );
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to create sender in Brevo: ${error.message}`,
      );
    }

    // Create sender in our database
    const sender = await this.repository.createSender({
      domainId: domain.id,
      brevoSenderId: String(brevoSender.id),
      email: dto.email,
      name: dto.name,
    });

    // Mark as verified if Brevo says it's active
    if (brevoSender.active) {
      await this.repository.updateSender(sender.id, { isVerified: true });
    }

    this.logger.log(
      `Sender ${dto.email} created for domain ${domain.domainName}`,
    );

    return sender;
  }

  /**
   * Delete (archive) a sender and remove from Brevo
   */
  async deleteSender(accountId: string, senderIdOrBrevoId: string) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    let brevoSenderId: number | null = null;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        senderIdOrBrevoId,
      );

    if (isUuid) {
      const sender = await this.repository.findSenderById(senderIdOrBrevoId);
      if (sender) {
        // Verify sender belongs to this account via domain
        const domain = await this.repository.findDomainById(sender.domainId);
        if (domain && domain.connectionId === connection.id) {
          brevoSenderId = Number(sender.brevoSenderId);
          // Archive the sender (soft delete)
          await this.repository.updateSender(sender.id, {
            isArchived: true,
            archivedAt: new Date(),
          });
        }
      }
    } else {
      // Treat as direct Brevo ID
      brevoSenderId = Number(senderIdOrBrevoId);
    }

    if (!brevoSenderId || isNaN(brevoSenderId)) {
      throw new BadRequestException('Invalid sender identifier');
    }

    // Always try to delete from Brevo
    try {
      await this.brevoApi.deleteSender(apiKey, brevoSenderId);
      this.logger.log(
        `Sender ${brevoSenderId} deleted from Brevo for account ${accountId}`,
      );
    } catch (error: any) {
      this.logger.warn(
        `Failed to delete sender ${brevoSenderId} from Brevo: ${error.message}`,
      );
      if (!isUuid) throw error;
    }

    return { message: 'Sender deleted successfully' };
  }

  // =================
  // EMAIL SENDING
  // =================

  /**
   * Send email with guardrails
   */
  async sendEmail(
    accountId: string,
    dto: SendBrevoEmailDto,
    ipAddress?: string,
  ) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    // Get sender and validate
    const sender = await this.repository.findSenderById(dto.senderId);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Validate sender belongs to this account's domain
    const domain = await this.repository.findDomainById(sender.domainId);
    if (!domain || domain.connectionId !== connection.id) {
      throw new ForbiddenException('Sender does not belong to your account');
    }

    // Check sender is not disabled
    if (sender.isDisabled) {
      throw new ForbiddenException(`Sender disabled: ${sender.disabledReason}`);
    }

    // Check domain is verified
    if (domain.status !== 'verified') {
      throw new BadRequestException('Domain must be verified before sending');
    }

    // Check rate limits
    const tier = connection.sendingTier || 'restricted';
    const limit = RATE_LIMITS[tier];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyCount = await this.repository.countDailySends(
      connection.id,
      today,
    );
    if (dailyCount >= limit) {
      throw new ForbiddenException(
        `Daily send limit reached (${limit}). Upgrade to send more.`,
      );
    }

    // Send via Brevo API
    try {
      const result = await this.brevoApi.sendEmail(apiKey, {
        sender: { email: sender.email, name: sender.name || undefined },
        to: [{ email: dto.to, name: dto.toName }],
        subject: dto.subject,
        htmlContent: dto.htmlContent,
        textContent: dto.textContent,
      });

      // Log successful send
      await this.repository.createSendLog({
        connectionId: connection.id,
        senderId: sender.id,
        brevoMessageId: result.messageId,
        toEmail: dto.to,
        subject: dto.subject,
        status: 'success',
        ipAddress,
      });

      this.logger.log(`Email sent via Brevo: ${result.messageId}`);

      return {
        messageId: result.messageId,
        success: true,
      };
    } catch (error: any) {
      // Log failed send
      await this.repository.createSendLog({
        connectionId: connection.id,
        senderId: sender.id,
        toEmail: dto.to,
        subject: dto.subject,
        status: 'failed',
        errorMessage: error.message,
        ipAddress,
      });

      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send email using a sender email directly from Brevo account (not from local DB)
   * This allows using senders that were created directly in Brevo dashboard
   */
  async sendEmailWithBrevoSender(
    accountId: string,
    dto: {
      senderEmail: string;
      senderName?: string;
      to: string;
      toName?: string;
      subject: string;
      htmlContent: string;
      textContent?: string;
    },
    ipAddress?: string,
  ) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    // Verify the sender exists in Brevo account
    const { senders } = await this.brevoApi.listSenders(apiKey);
    const brevoSender = senders.find(
      (s) => s.email.toLowerCase() === dto.senderEmail.toLowerCase(),
    );

    if (!brevoSender) {
      throw new NotFoundException(
        `Sender ${dto.senderEmail} not found in your Brevo account`,
      );
    }

    if (!brevoSender.active) {
      throw new BadRequestException(
        `Sender ${dto.senderEmail} is not active in Brevo`,
      );
    }

    // Check rate limits
    const tier = connection.sendingTier || 'restricted';
    const limit = RATE_LIMITS[tier];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyCount = await this.repository.countDailySends(
      connection.id,
      today,
    );
    if (dailyCount >= limit) {
      throw new ForbiddenException(
        `Daily send limit reached (${limit}). Upgrade to send more.`,
      );
    }

    // Send via Brevo API
    try {
      // Ensure sender exists in local DB for logging
      const localSender = await this.ensureLocalSender(
        connection.id,
        dto.senderEmail,
        dto.senderName || brevoSender.name,
      );

      const result = await this.brevoApi.sendEmail(apiKey, {
        sender: {
          email: dto.senderEmail,
          name: dto.senderName || brevoSender.name || undefined,
        },
        to: [{ email: dto.to, name: dto.toName }],
        subject: dto.subject,
        htmlContent: dto.htmlContent,
        textContent: dto.textContent,
      });

      // Log successful send
      await this.repository.createSendLog({
        connectionId: connection.id,
        senderId: localSender.id,
        brevoMessageId: result.messageId,
        toEmail: dto.to,
        subject: dto.subject,
        status: 'success',
        ipAddress,
      });

      this.logger.log(`Email sent via Brevo sender: ${result.messageId}`);

      return {
        messageId: result.messageId,
        success: true,
      };
    } catch (error: any) {
      // For failure logging, we try to get a sender ID if possible, otherwise we might fail to log
      // But we should try to log even if we can't find the sender.
      // However, the schema requires senderId.
      // If we failed before ensuring sender, we might not have it.
      // We will try to ensure sender even in catch block if not already done?
      // Or just wrap the whole thing.
      // For now, let's just log if we have the senderId, or skip logging to DB if we can't satisfy the constraint.
      // Better yet, let's move ensureLocalSender outside the try/catch for sending, so we have it for both success/fail logs of the "send" op.
      // But ensureLocalSender deals with DB, which might fail.
      // Let's keep it inside.

      let senderIdStub = '';
      try {
        // quick attempt to get sender id for logging
        const localSender = await this.ensureLocalSender(
          connection.id,
          dto.senderEmail,
          dto.senderName || brevoSender.name,
        );
        senderIdStub = localSender.id;
      } catch (e) {
        // ignore failure to get sender for error logging
      }

      if (senderIdStub) {
        await this.repository.createSendLog({
          connectionId: connection.id,
          senderId: senderIdStub,
          toEmail: dto.to,
          subject: dto.subject,
          status: 'failed',
          errorMessage: error.message,
          ipAddress,
        });
      }

      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Helper to ensure a Brevo sender exists in local DB
   * Used for logging actions on account-level senders that might not be locally imported
   */
  private async ensureLocalSender(
    connectionId: string,
    email: string,
    name?: string,
  ) {
    const domainName = email.split('@')[1];

    // 1. Ensure Domain Exists
    let domain = await this.repository.findDomainByName(
      connectionId,
      domainName,
    );
    if (!domain) {
      domain = await this.repository.createDomain({
        connectionId,
        domainName,
        dnsMode: 'manual', // Default for auto-created domains
      });
      // We assume it's verified since we are sending from it via account API
      await this.repository.updateDomain(domain.id, {
        status: 'verified',
        dkimVerified: true, // Optimistic
        spfVerified: true,
      });
    }

    // 2. Ensure Sender Exists
    let sender = await this.repository.findSenderByEmail(domain.id, email);
    if (!sender) {
      sender = await this.repository.createSender({
        domainId: domain.id,
        email,
        name,
      });
      await this.repository.updateSender(sender.id, {
        isVerified: true,
      });
    }

    return sender;
  }
}
