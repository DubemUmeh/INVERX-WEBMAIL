import { Controller, Post, Body, UseGuards, Ip, Headers } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service.js';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { EmailThrottlerGuard } from '../common/guards/email-throttler.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } }) // 5 requests per hour per IP
  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
    @Body('idempotencyKey') idempotencyKey?: string,
  ) {
    return await this.passwordResetService.requestReset(email, idempotencyKey);
  }

  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPasswordRaw: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // Basic validation
    if (!email || !otp || !newPasswordRaw) {
      throw new Error('Missing fields');
    }

    // In real app, validate password complexity here

    return await this.passwordResetService.verifyAndReset(
      email,
      otp,
      newPasswordRaw,
      ip,
      userAgent,
    );
  }
}
