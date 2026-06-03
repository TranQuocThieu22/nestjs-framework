import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';

@Module({
  controllers: [AccountController],
  providers: [],
  exports: [],
})
export class SystemManagementModule {}
