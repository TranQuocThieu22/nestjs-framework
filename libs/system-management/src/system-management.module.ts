import { Module } from '@nestjs/common';
import { AccountModule } from './modules/account/account.module';
import { DepartmentModule } from './modules/department/department.module';

/**
 * Module tổng hợp phân hệ Quản trị hệ thống.
 * Chỉ gom các feature module con; mỗi feature tự khai báo entity/controller/service của nó.
 */
@Module({
  imports: [AccountModule, DepartmentModule],
  exports: [AccountModule, DepartmentModule],
})
export class SystemManagementModule {}
