import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SystemManagementModule } from '@app/system-management';
import { EduAdmissionController } from './edu-admission.controller';
import { EduAdmissionService } from './edu-admission.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('ADMISSION_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    SystemManagementModule,
  ],
  controllers: [EduAdmissionController],
  providers: [EduAdmissionService],
})
export class EduAdmissionModule {}
