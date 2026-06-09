import { Injectable } from '@nestjs/common';
import {
  paginate,
  PaginateQuery,
  FilterOperator,
  PaginateConfig,
} from 'nestjs-paginate';
import { AuditLogEntity } from '@app/shared-types';
import { UserEntity } from '../../account/entities/user.entity';

import { TenantConnectionService } from '@app/core';

export const auditLogPaginateConfig: PaginateConfig<AuditLogEntity> = {
  sortableColumns: ['createdAt', 'action', 'entityName'],
  nullSort: 'last',
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['action', 'entityName', 'userId'],
  filterableColumns: {
    entityId: [FilterOperator.EQ],
    entityName: [FilterOperator.EQ],
    action: [FilterOperator.EQ, FilterOperator.IN],
    userId: [FilterOperator.EQ],
  },
};

@Injectable()
export class AuditLogService {
  constructor(
    private readonly tenantConnectionService: TenantConnectionService,
  ) {}

  async findAllPaginated(tenantId: string, query: PaginateQuery) {
    const repo =
      await this.tenantConnectionService.getRepository(AuditLogEntity);
    const queryBuilder = repo
      .createQueryBuilder('log')
      .leftJoinAndMapOne('log.user', UserEntity, 'user', 'user.id = log.userId')
      .where('log.tenantId = :tenantId', { tenantId });

    return paginate(query, queryBuilder, auditLogPaginateConfig);
  }
}
