import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './controllers/account.controller';
import { AccountService } from './services/account.service';
import { UserEntity } from './entities/user.entity';
import { IamModule } from '@app/iam';

// Department
import { DepartmentEntity } from './entities/department.entity';
import { DepartmentController } from './controllers/department.controller';
import { DepartmentService } from './services/department.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DepartmentEntity]),
    IamModule,
  ],
  controllers: [AccountController, DepartmentController],
  providers: [AccountService, DepartmentService],
  exports: [TypeOrmModule, AccountService, DepartmentService],
})
export class SystemManagementModule {}
