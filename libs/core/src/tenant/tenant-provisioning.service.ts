import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { KeycloakService } from '../keycloak/keycloak.service';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    private readonly keycloakService: KeycloakService,
  ) {}

  async findAll() {
    return this.tenantRepo.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Khởi tạo Database cho một Tenant mới, và tạo schema cho các ứng dụng (admission, spm).
   */
  async provisionTenant(
    dto: CreateTenantDto,
    apps: string[] = ['admission', 'spm'],
  ): Promise<TenantEntity> {
    const tenantId = dto.code;
    const dbName = `db_${tenantId}`;

    // Kiểm tra Master DB xem đã có code này chưa
    const existing = await this.tenantRepo.findOne({ where: { code: tenantId } });
    if (existing) {
      throw new ConflictException(`Tenant với mã ${tenantId} đã tồn tại trong hệ thống.`);
    }

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

    // 3. Lưu thông tin vào Master DB
    const newTenant = this.tenantRepo.create(dto);
    const savedTenant = await this.tenantRepo.save(newTenant);
    this.logger.log(`Tenant metadata for ${tenantId} saved to Master DB.`);

    // 4. Tạo Realm trên Keycloak
    try {
      this.logger.log(`Provisioning Keycloak Realm for tenant ${tenantId}...`);
      await this.keycloakService.createRealmAndClient(tenantId, dto.name);
      this.logger.log(`Keycloak Realm ${tenantId} created successfully.`);
    } catch (error: any) {
      this.logger.error(`Failed to create Keycloak Realm for ${tenantId}: ${error.message}`);
      // Không throw error để tránh rollback việc tạo Database nếu Keycloak lỗi (hoặc đã tồn tại)
    }

    return savedTenant;
  }

  /**
   * Xóa một Tenant khỏi hệ thống.
   * @param force Nếu true, xóa vật lý Database và Realm. Nếu false, chỉ soft delete.
   */
  async deleteTenant(code: string, force: boolean = false): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { code } });
    if (!tenant) {
      throw new NotFoundException(`Tenant với mã ${code} không tồn tại.`);
    }

    const dbName = `db_${code}`;

    if (force) {
      this.logger.log(`Performing HARD delete for tenant ${code}...`);
      
      // 1. Xóa Realm trên Keycloak
      await this.keycloakService.deleteRealm(code);
      
      // 2. Xóa Database vật lý trên Postgres
      const client = new Client({
        host: this.configService.get<string>('DB_HOST')!,
        port: this.configService.get<number>('DB_PORT', 5432),
        user: this.configService.get<string>('DB_USERNAME')!,
        password: this.configService.get<string>('DB_PASSWORD')!,
        database: 'postgres',
      });

      try {
        await client.connect();
        // Ngắt kết nối các session đang mở vào DB này
        await client.query(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = $1
            AND pid <> pg_backend_pid();
        `, [dbName]);

        // Xóa Database
        await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
        this.logger.log(`Database ${dbName} dropped successfully.`);
      } catch (error: any) {
        this.logger.error(`Error dropping database ${dbName}: ${error.message}`);
        // Có thể tiếp tục xóa Master Record dù drop DB lỗi (ví dụ DB không tồn tại)
      } finally {
        await client.end();
      }

      // 3. Hard Delete khỏi Master DB
      await this.tenantRepo.delete(tenant.id);
      this.logger.log(`Tenant ${code} hard deleted from Master DB.`);
    } else {
      this.logger.log(`Performing SOFT delete for tenant ${code}...`);
      
      // 1. Vô hiệu hóa Realm trên Keycloak
      await this.keycloakService.disableRealm(code);
      
      // 2. Cập nhật trạng thái và Soft Delete trong Master DB
      tenant.status = 'inactive';
      await this.tenantRepo.save(tenant);
      await this.tenantRepo.softRemove(tenant);
      
      this.logger.log(`Tenant ${code} soft deleted successfully.`);
    }
  }
}
