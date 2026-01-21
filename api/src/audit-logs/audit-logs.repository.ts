import { Injectable, Inject } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import { auditLogs, users } from '../database/schema/index.js';

@Injectable()
export class AuditLogsRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findAll(
    accountId: string,
    options: {
      page?: number;
      limit?: number;
      action?: string;
      resourceType?: string;
      userId?: string;
    } = {},
  ) {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    let conditions = [eq(auditLogs.accountId, accountId)];

    if (options.action) {
      conditions.push(eq(auditLogs.action, options.action));
    }
    if (options.resourceType) {
      conditions.push(eq(auditLogs.resourceType, options.resourceType));
    }
    if (options.userId) {
      conditions.push(eq(auditLogs.userId, options.userId));
    }

    return this.db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        userId: auditLogs.userId,
        userEmail: users.email,
        userName: users.fullName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.userId))
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
