import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository.js';
import { AuditLogQueryDto } from './dto/index.js';

@Injectable()
export class AuditLogsService {
  constructor(private auditLogsRepository: AuditLogsRepository) {}

  async getAuditLogs(accountId: string, query: AuditLogQueryDto) {
    const logs = await this.auditLogsRepository.findAll(accountId, query);

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt,
      user: log.userId
        ? {
            id: log.userId,
            email: log.userEmail,
            name: log.userName,
          }
        : null,
    }));
  }
}
