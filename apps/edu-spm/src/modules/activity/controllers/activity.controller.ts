import { PageOptionsDto } from '@app/shared-types';
import { Body, Controller, Get, Post, Query, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { ActivityService } from '../services/activity.service';

@ApiTags('Activity Management (SPM)')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community activity' })
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activityService.createActivity(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with pagination' })
  async findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.activityService.getAllActivities(tenantId, pageOptionsDto);
  }
}
