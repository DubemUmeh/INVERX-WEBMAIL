import {
  Module,
  NestModule,
  MiddlewareConsumer,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

// Database
import { DatabaseModule } from './database/database.module.js';

// Common
import { RequestContextMiddleware } from './common/middleware/request-context.middleware.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor.js';

// Feature Modules
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { AccountsModule } from './accounts/accounts.module.js';
import { MailModule } from './mail/mail.module.js';
import { DomainsModule } from './domains/domains.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { AttachmentsModule } from './attachments/attachments.module.js';
import { WaitlistModule } from './waitlist/waitlist.module.js';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    AccountsModule,
    MailModule,
    DomainsModule,
    SettingsModule,
    ApiKeysModule,
    WebhooksModule,
    AuditLogsModule,
    AttachmentsModule,
    WaitlistModule,
  ],
  providers: [
    // Global validation pipe
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },

    // Global auth guard
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    // Global response transformer
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
