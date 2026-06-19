import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/iam';
import { BaseControllerFactory } from '@app/shared-types';
import { ClassroomEntity } from '../entities/classroom.entity';
import { CreateClassroomDto, UpdateClassroomDto } from '../dto/classroom.dto';
import { ClassroomService, classroomPaginateConfig } from '../services/classroom.service';

@ApiTags('Quản lý Phòng học')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('srb/classrooms')
export class ClassroomController extends BaseControllerFactory<
  ClassroomEntity,
  CreateClassroomDto,
  UpdateClassroomDto
>(CreateClassroomDto, UpdateClassroomDto, classroomPaginateConfig) {
  constructor(private readonly classroomService: ClassroomService) {
    super(classroomService);
  }
}
