import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { UserEntity } from './entities/user.entity';
import { IamModule } from '@app/iam';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), IamModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [TypeOrmModule, AccountService],
})
export class SystemManagementModule {}
