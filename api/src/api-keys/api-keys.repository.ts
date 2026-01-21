import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import { apiKeys } from '../database/schema/index.js';

@Injectable()
export class ApiKeysRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findAll(accountId: string) {
    return this.db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        status: apiKeys.status,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.accountId, accountId));
  }

  async findById(accountId: string, keyId: string) {
    const result = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.accountId, accountId)))
      .limit(1);

    return result[0] || null;
  }

  async create(data: {
    accountId: string;
    createdBy: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
    scopes?: string[];
    expiresAt?: Date;
  }) {
    const result = await this.db.insert(apiKeys).values(data).returning();

    return result[0];
  }

  async delete(keyId: string) {
    await this.db.delete(apiKeys).where(eq(apiKeys.id, keyId));
  }

  async updateLastUsed(keyId: string) {
    await this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyId));
  }
}
