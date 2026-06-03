import { Module } from '@nestjs/common';
import { SystemManagementModule } from '@app/system-management';
import { EduSpmController } from './edu-spm.controller';
import { EduSpmService } from './edu-spm.service';

@Module({
  imports: [SystemManagementModule],
  controllers: [EduSpmController],
  providers: [EduSpmService],
})
export class EduSpmModule {}
