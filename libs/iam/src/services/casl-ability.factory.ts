import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { UserPermissionEntity } from '../entities/user-permission.entity';
import type { ActiveUserData } from '../interfaces/active-user-data.interface';

export type AppAbility = MongoAbility;

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
    @InjectRepository(UserPermissionEntity)
    private readonly userPermissionRepo: Repository<UserPermissionEntity>,
  ) {}

  async createForUser(user: ActiveUserData): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    // 1. Tải quyền hạn từ Nhóm (kết hợp với tenantId để chống lộ dữ liệu chéo)
    // Giả sử user.roles chứa mảng mã Role (e.g. ['admin', 'lecturer'])
    if (user.roles && user.roles.length > 0) {
      const rolePermissions = await this.rolePermissionRepo.find({
        where: {
          tenantId: user.tenantId, // BẮT BUỘC để phân lập dữ liệu SaaS
          // Trong thực tế, bạn cần query RoleEntity theo user.roles
        },
        relations: { module: true, action: true, role: true },
      });

      rolePermissions.forEach((p) => {
        if (user.roles.includes(p.role.code)) {
          can(p.action.code, p.module.code);
        }
      });
    }

    // 2. Tải quyền hạn Cá nhân ghi đè
    const userPermissions = await this.userPermissionRepo.find({
      where: {
        userId: user.userId,
        tenantId: user.tenantId, // BẮT BUỘC
      },
      relations: { module: true, action: true },
    });

    userPermissions.forEach((p) => {
      if (p.isGranted) {
        can(p.action.code, p.module.code);
      }
      if (p.isRevoked) {
        cannot(p.action.code, p.module.code);
      }
    });

    return build();
  }
}
