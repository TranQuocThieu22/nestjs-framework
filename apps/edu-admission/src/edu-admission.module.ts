import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SystemManagementModule } from '@app/system-management';
import { CoreModule, DatabaseModule } from '@app/core';
import { IamModule } from '@app/iam';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forApp('ADMISSION_DB_NAME'),
    CoreModule,
    IamModule,
    SystemManagementModule,
  ],
  controllers: [HealthController],
})
export class EduAdmissionModule {}
