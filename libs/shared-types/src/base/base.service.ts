import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import {
  paginate,
  PaginateQuery,
  PaginateConfig,
} from 'nestjs-paginate';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AbstractTenantEntity } from '../entities/base.entity';

export abstract class AbstractBaseService<
  Entity extends AbstractTenantEntity,
  CreateDto extends DeepPartial<Entity> = any,
  UpdateDto extends DeepPartial<Entity> = any,
> {
  constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly paginateConfig: PaginateConfig<Entity>,
    protected readonly entityName: string = 'Dữ liệu',
  ) {}

  async create(tenantId: string, dto: CreateDto): Promise<Entity> {
    const entity = this.repository.create({ ...dto, tenantId } as unknown as DeepPartial<Entity>);
    return this.repository.save(entity);
  }

  async findAllFlat(tenantId: string): Promise<Entity[]> {
    return this.repository.find({
      where: { tenantId } as unknown as FindOptionsWhere<Entity>,
      order: { createdAt: 'ASC' } as any,
    });
  }

  async findAllPaginated(tenantId: string, query: PaginateQuery) {
    const queryBuilder = this.repository
      .createQueryBuilder('entity')
      .where('entity.tenantId = :tenantId', { tenantId });

    return paginate(query, queryBuilder, this.paginateConfig);
  }

  async findOne(id: string, tenantId: string): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: { id, tenantId } as unknown as FindOptionsWhere<Entity>,
    });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} không tồn tại`);
    }
    return entity;
  }

  async update(id: string, tenantId: string, dto: UpdateDto): Promise<Entity> {
    const entity = await this.findOne(id, tenantId);
    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async softRemove(id: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    const entity = await this.findOne(id, tenantId);
    await this.repository.softRemove(entity);
    return { success: true, message: 'Đã xóa thành công' };
  }
}
