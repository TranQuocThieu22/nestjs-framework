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

/** Đơn vị kèm danh sách đơn vị con (dạng cây phân cấp) */
export interface DepartmentTreeNode extends DepartmentEntity {
  children: DepartmentTreeNode[];
}

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
      where: { tenantId, code: createDto.code },
    });
    if (exists) {
      throw new BadRequestException('Mã đơn vị đã tồn tại trong hệ thống');
    }

    // Nếu có parentId, kiểm tra parent có tồn tại không
    if (createDto.parentId) {
      const parentExists = await this.repository.findOne({
        where: { id: createDto.parentId, tenantId },
      });
      if (!parentExists) {
        throw new BadRequestException('Đơn vị cha không tồn tại');
      }
    }

    return super.create(tenantId, createDto);
  }

  async findAllTree(tenantId: string): Promise<DepartmentTreeNode[]> {
    const all = await this.findAllFlat(tenantId);

    const map = new Map<string, DepartmentTreeNode>();
    all.forEach((item) => map.set(item.id, { ...item, children: [] }));

    const tree: DepartmentTreeNode[] = [];
    all.forEach((item) => {
      const node = map.get(item.id);
      if (!node) return;

      if (item.parentId) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Fallback: nếu parentId không hợp lệ thì đưa ra root luôn
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });
    return tree;
  }

  async update(id: string, tenantId: string, updateDto: UpdateDepartmentDto) {
    const entity = await this.findOne(id, tenantId);

    // Kiểm tra trùng mã
    if (updateDto.code && updateDto.code !== entity.code) {
      const exists = await this.repository.findOne({
        where: { tenantId, code: updateDto.code },
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
      where: { parentId: id, tenantId },
    });
    if (children > 0) {
      throw new BadRequestException(
        'Không thể xóa đơn vị vì đang chứa các đơn vị con',
      );
    }

    return super.softRemove(id, tenantId);
  }
}
