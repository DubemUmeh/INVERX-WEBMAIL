import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service.js';
import { AuditLogQueryDto } from './dto/index.js';
import { CurrentUser } from '../common/decorators/index.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { AccountGuard, RoleGuard } from '../common/guards/index.js';

@Controller('audit-logs')
@UseGuards(AccountGuard, RoleGuard)
@Roles('owner', 'admin')
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  getAuditLogs(
    @CurrentUser('accountId') accountId: string,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.auditLogsService.getAuditLogs(accountId, query);
  }
}
