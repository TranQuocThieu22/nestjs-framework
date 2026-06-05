import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, PaginateQuery, FilterOperator } from 'nestjs-paginate';
import { AuditLogEntity } from '@app/shared-types';
import { UserEntity } from '../../account/entities/user.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  async findAllPaginated(tenantId: string, query: PaginateQuery) {
    const queryBuilder = this.auditLogRepo
      .createQueryBuilder('log')
      .leftJoinAndMapOne(
        'log.user',
        UserEntity,
        'user',
        'user.id = log.userId',
      )
      .where('log.tenantId = :tenantId', { tenantId });

    return paginate(query, queryBuilder, {
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
      // select: ['id', 'action', 'entityName', 'entityId', 'createdAt', 'changedFields', 'oldValues', 'newValues'],
      // Note: we let it select all log fields and the joined user fields
    });
  }
}
