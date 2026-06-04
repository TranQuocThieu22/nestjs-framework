import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { KeycloakService } from '@app/core';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private keycloakService: KeycloakService,
  ) {}

  async createUser(tenantId: string, createUserDto: CreateUserDto) {
    try {
      // 1. Tạo User trên Keycloak trước (Tạo username, email, mật khẩu mặc định)
      // Tách fullname thành firstName, lastName tạm thời
      const nameParts = createUserDto.fullName.split(' ');
      const lastName = nameParts.pop() || '';
      const firstName = nameParts.join(' ') || createUserDto.fullName;

      const keycloakUserId = await this.keycloakService.createUser(
        tenantId,
        createUserDto.employeeCode, // Dùng employeeCode làm username đăng nhập
        createUserDto.email,
        firstName,
        lastName,
      );

      // 2. Lưu các trường nghiệp vụ tuỳ chỉnh vào PostgreSQL
      const userEntity = this.userRepository.create({
        id: keycloakUserId, // Bắt buộc trùng ID với Keycloak
        tenantId: tenantId,
        employeeCode: createUserDto.employeeCode,
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        departmentId: createUserDto.departmentId,
      });

      const savedUser = await this.userRepository.save(userEntity);

      // 3. TODO: Nếu có roleCode, gọi IamService để gắn quyền (UserPermissionEntity)

      return savedUser;
    } catch (error: any) {
      console.error('Lỗi khi tạo user:', error?.response?.data || error);
      const errorMessage = error?.response?.data?.errorMessage || error?.message || 'Lỗi không xác định từ Keycloak';
      throw new InternalServerErrorException(`Lỗi tạo user: ${errorMessage}`);
    }
  }

  async getAccounts(tenantId: string) {
    return this.userRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
