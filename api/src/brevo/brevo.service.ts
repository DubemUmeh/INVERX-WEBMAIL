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
  ) {}

  // =====================
  // CONNECTION OPERATIONS
  // =====================

  /**
   * Get connection status for an account
   */
  async getConnectionStatus(accountId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: true,
      status: connection.status,
      sendingTier: connection.sendingTier,
      email: connection.email,
      dailySendCount: connection.dailySendCount,
      lastValidatedAt: connection.lastValidatedAt,
      createdAt: connection.createdAt,
      isCloudflareAvailable: this.cloudflareService.isAvailable(),
    };
  }

  /**
   * Connect a Brevo account by validating and storing API key
   */
  async connect(accountId: string, dto: ConnectBrevoDto) {
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

      return domains.map((d) => ({
        id: d.id,
        domainName: d.domain_name,
        authenticated: d.authenticated,
        dnsRecords: d.dns_records
          ? {
              dkimRecord: d.dns_records.dkim_record
                ? {
                    type: d.dns_records.dkim_record.type,
                    host: d.dns_records.dkim_record.host_name,
                    value: d.dns_records.dkim_record.value,
                    verified: d.dns_records.dkim_record.status,
                  }
                : null,
              brevoCode: d.dns_records.brevo_code
                ? {
                    type: d.dns_records.brevo_code.type,
                    host: d.dns_records.brevo_code.host_name,
                    value: d.dns_records.brevo_code.value,
                    verified: d.dns_records.brevo_code.status,
                  }
                : null,
            }
          : null,
      }));
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
        verificationStatus: d.verificationStatus,
      }));
  }

  /**
   * List domains for an account
   */
  async listDomains(accountId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    const domains = await this.repository.findDomainsByConnectionId(
      connection.id,
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
   * Add a domain (idempotent - returns existing if duplicate)
   * Supports two modes:
   * 1. existingDomainId provided: Use existing domain from Domain Management, add Brevo DNS to its Cloudflare zone
   * 2. Manual: Create new domain in Brevo with manual DNS setup
   */
  async addDomain(accountId: string, dto: CreateBrevoDomainDto) {
    const { apiKey, connection } = await this.getApiKeyFromAccount(accountId);

    // Check for existing domain (idempotent)
    const existing = await this.repository.findDomainByName(
      connection.id,
      dto.domainName,
    );
    if (existing) {
      this.logger.log(
        `Domain ${dto.domainName} already exists, returning existing`,
      );
      return existing;
    }

    // Create domain in Brevo
    let brevoDomain;
    try {
      brevoDomain = await this.brevoApi.createDomain(apiKey, dto.domainName);
    } catch (error: any) {
      // Check if domain already exists in Brevo
      if (
        error.message?.includes('409') ||
        error.message?.includes('already exists')
      ) {
        brevoDomain = await this.brevoApi.getDomain(apiKey, dto.domainName);
      } else {
        throw new BadRequestException(
          `Failed to create domain in Brevo: ${error.message}`,
        );
      }
    }

    // Extract DNS records from Brevo response
    const dnsRecords: BrevoDnsRecord[] = [];
    if (brevoDomain.dns_records?.dkim_record) {
      dnsRecords.push({
        type: brevoDomain.dns_records.dkim_record.type,
        host: brevoDomain.dns_records.dkim_record.host_name,
        value: brevoDomain.dns_records.dkim_record.value,
        purpose: 'dkim',
      });
    }
    if (brevoDomain.dns_records?.brevo_code) {
      dnsRecords.push({
        type: brevoDomain.dns_records.brevo_code.type,
        host: brevoDomain.dns_records.brevo_code.host_name,
        value: brevoDomain.dns_records.brevo_code.value,
        purpose: 'brevo-code',
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
   * Delete (archive) a domain
   */
  async deleteDomain(accountId: string, domainId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    const domain = await this.repository.findDomainById(domainId);
    if (!domain || domain.connectionId !== connection.id) {
      throw new NotFoundException('Domain not found');
    }

    // Archive the domain (soft delete)
    await this.repository.updateDomain(domainId, {
      isArchived: true,
      archivedAt: new Date(),
    });

    this.logger.log(
      `Domain ${domain.domainName} deleted for account ${accountId}`,
    );

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
      const result = await this.brevoApi.authenticateDomain(
        apiKey,
        domain.domainName,
      );

      // Update with results
      await this.repository.updateDomain(domainId, {
        status: result.authenticated ? 'verified' : 'verifying',
        dkimVerified: result.dns_records?.dkim_record?.status || false,
        lastCheckedAt: new Date(),
      });

      return {
        verified: result.authenticated,
        dkimVerified: result.dns_records?.dkim_record?.status || false,
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
   * List senders for a domain
   */
  async listSenders(accountId: string, domainId: string) {
    const domain = await this.getDomain(accountId, domainId);
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
   * Create sender (idempotent - returns existing if duplicate)
   */
  async createSender(accountId: string, dto: CreateBrevoSenderDto) {
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
   * Delete (archive) a sender
   */
  async deleteSender(accountId: string, senderId: string) {
    const connection =
      await this.repository.findConnectionByAccountId(accountId);
    if (!connection) {
      throw new NotFoundException('No Brevo connection found');
    }

    const sender = await this.repository.findSenderById(senderId);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Verify sender belongs to this account via domain
    const domain = await this.repository.findDomainById(sender.domainId);
    if (!domain || domain.connectionId !== connection.id) {
      throw new NotFoundException('Sender not found');
    }

    // Archive the sender (soft delete)
    await this.repository.updateSender(senderId, {
      isArchived: true,
      archivedAt: new Date(),
    });

    this.logger.log(`Sender ${sender.email} deleted for account ${accountId}`);

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
