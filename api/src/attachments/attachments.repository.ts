import { Injectable, Inject } from '@nestjs/common';
import { eq, and, lt, isNull, isNotNull, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import { messageAttachments } from '../database/schema/index.js';

export interface CreateAttachmentData {
  messageId: string;
  accountId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  contentId?: string;
}

export interface UpdateAttachmentData {
  status?: 'pending' | 'ready' | 'failed' | 'deleted';
  checksum?: string;
  finalizedAt?: Date;
  deletedAt?: Date;
}

@Injectable()
export class AttachmentsRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  /**
   * Create a new attachment record with status = pending
   */
  async create(data: CreateAttachmentData) {
    const result = await this.db
      .insert(messageAttachments)
      .values({
        ...data,
        status: 'pending',
      })
      .returning();

    return result[0];
  }

  /**
   * Find attachment by ID (no ownership check)
   */
  async findById(id: string) {
    const result = await this.db
      .select()
      .from(messageAttachments)
      .where(eq(messageAttachments.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find attachment by ID with account ownership check
   */
  async findByAccountId(accountId: string, id: string) {
    const result = await this.db
      .select()
      .from(messageAttachments)
      .where(
        and(
          eq(messageAttachments.id, id),
          eq(messageAttachments.accountId, accountId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find all attachments for a message
   */
  async findByMessageId(messageId: string) {
    return this.db
      .select()
      .from(messageAttachments)
      .where(
        and(
          eq(messageAttachments.messageId, messageId),
          isNull(messageAttachments.deletedAt),
        ),
      )
      .orderBy(desc(messageAttachments.createdAt));
  }

  /**
   * Find all ready attachments for a message (for downloads)
   */
  async findReadyByMessageId(messageId: string) {
    return this.db
      .select()
      .from(messageAttachments)
      .where(
        and(
          eq(messageAttachments.messageId, messageId),
          eq(messageAttachments.status, 'ready'),
          isNull(messageAttachments.deletedAt),
        ),
      )
      .orderBy(desc(messageAttachments.createdAt));
  }

  /**
   * Update attachment record
   */
  async update(id: string, data: UpdateAttachmentData) {
    const result = await this.db
      .update(messageAttachments)
      .set(data)
      .where(eq(messageAttachments.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Mark attachment status as ready and set finalizedAt
   */
  async finalize(id: string, checksum?: string) {
    return this.update(id, {
      status: 'ready',
      checksum,
      finalizedAt: new Date(),
    });
  }

  /**
   * Soft delete an attachment
   */
  async softDelete(id: string) {
    return this.update(id, {
      deletedAt: new Date(),
    });
  }

  /**
   * Find stale pending attachments (upload started but never finished)
   * Used by cleanup jobs
   */
  async findStalePending(olderThanMinutes: number = 60) {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    return this.db
      .select()
      .from(messageAttachments)
      .where(
        and(
          eq(messageAttachments.status, 'pending'),
          lt(messageAttachments.createdAt, cutoff),
        ),
      );
  }

  /**
   * Find soft-deleted attachments ready for permanent deletion
   * Used by cleanup jobs
   */
  async findDeletedForCleanup(olderThanMinutes: number = 1440) {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    return this.db
      .select()
      .from(messageAttachments)
      .where(
        and(
          isNotNull(messageAttachments.deletedAt),
          lt(messageAttachments.deletedAt, cutoff),
        ),
      );
  }

  /**
   * Permanently delete attachment record
   * Only called after file is removed from storage
   */
  async hardDelete(id: string) {
    await this.db
      .delete(messageAttachments)
      .where(eq(messageAttachments.id, id));
  }

  /**
   * Mark attachment as failed
   */
  async markFailed(id: string) {
    return this.update(id, {
      status: 'failed',
    });
  }
}
