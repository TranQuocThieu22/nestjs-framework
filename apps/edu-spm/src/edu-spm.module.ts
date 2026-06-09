import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { SystemManagementModule } from '@app/system-management';
import { CoreModule, DatabaseModule } from '@app/core';
import { ActivityModule } from './modules/activity/activity.module';
import { HealthController } from './health/health.controller';
import { IamModule } from '@app/iam';

@Module({
  imports: [
    // Database connection for THIS specific microservice (SPM)
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        SPM_DB_NAME: Joi.string().required(),
        PORT: Joi.number().default(3002),
      }),
    }),
    DatabaseModule.forApp('spm'),
    CoreModule,
    SystemManagementModule,
    ActivityModule,
    IamModule,
  ],
  controllers: [HealthController],
})
export class EduSpmModule {}
