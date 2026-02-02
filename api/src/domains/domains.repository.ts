import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import {
  domains,
  dnsRecords,
  domainAddresses,
} from '../database/schema/index.js';

@Injectable()
export class DomainsRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findAll(
    accountId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return this.db
      .select()
      .from(domains)
      .where(eq(domains.accountId, accountId))
      .orderBy(desc(domains.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findById(accountId: string, domainId: string) {
    const result = await this.db
      .select()
      .from(domains)
      .where(and(eq(domains.id, domainId), eq(domains.accountId, accountId)))
      .limit(1);

    return result[0] || null;
  }

  async findByName(accountId: string, domainName: string) {
    const result = await this.db
      .select()
      .from(domains)
      .where(
        and(eq(domains.name, domainName), eq(domains.accountId, accountId)),
      )
      .limit(1);

    return result[0] || null;
  }
  async create(data: { accountId: string; name: string }) {
    const result = await this.db.insert(domains).values(data).returning();

    return result[0];
  }

  async update(
    domainId: string,
    data: Partial<{
      status: 'active' | 'pending' | 'failed' | 'expired';
      verificationStatus: 'verified' | 'unverified' | 'pending';
      dkimVerified: boolean;
      spfVerified: boolean;
      dmarcVerified: boolean;
      lastCheckedAt: Date;
    }>,
  ) {
    const result = await this.db
      .update(domains)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(domains.id, domainId))
      .returning();

    return result[0] || null;
  }

  async delete(domainId: string) {
    await this.db.delete(domains).where(eq(domains.id, domainId));
  }

  /**
   * Find domain by ID without account check (for internal verification)
   */
  async findByIdWithoutAccount(domainId: string) {
    const result = await this.db
      .select()
      .from(domains)
      .where(eq(domains.id, domainId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find Cloudflare-managed domains for an account (domains with cloudflareZoneId)
   */
  async findCloudflareManaged(accountId: string) {
    // For now, return all active/pending domains as potential candidates
    // In the future, you could add a cloudflareZoneId column to filter
    return this.db
      .select({
        id: domains.id,
        name: domains.name,
        status: domains.status,
        verificationStatus: domains.verificationStatus,
      })
      .from(domains)
      .where(eq(domains.accountId, accountId))
      .orderBy(desc(domains.createdAt));
  }

  // DNS Records
  async findDnsRecords(domainId: string) {
    return this.db
      .select()
      .from(dnsRecords)
      .where(eq(dnsRecords.domainId, domainId));
  }

  async createDnsRecord(data: {
    domainId: string;
    type: string;
    name: string;
    value: string;
    ttl?: number;
    priority?: number;
  }) {
    const result = await this.db.insert(dnsRecords).values(data).returning();

    return result[0];
  }

  async updateDnsRecordsStatus(domainId: string, status: 'active' | 'pending') {
    await this.db
      .update(dnsRecords)
      .set({ status })
      .where(eq(dnsRecords.domainId, domainId));
  }

  // Domain Addresses
  async findAddresses(domainId: string) {
    return this.db
      .select()
      .from(domainAddresses)
      .where(eq(domainAddresses.domainId, domainId));
  }

  async findAllAddressesByAccount(accountId: string) {
    return this.db
      .select({
        id: domainAddresses.id,
        email: domainAddresses.email,
        localPart: domainAddresses.localPart,
        displayName: domainAddresses.displayName,
        domainId: domainAddresses.domainId,
        domainName: domains.name,
        createdAt: domainAddresses.createdAt,
      })
      .from(domainAddresses)
      .innerJoin(domains, eq(domainAddresses.domainId, domains.id))
      .where(eq(domains.accountId, accountId));
  }

  async createAddress(data: {
    domainId: string;
    localPart: string;
    email: string;
    displayName?: string;
  }) {
    const result = await this.db
      .insert(domainAddresses)
      .values(data)
      .returning();

    return result[0];
  }

  async deleteAddress(addressId: string) {
    await this.db
      .delete(domainAddresses)
      .where(eq(domainAddresses.id, addressId));
  }
}
