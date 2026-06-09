import { Module } from '@nestjs/common';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditLogService } from './services/audit-log.service';

import { TenantEntityRegistry } from '@app/core/tenant/tenant-entity.registry';
import { AuditLogEntity } from '@app/shared-types/audit/audit-log.entity';

TenantEntityRegistry.register([AuditLogEntity]);

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
