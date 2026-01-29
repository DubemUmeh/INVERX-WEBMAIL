/**
 * SMTP Repository
 *
 * Database operations for SMTP configurations using Drizzle ORM.
 */

import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import * as schema from '../database/schema/index.js';

type SmtpConfigInsert = typeof schema.smtpConfigurations.$inferInsert;
type SmtpConfigSelect = typeof schema.smtpConfigurations.$inferSelect;

import { accountMembers } from '../database/schema/index.js';

@Injectable()
export class SmtpRepository {
  constructor(
    @Inject(DRIZZLE)
    private db: Database,
  ) {}

  /**
   * Find account ID for a user (returns first found account).
   */
  async findAccountIdByUserId(userId: string): Promise<string | undefined> {
    const result = await this.db
      .select({ accountId: accountMembers.accountId })
      .from(accountMembers)
      .where(eq(accountMembers.userId, userId))
      .limit(1);

    return result[0]?.accountId;
  }

  /**
   * Find all SMTP configurations for a user.
   */
  async findByUserId(userId: string): Promise<SmtpConfigSelect[]> {
    return this.db
      .select()
      .from(schema.smtpConfigurations)
      .where(eq(schema.smtpConfigurations.userId, userId))
      .orderBy(schema.smtpConfigurations.createdAt);
  }

  /**
   * Find a single SMTP configuration by ID and user.
   */
  async findById(
    id: string,
    userId: string,
  ): Promise<SmtpConfigSelect | undefined> {
    const results = await this.db
      .select()
      .from(schema.smtpConfigurations)
      .where(
        and(
          eq(schema.smtpConfigurations.id, id),
          eq(schema.smtpConfigurations.userId, userId),
        ),
      )
      .limit(1);

    return results[0];
  }

  /**
   * Find SMTP configuration by fromEmail for a user.
   */
  async findByFromEmail(
    fromEmail: string,
    userId: string,
  ): Promise<SmtpConfigSelect | undefined> {
    const results = await this.db
      .select()
      .from(schema.smtpConfigurations)
      .where(
        and(
          eq(schema.smtpConfigurations.fromEmail, fromEmail),
          eq(schema.smtpConfigurations.userId, userId),
        ),
      )
      .limit(1);

    return results[0];
  }

  /**
   * Find the default SMTP configuration for a user.
   */
  async findDefault(userId: string): Promise<SmtpConfigSelect | undefined> {
    const results = await this.db
      .select()
      .from(schema.smtpConfigurations)
      .where(
        and(
          eq(schema.smtpConfigurations.userId, userId),
          eq(schema.smtpConfigurations.isDefault, true),
        ),
      )
      .limit(1);

    return results[0];
  }

  /**
   * Create a new SMTP configuration.
   */
  async create(data: SmtpConfigInsert): Promise<SmtpConfigSelect> {
    const results = await this.db
      .insert(schema.smtpConfigurations)
      .values(data)
      .returning();

    return results[0];
  }

  /**
   * Update an existing SMTP configuration.
   */
  async update(
    id: string,
    userId: string,
    data: Partial<SmtpConfigInsert>,
  ): Promise<SmtpConfigSelect | undefined> {
    const results = await this.db
      .update(schema.smtpConfigurations)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(schema.smtpConfigurations.id, id),
          eq(schema.smtpConfigurations.userId, userId),
        ),
      )
      .returning();

    return results[0];
  }

  /**
   * Clear default flag for all user's SMTP configs.
   */
  async clearDefault(userId: string): Promise<void> {
    await this.db
      .update(schema.smtpConfigurations)
      .set({ isDefault: false })
      .where(eq(schema.smtpConfigurations.userId, userId));
  }

  /**
   * Delete an SMTP configuration.
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const results = await this.db
      .delete(schema.smtpConfigurations)
      .where(
        and(
          eq(schema.smtpConfigurations.id, id),
          eq(schema.smtpConfigurations.userId, userId),
        ),
      )
      .returning();

    return results.length > 0;
  }

  /**
   * Update test result for an SMTP configuration.
   */
  async updateTestResult(
    id: string,
    userId: string,
    result: 'success' | 'failed',
  ): Promise<void> {
    await this.db
      .update(schema.smtpConfigurations)
      .set({
        lastTestedAt: new Date(),
        lastTestResult: result,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.smtpConfigurations.id, id),
          eq(schema.smtpConfigurations.userId, userId),
        ),
      );
  }
}
