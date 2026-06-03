import { Module } from '@nestjs/common';
import { SystemManagementModule } from '@app/system-management';
import { EduStmController } from './edu-stm.controller';
import { EduStmService } from './edu-stm.service';

@Module({
  imports: [SystemManagementModule],
  controllers: [EduStmController],
  providers: [EduStmService],
})
export class EduStmModule {}
