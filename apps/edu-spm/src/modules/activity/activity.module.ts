import { Module } from '@nestjs/common';
import { ActivityController } from './controllers/activity.controller';
import { ActivityService } from './services/activity.service';
import { ActivityEntity } from './entities/activity.entity';
import { TenantEntityRegistry } from '@app/core/tenant/tenant-entity.registry';

TenantEntityRegistry.register([ActivityEntity]);

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService], // Export if other domains need to interact with it
})
export class ActivityModule {}
