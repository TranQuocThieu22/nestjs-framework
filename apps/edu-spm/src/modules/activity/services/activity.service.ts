import { Injectable, Logger } from '@nestjs/common';
import { ActivityRepository } from '../repositories/activity.repository';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { ActivityEntity } from '../entities/activity.entity';
import { ActivityStatus } from '@app/shared-types';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly activityRepository: ActivityRepository) {}

  async createActivity(dto: CreateActivityDto): Promise<ActivityEntity> {
    this.logger.log(`Creating activity: ${dto.code}`);
    const activity = this.activityRepository.create({
      ...dto,
      status: ActivityStatus.PENDING,
    });
    return this.activityRepository.save(activity);
  }

  async getAllActivities(): Promise<ActivityEntity[]> {
    return this.activityRepository.find({ order: { createdAt: 'DESC' } });
  }
}
