import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionEntity } from './entities/action.entity';
import { ModuleEntity } from './entities/module.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserPermissionEntity } from './entities/user-permission.entity';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CaslAbilityFactory } from './services/casl-ability.factory';
import { PoliciesGuard } from './guards/policies.guard';

import { TenantEntityRegistry } from '@app/core/tenant/tenant-entity.registry';

TenantEntityRegistry.register([ActionEntity, ModuleEntity, RolePermissionEntity, RoleEntity, UserPermissionEntity]);

@Module({
  providers: [JwtStrategy, JwtAuthGuard, CaslAbilityFactory, PoliciesGuard],
  exports: [JwtAuthGuard, CaslAbilityFactory, PoliciesGuard],
})
export class IamModule {}
