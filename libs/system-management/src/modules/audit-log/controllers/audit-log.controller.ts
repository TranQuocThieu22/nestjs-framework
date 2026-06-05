import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Paginate, PaginateQuery, ApiOkPaginatedResponse } from 'nestjs-paginate';
import { ClsService } from 'nestjs-cls';
import { JwtAuthGuard } from '@app/iam';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogEntity } from '@app/shared-types';

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
  @ApiOkPaginatedResponse(AuditLogEntity, {
    description: 'Danh sách nhật ký hệ thống',
  })
  async findAll(@Paginate() query: PaginateQuery) {
    const user = this.clsService.get('user');
    return this.auditLogService.findAllPaginated(user.tenantId, query);
  }
}
