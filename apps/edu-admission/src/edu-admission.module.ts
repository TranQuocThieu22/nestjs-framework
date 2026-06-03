import { Module } from '@nestjs/common';
import { SystemManagementModule } from '@app/system-management';
import { EduAdmissionController } from './edu-admission.controller';
import { EduAdmissionService } from './edu-admission.service';

@Module({
  imports: [SystemManagementModule],
  controllers: [EduAdmissionController],
  providers: [EduAdmissionService],
})
export class EduAdmissionModule {}
