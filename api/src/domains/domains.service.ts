import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DomainsRepository } from './domains.repository.js';
import { DomainVerificationService } from './domain-verification.service.js';
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

      const dnsInstructions =
        this.domainVerificationService.generateDnsSetupInstructions(domainName);

      await this.saveDnsRecords(domain.id, domainName, dnsInstructions);

      return {
        id: domain.id,
        name: domain.name,
        status: 'pending',
        verificationStatus: 'unverified',
        dnsRecords: dnsInstructions,
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

    const verificationResult =
      await this.domainVerificationService.verifyAndUpdateDomain(
        domain.id,
        domain.name,
      );

    return {
      domainId: domain.id,
      domain: domain.name,
      verified: verificationResult.overallValid,
      spf: {
        valid: verificationResult.spf.valid,
        message: verificationResult.spf.reason,
        record: verificationResult.spf.record,
      },
      dkim: {
        valid: verificationResult.dkim.valid,
        message: verificationResult.dkim.reason,
        record: verificationResult.dkim.record,
      },
      dmarc: {
        valid: verificationResult.dmarc.valid,
        message: verificationResult.dmarc.reason,
        record: verificationResult.dmarc.record,
        policy: verificationResult.dmarc.policy,
      },
      checkedAt: verificationResult.checkedAt,
      message: verificationResult.overallValid
        ? 'Domain verified successfully! You can now create email addresses.'
        : 'DNS verification incomplete. Please ensure all required records are configured.',
    };
  }

  async getDnsRecords(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    const storedRecords = await this.domainsRepository.findDnsRecords(
      domain.id,
    );
    const instructions =
      this.domainVerificationService.generateDnsSetupInstructions(domain.name);

    return {
      domain: domain.name,
      requiredRecords: instructions,
      storedRecords,
    };
  }

  async checkDns(accountId: string, idOrName: string) {
    const domain = await this.getDomain(accountId, idOrName);
    const status = await this.domainVerificationService.verifyDomain(
      domain.name,
    );

    return {
      domain: domain.name,
      status: {
        spf: status.spf,
        dkim: status.dkim,
        dmarc: status.dmarc,
      },
      overallValid: status.overallValid,
      checkedAt: status.checkedAt,
    };
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

  private async saveDnsRecords(
    domainId: string,
    domainName: string,
    instructions: ReturnType<
      DomainVerificationService['generateDnsSetupInstructions']
    >,
  ) {
    await Promise.all([
      this.domainsRepository.createDnsRecord({
        domainId,
        type: instructions.spf.type,
        name: instructions.spf.name,
        value: instructions.spf.value,
      }),
      this.domainsRepository.createDnsRecord({
        domainId,
        type: instructions.dkim.type,
        name: instructions.dkim.name,
        value: instructions.dkim.value,
      }),
      this.domainsRepository.createDnsRecord({
        domainId,
        type: instructions.dmarc.type,
        name: instructions.dmarc.name,
        value: instructions.dmarc.value,
      }),
    ]);

    if (instructions.mx) {
      await this.domainsRepository.createDnsRecord({
        domainId,
        type: instructions.mx.type,
        name: instructions.mx.name,
        value: instructions.mx.value,
        priority: instructions.mx.priority,
      });
    }
  }

  private isValidDomainName(domain: string): boolean {
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }
}
