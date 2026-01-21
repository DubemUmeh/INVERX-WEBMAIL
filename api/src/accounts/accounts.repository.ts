import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import { accounts, accountMembers, users } from '../database/schema/index.js';
import { UpdateAccountDto } from './dto/index.js';

@Injectable()
export class AccountsRepository {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select({
        account: accounts,
        membership: accountMembers,
      })
      .from(accountMembers)
      .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
      .where(eq(accountMembers.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  async update(id: string, data: UpdateAccountDto) {
    const result = await this.db
      .update(accounts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    return result[0] || null;
  }

  // Member operations
  async findMembers(accountId: string) {
    return this.db
      .select({
        id: accountMembers.id,
        userId: accountMembers.userId,
        role: accountMembers.role,
        createdAt: accountMembers.createdAt,
        email: users.email,
        fullName: users.fullName,
      })
      .from(accountMembers)
      .innerJoin(users, eq(users.id, accountMembers.userId))
      .where(eq(accountMembers.accountId, accountId));
  }

  async findMemberById(accountId: string, memberId: string) {
    const result = await this.db
      .select({
        id: accountMembers.id,
        userId: accountMembers.userId,
        role: accountMembers.role,
        createdAt: accountMembers.createdAt,
        email: users.email,
        fullName: users.fullName,
      })
      .from(accountMembers)
      .innerJoin(users, eq(users.id, accountMembers.userId))
      .where(
        and(
          eq(accountMembers.accountId, accountId),
          eq(accountMembers.id, memberId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async addMember(accountId: string, userId: string, role: string = 'member') {
    const result = await this.db
      .insert(accountMembers)
      .values({
        accountId,
        userId,
        role: role as 'owner' | 'admin' | 'member',
      })
      .returning();

    return result[0];
  }

  async updateMember(memberId: string, role: string) {
    const result = await this.db
      .update(accountMembers)
      .set({ role: role as 'owner' | 'admin' | 'member' })
      .where(eq(accountMembers.id, memberId))
      .returning();

    return result[0] || null;
  }

  async removeMember(memberId: string) {
    await this.db.delete(accountMembers).where(eq(accountMembers.id, memberId));
  }

  async findUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }
}
