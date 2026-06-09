import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  TenantConnectionService,
  APP_NAME_TOKEN,
} from '../tenant/tenant-connection.service';

/**
 * Cấu hình kết nối Postgres dùng chung cho mọi app trong monorepo.
 * Hỗ trợ Multi-tenant động dựa trên Request context (tenantId).
 *
 * @example
 *   imports: [DatabaseModule.forApp('admission')]
 */
@Global()
@Module({})
export class DatabaseModule {
  static forApp(appName: string): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: APP_NAME_TOKEN,
          useValue: appName,
        },
        TenantConnectionService,
      ],
      exports: [TenantConnectionService],
    };
  }
}
