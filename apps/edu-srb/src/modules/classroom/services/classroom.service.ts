import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FilterOperator, PaginateConfig } from 'nestjs-paginate';
import { AbstractBaseService } from '@app/shared-types';
import { TenantConnectionService } from '@app/core/tenant/tenant-connection.service';
import { ClassroomEntity } from '../entities/classroom.entity';
import { CreateClassroomDto, UpdateClassroomDto } from '../dto/classroom.dto';

export const classroomPaginateConfig: PaginateConfig<ClassroomEntity> = {
  sortableColumns: ['createdAt', 'name', 'code'],
  nullSort: 'last',
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['name', 'code'],
  filterableColumns: {
    code: [FilterOperator.EQ],
  },
};

@Injectable()
export class ClassroomService extends AbstractBaseService<
  ClassroomEntity,
  CreateClassroomDto,
  UpdateClassroomDto
> {
  constructor(private readonly tenantConnection: TenantConnectionService) {
    super(classroomPaginateConfig, 'Phòng học');
  }

  protected async getRepository(): Promise<Repository<ClassroomEntity>> {
    return this.tenantConnection.getRepository(ClassroomEntity);
  }
}
