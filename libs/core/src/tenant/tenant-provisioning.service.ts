import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Khởi tạo Database cho một Tenant mới, và tạo schema cho các ứng dụng (admission, spm).
   */
  async provisionTenant(
    tenantId: string,
    apps: string[] = ['admission', 'spm'],
  ): Promise<void> {
    const dbName = `db_${tenantId}`;

    // Kết nối vào database mặc định 'postgres' để có quyền tạo DB
    const client = new Client({
      host: this.configService.get<string>('DB_HOST')!,
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USERNAME')!,
      password: this.configService.get<string>('DB_PASSWORD')!,
      database: 'postgres',
    });

    try {
      await client.connect();

      // 1. Kiểm tra xem DB đã tồn tại chưa
      const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
      const checkRes = await client.query(checkDbQuery, [dbName]);

      if (checkRes.rowCount === 0) {
        this.logger.log(
          `Creating database ${dbName} for tenant ${tenantId}...`,
        );
        // Không thể dùng parameters cho CREATE DATABASE, phải cẩn thận SQL Injection (tenantId phải được validate trước)
        // Đảm bảo tenantId chỉ chứa chữ và số
        if (!/^[a-zA-Z0-9_]+$/.test(tenantId)) {
          throw new Error('Invalid tenantId format');
        }
        await client.query(`CREATE DATABASE ${dbName}`);
        this.logger.log(`Database ${dbName} created successfully.`);
      } else {
        this.logger.log(`Database ${dbName} already exists.`);
      }
    } catch (error) {
      this.logger.error(`Error creating database ${dbName}`, error);
      throw error;
    } finally {
      await client.end();
    }

    // 2. Kết nối vào DB vừa tạo để tạo các schema
    const tenantDbClient = new Client({
      host: this.configService.get<string>('DB_HOST')!,
      port: this.configService.get<number>('DB_PORT', 5432),
      user: this.configService.get<string>('DB_USERNAME')!,
      password: this.configService.get<string>('DB_PASSWORD')!,
      database: dbName,
    });

    try {
      await tenantDbClient.connect();
      for (const app of apps) {
        if (!/^[a-zA-Z0-9_]+$/.test(app)) {
          continue;
        }
        this.logger.log(`Ensuring schema '${app}' exists in ${dbName}...`);
        await tenantDbClient.query(`CREATE SCHEMA IF NOT EXISTS "${app}"`);
      }
      this.logger.log(
        `Provisioning for tenant ${tenantId} completed successfully.`,
      );
    } catch (error) {
      this.logger.error(`Error creating schemas in ${dbName}`, error);
      throw error;
    } finally {
      await tenantDbClient.end();
    }
  }
}
