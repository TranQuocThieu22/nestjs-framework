import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  FindOptionsOrder,
} from 'typeorm';
import { paginate, PaginateQuery, PaginateConfig } from 'nestjs-paginate';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AbstractTenantEntity } from '../entities/base.entity';

export abstract class AbstractBaseService<
  Entity extends AbstractTenantEntity,
  CreateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
  UpdateDto extends DeepPartial<Entity> = DeepPartial<Entity>,
> {
  constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly paginateConfig: PaginateConfig<Entity>,
    protected readonly entityName: string = 'Dữ liệu',
  ) {}

  async create(tenantId: string, dto: CreateDto): Promise<Entity> {
    const entity = this.repository.create({
      ...dto,
      tenantId,
    } as unknown as DeepPartial<Entity>);
    return this.repository.save(entity);
  }

  async findAllFlat(tenantId: string): Promise<Entity[]> {
    return this.repository.find({
      where: { tenantId } as unknown as FindOptionsWhere<Entity>,
      order: { createdAt: 'ASC' } as FindOptionsOrder<Entity>,
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

  async update(
    id: string,
    tenantId: string,
    dto: UpdateDto,
    options?: { disableOptimisticLocking?: boolean },
  ): Promise<Entity> {
    const entity = await this.findOne(id, tenantId);

    // Optimistic Locking Check
    if (!options?.disableOptimisticLocking) {
      if ((dto as any).version === undefined) {
        throw new BadRequestException(
          'Bắt buộc phải cung cấp version (Optimistic Lock) để cập nhật dữ liệu.',
        );
      }
      if (entity.version !== (dto as any).version) {
        throw new BadRequestException(
          'Dữ liệu đã bị thay đổi bởi phiên bản khác. Vui lòng làm mới trang (refresh) để lấy dữ liệu mới nhất.',
        );
      }
    }
    
    // Xóa version khỏi dto để TypeORM tự động tăng (increment) version
    delete (dto as any).version;

    Object.assign(entity, dto);
    return this.repository.save(entity);
  }

  async softRemove(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    const entity = await this.findOne(id, tenantId);
    await this.repository.softRemove(entity);
    return { success: true, message: 'Đã xóa thành công' };
  }
}
