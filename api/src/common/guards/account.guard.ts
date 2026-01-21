import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module.js';
import type { Database } from '../../database/drizzle.js';
import { accountMembers, accounts } from '../../database/schema/index.js';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;
    const userId = request.context?.userId || user?.sub || user?.id;
    const accountId =
      request.params.accountId ||
      request.body?.accountId ||
      request.context?.accountId ||
      user?.accountId;

    console.log(
      `[AccountGuard] User: ${userId}, Account: ${accountId}, URL: ${request.url}`,
    );

    if (!userId) {
      console.warn('[AccountGuard] User not authenticated in context');
      throw new ForbiddenException('User not authenticated');
    }

    if (!accountId) {
      console.log(
        '[AccountGuard] No account context found, allowing request to proceed',
      );
      // No account context required for this route
      return true;
    }

    // Check if user is a member of the account
    const membership = await this.db
      .select({
        id: accountMembers.id,
        role: accountMembers.role,
        accountName: accounts.name,
      })
      .from(accountMembers)
      .innerJoin(accounts, eq(accounts.id, accountMembers.accountId))
      .where(
        and(
          eq(accountMembers.accountId, accountId),
          eq(accountMembers.userId, userId),
        ),
      )
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenException('You do not have access to this account');
    }

    // Attach account info to request
    (request as any).accountMember = {
      accountId,
      role: membership[0].role,
      accountName: membership[0].accountName,
    };

    return true;
  }
}
