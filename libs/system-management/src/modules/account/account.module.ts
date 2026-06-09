import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '@app/iam';
import { UserEntity } from './entities/user.entity';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { TenantEntityRegistry } from '@app/core/tenant/tenant-entity.registry';

TenantEntityRegistry.register([UserEntity]);

@Module({
  imports: [IamModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
