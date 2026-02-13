import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BetterAuthController } from './better-auth.controller.js';
import { AdminAuthController } from './admin-auth.controller.js';
import { AuthController } from './auth.controller.js';
import { PasswordResetService } from './password-reset.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

// Helper to parse time string to seconds
const parseTimeToSeconds = (time: string, defaultSeconds: number): number => {
  if (!time) return defaultSeconds;
  const match = time.match(/^(\d+)([smhd])$/);
  if (!match) return defaultSeconds;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return defaultSeconds;
  }
};

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = parseTimeToSeconds(
          configService.get<string>('JWT_EXPIRES_IN', '15m'),
          900, // 15 minutes default
        );
        return {
          secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    NotificationsModule,
  ],
  controllers: [AdminAuthController, BetterAuthController, AuthController],
  providers: [PasswordResetService],
  exports: [JwtModule],
})
export class AuthModule {}
