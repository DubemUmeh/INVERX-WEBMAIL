import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, getTableColumns } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import {
  domains,
  dnsRecords,
  domainAddresses,
  domainCloudflare,
  domainSes,
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

    const results = await this.db
      .select({
        ...getTableColumns(domains),
        cloudflare: {
          zoneId: domainCloudflare.zoneId,
          mode: domainCloudflare.mode,
          status: domainCloudflare.status,
          lastSyncedAt: domainCloudflare.lastSyncedAt,
          nameservers: domainCloudflare.nameservers,
        },
        ses: {
          verificationStatus: domainSes.verificationStatus,
          dkimVerified: domainSes.dkimVerified,
          spfVerified: domainSes.spfVerified,
          dmarcVerified: domainSes.dmarcVerified,
          lastCheckedAt: domainSes.lastCheckedAt,
        },
      })
      .from(domains)
      .leftJoin(domainCloudflare, eq(domains.id, domainCloudflare.domainId))
      .leftJoin(domainSes, eq(domains.id, domainSes.domainId))
      .where(eq(domains.accountId, accountId))
      .orderBy(desc(domains.createdAt))
      .limit(limit)
      .offset(offset);

    // Clean up null cloudflare/ses objects
    return results.map((row) => ({
      ...row,
      cloudflare: row.cloudflare?.zoneId ? row.cloudflare : undefined,
      ses: row.ses?.verificationStatus ? row.ses : undefined,
    }));
  }

  async findById(accountId: string, domainId: string) {
    const result = await this.db
      .select({
        ...getTableColumns(domains),
        cloudflare: {
          zoneId: domainCloudflare.zoneId,
          mode: domainCloudflare.mode,
          status: domainCloudflare.status,
          lastSyncedAt: domainCloudflare.lastSyncedAt,
          nameservers: domainCloudflare.nameservers,
        },
        ses: {
          verificationStatus: domainSes.verificationStatus,
          dkimVerified: domainSes.dkimVerified,
          spfVerified: domainSes.spfVerified,
          dmarcVerified: domainSes.dmarcVerified,
          lastCheckedAt: domainSes.lastCheckedAt,
        },
      })
      .from(domains)
      .leftJoin(domainCloudflare, eq(domains.id, domainCloudflare.domainId))
      .leftJoin(domainSes, eq(domains.id, domainSes.domainId))
      .where(and(eq(domains.id, domainId), eq(domains.accountId, accountId)))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      cloudflare: row.cloudflare?.zoneId ? row.cloudflare : undefined,
      ses: row.ses?.verificationStatus ? row.ses : undefined,
      // Map SES fields to root object level if needed for backward compatibility during refactor,
      // OR preferably frontend should use .ses.*.
      // For now, let's keep the return object clean and assume frontend updates.
    };
  }

  async findByName(accountId: string, domainName: string) {
    const result = await this.db
      .select({
        ...getTableColumns(domains),
        cloudflare: {
          zoneId: domainCloudflare.zoneId,
          mode: domainCloudflare.mode,
          status: domainCloudflare.status,
          lastSyncedAt: domainCloudflare.lastSyncedAt,
          nameservers: domainCloudflare.nameservers,
        },
        ses: {
          verificationStatus: domainSes.verificationStatus,
          dkimVerified: domainSes.dkimVerified,
          spfVerified: domainSes.spfVerified,
          dmarcVerified: domainSes.dmarcVerified,
          lastCheckedAt: domainSes.lastCheckedAt,
        },
      })
      .from(domains)
      .leftJoin(domainCloudflare, eq(domains.id, domainCloudflare.domainId))
      .leftJoin(domainSes, eq(domains.id, domainSes.domainId))
      .where(
        and(eq(domains.name, domainName), eq(domains.accountId, accountId)),
      )
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      cloudflare: row.cloudflare?.zoneId ? row.cloudflare : undefined,
      ses: row.ses?.verificationStatus ? row.ses : undefined,
    };
  }
  async create(data: { accountId: string; name: string }) {
    const result = await this.db.insert(domains).values(data).returning();

    return result[0];
  }

  async update(
    domainId: string,
    data: Partial<{
      status: 'active' | 'pending' | 'failed' | 'expired';
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
      .select({
        ...getTableColumns(domains),
        ses: {
          verificationStatus: domainSes.verificationStatus,
        },
      })
      .from(domains)
      .leftJoin(domainSes, eq(domains.id, domainSes.domainId))
      .where(eq(domains.id, domainId))
      .limit(1);

    if (result.length === 0) return null;

    const row = result[0];
    return {
      ...row,
      ses: row.ses?.verificationStatus ? row.ses : undefined,
    };
  }

  /**
   * Find Cloudflare-managed domains for an account
   */
  async findCloudflareManaged(accountId: string) {
    return this.db
      .select({
        id: domains.id,
        name: domains.name,
        status: domains.status,
        zoneId: domainCloudflare.zoneId,
        mode: domainCloudflare.mode,
        lastSyncedAt: domainCloudflare.lastSyncedAt,
      })
      .from(domains)
      .innerJoin(domainCloudflare, eq(domains.id, domainCloudflare.domainId))
      .where(eq(domains.accountId, accountId))
      .orderBy(desc(domains.createdAt));
  }

  /**
   * Get Cloudflare integration data for a domain
   */
  async getCloudflareByDomainId(domainId: string) {
    const result = await this.db
      .select()
      .from(domainCloudflare)
      .where(eq(domainCloudflare.domainId, domainId))
      .limit(1);

    return result[0] || null;
  }

  async createCloudflareIntegration(data: {
    domainId: string;
    zoneId: string;
    nameservers?: string[];
    mode?: 'managed' | 'external';
    status?: string;
    lastSyncedAt?: Date;
  }) {
    const result = await this.db
      .insert(domainCloudflare)
      .values({
        domainId: data.domainId,
        zoneId: data.zoneId,
        nameservers: data.nameservers || [],
        mode: data.mode || 'managed',
        status: data.status || 'pending',
        lastSyncedAt: data.lastSyncedAt || new Date(),
      })
      .returning();

    return result[0] || null;
  }

  async updateCloudflareStatus(
    domainId: string,
    data: Partial<{
      status: string;
      lastSyncedAt: Date;
    }>,
  ) {
    await this.db
      .update(domainCloudflare)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(domainCloudflare.domainId, domainId));
  }

  // SES Integration
  async getSesByDomainId(domainId: string) {
    const result = await this.db
      .select()
      .from(domainSes)
      .where(eq(domainSes.domainId, domainId))
      .limit(1);

    return result[0] || null;
  }

  async createSesIntegration(data: {
    domainId: string;
    verificationStatus?: 'verified' | 'unverified' | 'pending';
    sesIdentityArn?: string;
  }) {
    const result = await this.db
      .insert(domainSes)
      .values({
        domainId: data.domainId,
        verificationStatus: data.verificationStatus || 'unverified',
        sesIdentityArn: data.sesIdentityArn,
        lastCheckedAt: new Date(),
      })
      .onConflictDoNothing() // Idempotent
      .returning();

    return result[0] || null;
  }

  async updateSesStatus(
    domainId: string,
    data: Partial<{
      verificationStatus: 'verified' | 'unverified' | 'pending';
      dkimVerified: boolean;
      spfVerified: boolean;
      dmarcVerified: boolean;
      lastCheckedAt: Date;
    }>,
  ) {
    await this.db
      .update(domainSes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(domainSes.domainId, domainId));
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
