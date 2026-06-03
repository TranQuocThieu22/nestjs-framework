import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActivityEntity } from '../entities/activity.entity';
import { ActivityStatus } from '@app/shared-types';

@Injectable()
export class ActivityRepository extends Repository<ActivityEntity> {
  constructor(private dataSource: DataSource) {
    super(ActivityEntity, dataSource.createEntityManager());
  }

  // Custom repository methods for business logic can go here
  async findPendingActivities(): Promise<ActivityEntity[]> {
    return this.find({ where: { status: ActivityStatus.PENDING } });
  }
}
