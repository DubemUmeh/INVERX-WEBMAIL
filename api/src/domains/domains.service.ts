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

@Injectable()
export class DomainsService {
  constructor(
    private domainsRepository: DomainsRepository,
    private domainVerificationService: DomainVerificationService,
    private sesVerificationService: SesVerificationService,
    private sesSyncService: SesSyncService,
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

      // 1. Verify Domain Identity with SES
      const verificationToken =
        await this.sesVerificationService.verifyDomainIdentity(domainName);

      // 2. Get DKIM Tokens
      const dkimTokens =
        await this.sesVerificationService.getDkimTokens(domainName);

      // 3. Construct DNS Records
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
        verificationStatus: 'unverified',
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

    const syncResult = await this.sesSyncService.syncDomainStatus(domain.id);

    // Get current records to display status
    return {
      domainId: domain.id,
      domain: domain.name,
      verified: syncResult?.verified || false,
      status: syncResult?.status,
      message: syncResult?.verified
        ? 'Domain verified successfully! You can now create email addresses.'
        : 'Domain verification pending. Please check your DNS records.',
    };
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
    return this.verifyDomain(accountId, idOrName);
  }

  async getAddresses(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    return this.domainsRepository.findAddresses(domain.id);
  }

  async createAddress(
    accountId: string,
    idOrName: string,
    dto: CreateAddressDto,
  ) {
    const domain = await this.getDomain(accountId, idOrName);

    if (domain.verificationStatus !== 'verified') {
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
