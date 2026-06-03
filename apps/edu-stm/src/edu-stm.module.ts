import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SystemManagementModule } from '@app/system-management';
import { EduStmController } from './edu-stm.controller';
import { EduStmService } from './edu-stm.service';

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
        database: configService.get<string>('STM_DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    SystemManagementModule,
  ],
  controllers: [EduStmController],
  providers: [EduStmService],
})
export class EduStmModule {}
