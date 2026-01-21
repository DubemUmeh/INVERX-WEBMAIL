import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DRIZZLE } from '../../database/database.module.js';
import type { Database } from '../../database/drizzle.js';
import { auditLogs } from '../../database/schema/index.js';

export const AUDIT_ACTION_KEY = 'auditAction';

export interface AuditMetadata {
  action: string;
  resourceType: string;
  getResourceId?: (request: Request, response: any) => string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @Inject(DRIZZLE) private db: Database,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_ACTION_KEY,
      context.getHandler(),
    );

    // No audit metadata, skip logging
    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const { userId, accountId } = request.context || {};

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const resourceId = auditMetadata.getResourceId
            ? auditMetadata.getResourceId(request, response)
            : request.params.id || response?.id || 'unknown';

          await this.db.insert(auditLogs).values({
            accountId: accountId!,
            userId: userId,
            action: auditMetadata.action,
            resourceType: auditMetadata.resourceType,
            resourceId: String(resourceId),
            metadata: {
              method: request.method,
              path: request.path,
              body: this.sanitizeBody(request.body),
            },
            ipAddress: this.getClientIp(request),
            userAgent: request.headers['user-agent'],
          });
        } catch (error) {
          // Log audit failure but don't break the request
          console.error('Failed to write audit log:', error);
        }
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;

    // Remove sensitive fields
    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'passwordHash',
      'currentPassword',
      'newPassword',
      'secret',
      'token',
      'apiKey',
    ];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }
}
