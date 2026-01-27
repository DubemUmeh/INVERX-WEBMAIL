import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc, or, ilike, ne, inArray, not, sql } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import {
  messages,
  userMessages,
  messageAttachments,
} from '../database/schema/index.js';

@Injectable()
export class MailRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findInbox(
    userId: string,
    userEmails: string[],
    options: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 20, search } = options;
    const offset = (page - 1) * limit;

    // Create a SQL array literal for the user emails safely
    // Drizzle will parameterize this if passed correctly, but for array literal in SQL operator we might need care.
    // 'ARRAY['a','b']'
    const emailsSql = sql`ARRAY[${sql.join(userEmails, sql`, `)}]::text[]`;

    let query = this.db
      .select({
        userMessage: userMessages,
        message: messages,
      })
      .from(userMessages)
      .innerJoin(messages, eq(messages.id, userMessages.messageId))
      .where(
        and(
          eq(userMessages.userId, userId),
          eq(userMessages.isDeleted, false),
          eq(userMessages.isArchived, false),
          eq(userMessages.isDraft, false),
          // Inbox = Messages where user is in To, CC, or BCC
          or(
            sql`${messages.toRecipients} && ${emailsSql}`,
            sql`${messages.ccRecipients} && ${emailsSql}`,
            sql`${messages.bccRecipients} && ${emailsSql}`,
          ),
        ),
      )
      .orderBy(desc(messages.sentAt))
      .limit(limit)
      .offset(offset);

    return query;
  }

  async findSent(
    userId: string,
    userEmails: string[],
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return this.db
      .select({
        userMessage: userMessages,
        message: messages,
      })
      .from(userMessages)
      .innerJoin(messages, eq(messages.id, userMessages.messageId))
      .where(
        and(
          eq(userMessages.userId, userId),
          eq(userMessages.isDeleted, false),
          inArray(messages.fromEmail, userEmails),
        ),
      )
      .orderBy(desc(messages.sentAt))
      .limit(limit)
      .offset(offset);
  }

  async findDrafts(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return this.db
      .select({
        userMessage: userMessages,
        message: messages,
      })
      .from(userMessages)
      .innerJoin(messages, eq(messages.id, userMessages.messageId))
      .where(
        and(
          eq(userMessages.userId, userId),
          eq(userMessages.isDraft, true),
          eq(userMessages.isDeleted, false),
        ),
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findArchive(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return this.db
      .select({
        userMessage: userMessages,
        message: messages,
      })
      .from(userMessages)
      .innerJoin(messages, eq(messages.id, userMessages.messageId))
      .where(
        and(
          eq(userMessages.userId, userId),
          eq(userMessages.isArchived, true),
          eq(userMessages.isDeleted, false),
        ),
      )
      .orderBy(desc(messages.sentAt))
      .limit(limit)
      .offset(offset);
  }

  async findById(userId: string, messageId: string) {
    const result = await this.db
      .select({
        userMessage: userMessages,
        message: messages,
      })
      .from(userMessages)
      .innerJoin(messages, eq(messages.id, userMessages.messageId))
      .where(
        and(
          eq(userMessages.userId, userId),
          eq(userMessages.messageId, messageId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async findAttachments(messageId: string) {
    return this.db
      .select()
      .from(messageAttachments)
      .where(eq(messageAttachments.messageId, messageId));
  }

  async createMessage(data: {
    accountId?: string;
    subject?: string;
    bodyText?: string;
    bodyHtml?: string;
    fromEmail: string;
    fromName?: string;
    toRecipients?: string[];
    ccRecipients?: string[];
    bccRecipients?: string[];
    replyTo?: string;
  }) {
    const result = await this.db
      .insert(messages)
      .values({
        ...data,
        snippet: data.bodyText?.substring(0, 200),
      })
      .returning();

    return result[0];
  }

  async createUserMessage(data: {
    userId: string;
    messageId: string;
    isDraft?: boolean;
    mailboxId?: string;
  }) {
    const result = await this.db.insert(userMessages).values(data).returning();

    return result[0];
  }

  async updateMessage(
    messageId: string,
    data: Partial<{
      messageId: string; // SES message ID
      subject: string;
      bodyText: string;
      bodyHtml: string;
      sentAt: Date;
    }>,
  ) {
    const result = await this.db
      .update(messages)
      .set(data)
      .where(eq(messages.id, messageId))
      .returning();

    return result[0] || null;
  }

  async updateUserMessage(
    userId: string,
    messageId: string,
    data: Partial<{
      isRead: boolean;
      isStarred: boolean;
      isArchived: boolean;
      isDeleted: boolean;
      mailboxId: string;
    }>,
  ) {
    const result = await this.db
      .update(userMessages)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(userMessages.userId, userId),
          eq(userMessages.messageId, messageId),
        ),
      )
      .returning();

    return result[0] || null;
  }

  async deleteMessage(userId: string, messageId: string) {
    return this.updateUserMessage(userId, messageId, { isDeleted: true });
  }
}
