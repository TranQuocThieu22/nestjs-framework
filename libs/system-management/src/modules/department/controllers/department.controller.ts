import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, ActiveUser } from '@app/iam';
import type { ActiveUserData } from '@app/iam';
import { DepartmentService } from '../services/department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';
import { BaseControllerFactory } from '@app/shared-types';
import { DepartmentEntity } from '../entities/department.entity';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';

const paginateConfig: PaginateConfig<DepartmentEntity> = {
  sortableColumns: ['createdAt', 'name', 'code'],
  searchableColumns: ['name', 'code', 'description'],
  filterableColumns: {
    type: [FilterOperator.EQ, FilterOperator.IN],
    parentId: [FilterOperator.EQ, FilterOperator.NULL],
  },
};

@ApiTags('Quản lý Danh mục Đơn vị')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/departments')
export class DepartmentController extends BaseControllerFactory<
  DepartmentEntity,
  CreateDepartmentDto,
  UpdateDepartmentDto
>(CreateDepartmentDto, UpdateDepartmentDto, paginateConfig) {
  constructor(private readonly departmentService: DepartmentService) {
    super(departmentService);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy danh sách đơn vị dạng cây phân cấp (Tree)' })
  findAllTree(@ActiveUser() user: ActiveUserData) {
    return this.departmentService.findAllTree(user.tenantId);
  }
}
