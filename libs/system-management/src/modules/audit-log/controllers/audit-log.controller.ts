import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Paginate, ApiPaginationQuery } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { ClsService } from 'nestjs-cls';
import { JwtAuthGuard } from '@app/iam';
import { AuditLogService, auditLogPaginateConfig } from '../services/audit-log.service';

@ApiTags('System Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'system/audit-logs',
  version: '1',
})
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách nhật ký hệ thống (Audit Logs)',
    description: 'Hỗ trợ phân trang, lọc theo entityId, action...',
  })
  @ApiPaginationQuery(auditLogPaginateConfig)
  async findAll(@Paginate() query: PaginateQuery) {
    const user = this.clsService.get('user');
    return this.auditLogService.findAllPaginated(user.tenantId, query);
  }
}
