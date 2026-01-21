import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { auth } from '../../lib/auth.js';
import { db } from '../../database/drizzle.js';
import { accountMembers, accounts } from '../../database/schema/index.js';
import { eq } from 'drizzle-orm';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  accountId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      console.log(
        `[AuthGuard] Route is public: ${request.method} ${request.url}`,
      );
      return true;
    }

    // 1. Try Better-Auth Session (from Cookies or Authorization Header)
    try {
      // Better-Auth expects a Headers object or a plain object with specific properties
      // Express headers are already a plain object, but better-auth server utilities
      // usually prefer the standard Headers API if available.
      let headers: any = request.headers;

      // Try to get session using better-auth api
      console.log(
        `[AuthGuard] Checking session for ${request.method} ${request.url}`,
      );
      const session = await auth.api.getSession({
        headers: headers,
      });

      if (session) {
        console.log(`[AuthGuard] Session found for ${session.user.email}`);
        // Find the user's account ID (defaulting to the first one found)
        let member = await db.query.accountMembers.findFirst({
          where: eq(accountMembers.userId, session.user.id),
        });

        // Fallback: If no membership found, check if they own an account
        if (!member) {
          console.log(
            `[AuthGuard] No membership found for user ${session.user.id}, trying fallback...`,
          );
          try {
            const ownedAccount = await db.query.accounts.findFirst({
              where: eq(accounts.ownerId, session.user.id),
            });

            if (ownedAccount) {
              console.log(
                `[AuthGuard] Found owned account ${ownedAccount.id}, linking user...`,
              );
              // Use onConflictDoNothing or catch error to handle parallel requests
              try {
                await db
                  .insert(accountMembers)
                  .values({
                    accountId: ownedAccount.id,
                    userId: session.user.id,
                    role: 'owner',
                  })
                  .onConflictDoNothing();
              } catch (e) {
                /* ignore */
              }
              member = { accountId: ownedAccount.id } as any;
            } else {
              // TRULY NO ACCOUNT: Create one on the fly (Self-healing)
              console.log(
                `[AuthGuard] Auto-provisioning account for user: ${session.user.email}`,
              );
              try {
                const [newAccount] = await db
                  .insert(accounts)
                  .values({
                    name: `${session.user.name || 'My'}'s Account`,
                    slug: `${String(session.user.name || 'personal')
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        '-',
                      )}-${session.user.id.slice(0, 8)}-${Math.random().toString(36).substring(2, 6)}`,
                    ownerId: session.user.id,
                  })
                  .returning();

                await db
                  .insert(accountMembers)
                  .values({
                    accountId: newAccount.id,
                    userId: session.user.id,
                    role: 'owner',
                  })
                  .onConflictDoNothing();

                member = { accountId: newAccount.id } as any;
              } catch (insertError) {
                console.warn(
                  '[AuthGuard] Provisioning collision, retrying lookup...',
                );
                // If parallel request created it, find it now
                const retryAccount = await db.query.accounts.findFirst({
                  where: eq(accounts.ownerId, session.user.id),
                });
                if (retryAccount) {
                  member = { accountId: retryAccount.id } as any;
                  // Ensure membership exists
                  await db
                    .insert(accountMembers)
                    .values({
                      accountId: retryAccount.id,
                      userId: session.user.id,
                      role: 'owner',
                    })
                    .onConflictDoNothing()
                    .catch(() => {});
                }
              }
            }
          } catch (provisionError) {
            console.error('[AuthGuard] Provisioning failed:', provisionError);
          }
        }

        if (!member?.accountId) {
          console.warn(
            `[AuthGuard] CRITICAL: User ${session.user.id} HAS NO ACCOUNT after provisioning!`,
          );
          throw new UnauthorizedException(
            'No active account found for this user. Please ensure your account is set up.',
          );
        }

        console.log(`[AuthGuard] Final Account ID: ${member.accountId}`);

        // Add user to request
        (request as any).user = {
          ...session.user,
          sub: session.user.id,
          accountId: member.accountId,
        };

        // Populate context
        request.context = {
          ...request.context,
          userId: session.user.id,
          accountId: member.accountId,
        };

        console.log(
          `[AuthGuard] Success! User set with accountId: ${(request as any).user.accountId}`,
        );
        return true;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('[AuthGuard] Better-Auth session error:', error);
    }

    console.log('[AuthGuard] Falling back to JWT.');

    // 2. Try JWT Fallback (Legacy or API Keys)
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.warn('[AuthGuard] No token found in headers.');
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (!payload.accountId) {
        console.warn(
          `[AuthGuard] JWT payload for user ${payload.sub} missing accountId.`,
        );
        // Try to find account for this user as a fallback even for JWT
        const member = await db.query.accountMembers.findFirst({
          where: eq(accountMembers.userId, payload.sub),
        });
        if (member) {
          payload.accountId = member.accountId;
        } else {
          throw new UnauthorizedException('Missing account context in token');
        }
      }

      console.log(
        `[AuthGuard] Valid JWT found for user: ${payload.email} (Account: ${payload.accountId})`,
      );

      // Attach user info to request context
      request.context = {
        ...request.context,
        userId: payload.sub,
        accountId: payload.accountId,
      };

      // Attach full user payload to request for use in controllers
      (request as any).user = payload;
      return true;
    } catch (err) {
      console.error('[AuthGuard] JWT verification failed:', err.message);
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
