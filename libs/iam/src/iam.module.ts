import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionEntity } from './entities/action.entity';
import { ModuleEntity } from './entities/module.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserPermissionEntity } from './entities/user-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActionEntity,
      ModuleEntity,
      RolePermissionEntity,
      RoleEntity,
      UserPermissionEntity,
    ]),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class IamModule {}
