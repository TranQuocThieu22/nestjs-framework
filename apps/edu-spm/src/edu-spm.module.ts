import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { SystemManagementModule } from '@app/system-management';
import { CoreModule } from '@app/core';
import { ActivityModule } from './modules/activity/activity.module';
import { EduSpmController } from './edu-spm.controller';
import { EduSpmService } from './edu-spm.service';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('SPM_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Only for development
      }),
    }),
    CoreModule,
    SystemManagementModule,
    ActivityModule,
  ],
  controllers: [EduSpmController],
  providers: [EduSpmService],
})
export class EduSpmModule {}
