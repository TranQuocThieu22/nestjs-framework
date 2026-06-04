export * from './iam.module';
export * from './entities/action.entity';
export * from './entities/module.entity';
export * from './entities/role-permission.entity';
export * from './entities/role.entity';
export * from './entities/user-permission.entity';
export * from './guards/jwt-auth.guard';
export * from './guards/policies.guard';
export * from './services/casl-ability.factory';

export * from './strategies/jwt.strategy';

// Re-export contract người dùng đăng nhập từ tầng nền tảng (shared-types)
// để các consumer cũ vẫn import được qua @app/iam.
export { ActiveUser } from '@app/shared-types';
export type { ActiveUserData } from '@app/shared-types';
