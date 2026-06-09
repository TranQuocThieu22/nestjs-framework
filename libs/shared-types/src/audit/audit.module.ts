import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './audit-log.entity';
import { AuditSubscriber } from './audit.subscriber';

@Global()
@Module({
  providers: [AuditSubscriber],
  exports: [AuditSubscriber],
})
export class AuditModule {}
