import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export const APP_NAME_TOKEN = 'APP_NAME';

@Injectable({ scope: Scope.REQUEST })
export class TenantConnectionService {
  private static dataSources: Map<string, DataSource> = new Map();

  constructor(
    private readonly cls: ClsService,
    private readonly configService: ConfigService,
    @Inject(APP_NAME_TOKEN) private readonly appName: string,
  ) {}

  /**
   * Lấy DataSource hiện tại dựa trên tenantId và appName.
   */
  async getDataSource(): Promise<DataSource> {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new Error('Tenant ID is missing from request context.');
    }

    const dataSourceKey = `${tenantId}_${this.appName}`;

    if (TenantConnectionService.dataSources.has(dataSourceKey)) {
      const existingDataSource =
        TenantConnectionService.dataSources.get(dataSourceKey);
      if (existingDataSource?.isInitialized) {
        return existingDataSource;
      }
    }

    // Nếu chưa có, tiến hành tạo mới connection
    const dbName = `db_${tenantId}`;

    const dataSource = new DataSource({
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST')!,
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME')!,
      password: this.configService.get<string>('DB_PASSWORD')!,
      database: dbName,
      schema: this.appName, // Cách 1: schema per app
      entities: [
        __dirname + '/../../**/*.entity{.ts,.js}',
        __dirname + '/../../../**/*.entity{.ts,.js}',
      ],
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production', // Chú ý: trong production nên false
    });

    await dataSource.initialize();
    TenantConnectionService.dataSources.set(dataSourceKey, dataSource);

    return dataSource;
  }

  /**
   * Hàm helper để lấy Repository nhanh chóng.
   */
  async getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
  ): Promise<Repository<Entity>> {
    const dataSource = await this.getDataSource();
    return dataSource.getRepository(target);
  }
}
