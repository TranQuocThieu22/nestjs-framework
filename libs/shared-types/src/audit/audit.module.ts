import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './audit-log.entity';
import { AuditSubscriber } from './audit.subscriber';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [AuditSubscriber],
  exports: [AuditSubscriber, TypeOrmModule],
})
export class AuditModule {}
