import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { KeycloakService } from '@app/core';
import { TenantConnectionService } from '@app/core';
import type { KeycloakError } from '@app/core';

@Injectable()
export class AccountService {
  constructor(
    private readonly tenantConnectionService: TenantConnectionService,
    private readonly keycloakService: KeycloakService,
  ) {}

  private async getUserRepository() {
    return this.tenantConnectionService.getRepository(UserEntity);
  }

  async createUser(tenantId: string, createUserDto: CreateUserDto) {
    try {
      // 1. Tạo User trên Keycloak trước
      const nameParts = createUserDto.fullName.split(' ');
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ') || createUserDto.fullName;

      const keycloakUserId = await this.keycloakService.createUser(
        tenantId,
        createUserDto.employeeCode,
        createUserDto.email,
        firstName,
        lastName,
      );

      // 2. Lưu các trường nghiệp vụ tuỳ chỉnh vào PostgreSQL
      const repo = await this.getUserRepository();
      const userEntity = repo.create({
        id: keycloakUserId,
        tenantId: tenantId,
        employeeCode: createUserDto.employeeCode,
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        departmentId: createUserDto.departmentId,
      });

      const savedUser = await repo.save(userEntity);
      return savedUser;
    } catch (error: unknown) {
      const err = error as KeycloakError;
      console.error('Lỗi khi tạo user:', err?.response?.data ?? error);
      const errorMessage =
        err?.response?.data?.errorMessage ??
        err?.message ??
        'Lỗi không xác định từ Keycloak';
      throw new InternalServerErrorException(`Lỗi tạo user: ${errorMessage}`);
    }
  }

  async getAccounts(tenantId: string) {
    const repo = await this.getUserRepository();
    return repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
