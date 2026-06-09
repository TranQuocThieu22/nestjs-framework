import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ClsModule, ClsMiddleware } from 'nestjs-cls';
import { KeycloakService } from './keycloak/keycloak.service';
import { AuditModule } from '@app/shared-types/audit/audit.module';
import { TenantProvisioningService } from './tenant/tenant-provisioning.service';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { TenantController } from './tenant/tenant.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantEntity } from './tenant/entities/tenant.entity';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
    }),
    AuditModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: 'postgres', // Master Database
        autoLoadEntities: true,
        synchronize: true, // Tự động tạo bảng TenantEntity
      }),
    }),
    TypeOrmModule.forFeature([TenantEntity]),
  ],
  controllers: [TenantController],
  providers: [KeycloakService, TenantProvisioningService],
  exports: [KeycloakService, TenantProvisioningService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware, TenantMiddleware).forRoutes('*');
  }
}
