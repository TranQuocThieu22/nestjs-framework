import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../entities/department.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';
import { FilterOperator } from 'nestjs-paginate';
import { AbstractBaseService } from '@app/shared-types';

@Injectable()
export class DepartmentService extends AbstractBaseService<
  DepartmentEntity,
  CreateDepartmentDto,
  UpdateDepartmentDto
> {
  constructor(
    @InjectRepository(DepartmentEntity)
    departmentRepo: Repository<DepartmentEntity>,
  ) {
    super(
      departmentRepo,
      {
        sortableColumns: ['createdAt', 'name', 'code'],
        nullSort: 'last',
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['name', 'code', 'description'],
        filterableColumns: {
          type: [FilterOperator.EQ, FilterOperator.IN],
          parentId: [FilterOperator.EQ, FilterOperator.NULL],
        },
      },
      'Đơn vị',
    );
  }

  async create(tenantId: string, createDto: CreateDepartmentDto) {
    // Kiểm tra trùng mã (code) trong cùng 1 trường ĐH (tenantId)
    const exists = await this.repository.findOne({
      where: { tenantId, code: createDto.code } as any,
    });
    if (exists) {
      throw new BadRequestException('Mã đơn vị đã tồn tại trong hệ thống');
    }

    // Nếu có parentId, kiểm tra parent có tồn tại không
    if (createDto.parentId) {
      const parentExists = await this.repository.findOne({
        where: { id: createDto.parentId, tenantId } as any,
      });
      if (!parentExists) {
        throw new BadRequestException('Đơn vị cha không tồn tại');
      }
    }

    return super.create(tenantId, createDto);
  }

  async findAllTree(tenantId: string) {
    const all = await this.findAllFlat(tenantId);

    const map = new Map<string, any>();
    all.forEach((item) => map.set(item.id, { ...item, children: [] }));

    const tree: any[] = [];
    all.forEach((item) => {
      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(map.get(item.id));
        } else {
          // Fallback: nếu parentId không hợp lệ thì đưa ra root luôn
          tree.push(map.get(item.id));
        }
      } else {
        tree.push(map.get(item.id));
      }
    });
    return tree;
  }

  async update(id: string, tenantId: string, updateDto: UpdateDepartmentDto) {
    const entity = await this.findOne(id, tenantId);

    // Kiểm tra trùng mã
    if (updateDto.code && updateDto.code !== entity.code) {
      const exists = await this.repository.findOne({
        where: { tenantId, code: updateDto.code } as any,
      });
      if (exists) {
        throw new BadRequestException('Mã đơn vị đã tồn tại');
      }
    }

    // Kiểm tra không được chọn cha là chính nó
    if (updateDto.parentId && updateDto.parentId === id) {
      throw new BadRequestException('Không thể chọn đơn vị cha là chính nó');
    }

    return super.update(id, tenantId, updateDto);
  }

  async softRemove(id: string, tenantId: string) {
    // Kiểm tra xem có đơn vị con không
    const children = await this.repository.count({
      where: { parentId: id, tenantId } as any,
    });
    if (children > 0) {
      throw new BadRequestException(
        'Không thể xóa đơn vị vì đang chứa các đơn vị con',
      );
    }

    return super.softRemove(id, tenantId);
  }
}
