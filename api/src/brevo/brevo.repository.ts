/**
 * Brevo Repository
 *
 * Database operations for Brevo connections, domains, senders, and send logs.
 */

import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../database/drizzle.js';
import {
  brevoConnections,
  brevoDomains,
  brevoSenders,
  brevoSendLogs,
  BrevoDnsRecord,
} from '../database/schema/index.js';

@Injectable()
export class BrevoRepository {
  // =====================
  // CONNECTION OPERATIONS
  // =====================

  async findConnectionByAccountId(accountId: string) {
    const [connection] = await db
      .select()
      .from(brevoConnections)
      .where(
        and(
          eq(brevoConnections.accountId, accountId),
          eq(brevoConnections.isArchived, false),
        ),
      );
    return connection || null;
  }

  async createConnection(data: {
    accountId: string;
    apiKeyEncrypted: string;
    apiKeyIv: string;
    apiKeyTag: string;
    email?: string;
  }) {
    const [connection] = await db
      .insert(brevoConnections)
      .values({
        ...data,
        status: 'active',
        sendingTier: 'restricted',
      })
      .returning();
    return connection;
  }

  async updateConnection(
    id: string,
    data: Partial<{
      status: 'active' | 'invalid' | 'disconnected';
      sendingTier: 'restricted' | 'standard';
      email: string;
      dailySendCount: number;
      dailySendResetAt: Date;
      lastValidatedAt: Date;
      isArchived: boolean;
      archivedAt: Date;
    }>,
  ) {
    const [connection] = await db
      .update(brevoConnections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brevoConnections.id, id))
      .returning();
    return connection;
  }

  async archiveConnection(id: string) {
    return this.updateConnection(id, {
      isArchived: true,
      archivedAt: new Date(),
      status: 'disconnected',
    });
  }

  // =================
  // DOMAIN OPERATIONS
  // =================

  async findDomainsByConnectionId(connectionId: string) {
    return db
      .select()
      .from(brevoDomains)
      .where(
        and(
          eq(brevoDomains.connectionId, connectionId),
          eq(brevoDomains.isArchived, false),
        ),
      );
  }

  async findDomainById(id: string) {
    const [domain] = await db
      .select()
      .from(brevoDomains)
      .where(eq(brevoDomains.id, id));
    return domain || null;
  }

  async findDomainByName(connectionId: string, domainName: string) {
    const [domain] = await db
      .select()
      .from(brevoDomains)
      .where(
        and(
          eq(brevoDomains.connectionId, connectionId),
          eq(brevoDomains.domainName, domainName),
        ),
      );
    return domain || null;
  }

  async createDomain(data: {
    connectionId: string;
    domainName: string;
    brevoDomainId?: string;
    dnsMode?: 'cloudflare-managed' | 'manual';
    dnsRecords?: BrevoDnsRecord[];
  }) {
    const [domain] = await db
      .insert(brevoDomains)
      .values({
        ...data,
        status: 'pending_dns',
      })
      .returning();
    return domain;
  }

  async updateDomain(
    id: string,
    data: Partial<{
      status: 'pending_dns' | 'verifying' | 'verified' | 'failed';
      brevoDomainId: string;
      cloudflareZoneId: string;
      dkimVerified: boolean;
      spfVerified: boolean;
      dmarcVerified: boolean;
      dnsRecords: BrevoDnsRecord[];
      nameservers: string[];
      lastCheckedAt: Date;
      isArchived: boolean;
      archivedAt: Date;
    }>,
  ) {
    const [domain] = await db
      .update(brevoDomains)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brevoDomains.id, id))
      .returning();
    return domain;
  }

  async findPendingDomains() {
    return db
      .select()
      .from(brevoDomains)
      .where(
        and(
          eq(brevoDomains.isArchived, false),
          // Status is pending_dns or verifying
        ),
      );
  }

  // =================
  // SENDER OPERATIONS
  // =================

  async findSendersByDomainId(domainId: string) {
    return db
      .select()
      .from(brevoSenders)
      .where(
        and(
          eq(brevoSenders.domainId, domainId),
          eq(brevoSenders.isArchived, false),
        ),
      );
  }

  async findSenderById(id: string) {
    const [sender] = await db
      .select()
      .from(brevoSenders)
      .where(eq(brevoSenders.id, id));
    return sender || null;
  }

  async findSenderByEmail(domainId: string, email: string) {
    const [sender] = await db
      .select()
      .from(brevoSenders)
      .where(
        and(eq(brevoSenders.domainId, domainId), eq(brevoSenders.email, email)),
      );
    return sender || null;
  }

  async createSender(data: {
    domainId: string;
    brevoSenderId?: string;
    email: string;
    name?: string;
  }) {
    const [sender] = await db
      .insert(brevoSenders)
      .values({
        ...data,
        isVerified: false,
      })
      .returning();
    return sender;
  }

  async updateSender(
    id: string,
    data: Partial<{
      brevoSenderId: string;
      isVerified: boolean;
      complaintCount: number;
      isDisabled: boolean;
      disabledReason: string;
      isArchived: boolean;
      archivedAt: Date;
    }>,
  ) {
    const [sender] = await db
      .update(brevoSenders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(brevoSenders.id, id))
      .returning();
    return sender;
  }

  async incrementSenderComplaintCount(id: string) {
    const sender = await this.findSenderById(id);
    if (!sender) return null;

    const newCount = (sender.complaintCount || 0) + 1;
    const shouldDisable = newCount >= 3; // Threshold

    return this.updateSender(id, {
      complaintCount: newCount,
      isDisabled: shouldDisable,
      disabledReason: shouldDisable ? 'Too many complaints' : undefined,
    });
  }

  // ===================
  // SEND LOG OPERATIONS
  // ===================

  async createSendLog(data: {
    connectionId: string;
    senderId: string;
    brevoMessageId?: string;
    toEmail: string;
    subject?: string;
    status: 'success' | 'failed';
    errorMessage?: string;
    ipAddress?: string;
  }) {
    const [log] = await db.insert(brevoSendLogs).values(data).returning();
    return log;
  }

  async countDailySends(connectionId: string, since: Date) {
    const logs = await db
      .select()
      .from(brevoSendLogs)
      .where(
        and(
          eq(brevoSendLogs.connectionId, connectionId),
          eq(brevoSendLogs.status, 'success'),
        ),
      );

    // Filter by date (simple approach)
    return logs.filter((log) => log.createdAt && log.createdAt >= since).length;
  }
}
