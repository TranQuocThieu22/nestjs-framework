import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { ActivityEntity } from '../entities/activity.entity';
import {
  ActivityStatus,
  PageDto,
  PageMetaDto,
  PageOptionsDto,
  AbstractBaseService
} from '@app/shared-types';
import { TenantConnectionService } from '@app/core/tenant/tenant-connection.service';

@Injectable()
export class ActivityService extends AbstractBaseService<ActivityEntity> {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly tenantConnectionService: TenantConnectionService) {
    super(
      {
        sortableColumns: ['createdAt', 'code', 'name'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['code', 'name', 'semester'],
      },
      'Hoạt động'
    );
  }

  protected async getRepository(): Promise<Repository<ActivityEntity>> {
    return this.tenantConnectionService.getRepository(ActivityEntity);
  }

  async createActivity(tenantId: string, dto: CreateActivityDto): Promise<ActivityEntity> {
    this.logger.log(`Creating activity: ${dto.code}`);
    return super.create(tenantId, {
      ...dto,
      status: ActivityStatus.PENDING,
    });
  }

  async getAllActivities(
    tenantId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<ActivityEntity>> {
    const repo = await this.getRepository();
    const queryBuilder = repo.createQueryBuilder('activity');
    queryBuilder.where('activity.tenantId = :tenantId', { tenantId });

    queryBuilder
      .orderBy('activity.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }
}
