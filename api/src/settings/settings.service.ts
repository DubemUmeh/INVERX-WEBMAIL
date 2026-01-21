import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../database/database.module.js';
import type { Database } from '../database/drizzle.js';
import {
  users,
  apiKeys,
  auditLogs,
  authAccounts,
} from '../database/schema/index.js';
import { UpdateProfileDto, UpdateSecurityDto } from './dto/index.js';

@Injectable()
export class SettingsService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async getProfile(userId: string) {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        themePreference: users.themePreference,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const result = await this.db
      .update(users)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        themePreference: users.themePreference,
      });

    return result[0];
  }

  async getSecurity(userId: string) {
    const result = await this.db
      .select({
        email: users.email,
        lastLoginAt: users.lastLoginAt,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get active API keys count
    const apiKeysResult = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.createdBy, userId));

    // Get recent security events from audit logs
    const recentActivity = await this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .limit(5);

    return {
      ...result[0],
      activeApiKeys: apiKeysResult.length,
      twoFactorEnabled: false, // TODO: Implement 2FA
      recentActivity: recentActivity.map((log) => ({
        action: log.action,
        createdAt: log.createdAt,
        ipAddress: log.ipAddress,
      })),
    };
  }

  async updateSecurity(userId: string, dto: UpdateSecurityDto) {
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Current password is required to change password',
        );
      }

      // Get user's credential account from auth_accounts (better-auth stores passwords here)
      const account = await this.db
        .select()
        .from(authAccounts)
        .where(eq(authAccounts.userId, userId))
        .limit(1);

      if (!account[0] || !account[0].password) {
        throw new BadRequestException('No password set for this account');
      }

      // Verify current password against auth_accounts.password
      const isValid = await bcrypt.compare(
        dto.currentPassword,
        account[0].password,
      );
      if (!isValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Update password in auth_accounts
      const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
      await this.db
        .update(authAccounts)
        .set({
          password: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(authAccounts.userId, userId));

      return { message: 'Password updated successfully' };
    }

    // TODO: Handle 2FA toggle
    if (dto.twoFactorEnabled !== undefined) {
      return { message: '2FA settings updated' };
    }

    return { message: 'Security settings updated' };
  }
}
