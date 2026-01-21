import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import { webhooks } from '../database/schema/index.js';

@Injectable()
export class WebhooksRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findAll(accountId: string) {
    return this.db
      .select({
        id: webhooks.id,
        url: webhooks.url,
        events: webhooks.events,
        status: webhooks.status,
        failureCount: webhooks.failureCount,
        lastDeliveryAt: webhooks.lastDeliveryAt,
        createdAt: webhooks.createdAt,
      })
      .from(webhooks)
      .where(eq(webhooks.accountId, accountId));
  }

  async findById(accountId: string, webhookId: string) {
    const result = await this.db
      .select()
      .from(webhooks)
      .where(and(eq(webhooks.id, webhookId), eq(webhooks.accountId, accountId)))
      .limit(1);

    return result[0] || null;
  }

  async create(data: {
    accountId: string;
    url: string;
    secret: string;
    events: string[];
  }) {
    const result = await this.db.insert(webhooks).values(data).returning();

    return result[0];
  }

  async delete(webhookId: string) {
    await this.db.delete(webhooks).where(eq(webhooks.id, webhookId));
  }
}
