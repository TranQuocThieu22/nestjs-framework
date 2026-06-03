import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActivityService } from '../services/activity.service';
import { CreateActivityDto } from '../dto/create-activity.dto';

@ApiTags('Activity Management (SPM)')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community activity' })
  async create(@Body() dto: CreateActivityDto) {
    return this.activityService.createActivity(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  async findAll() {
    return this.activityService.getAllActivities();
  }
}
