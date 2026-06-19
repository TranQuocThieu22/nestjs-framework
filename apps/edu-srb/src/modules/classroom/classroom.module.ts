import { Module } from '@nestjs/common';
import { IamModule } from '@app/iam';
import { TenantEntityRegistry } from '@app/core/tenant/tenant-entity.registry';
import { ClassroomEntity } from './entities/classroom.entity';
import { ClassroomController } from './controllers/classroom.controller';
import { ClassroomService } from './services/classroom.service';

TenantEntityRegistry.register([ClassroomEntity]);

@Module({
  imports: [IamModule],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
