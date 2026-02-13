import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from '../database/schema/index.js';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class WaitlistRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(data: typeof schema.waitlist.$inferInsert) {
    const [result] = await this.db
      .insert(schema.waitlist)
      .values(data)
      .returning();
    return result;
  }

  async findAll() {
    return await this.db.query.waitlist.findMany({
      orderBy: (waitlist, { desc }) => [desc(waitlist.createdAt)],
    });
  }
  async count() {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.waitlist);
    return Number(result.count);
  }
}
