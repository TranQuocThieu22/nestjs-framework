import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../entities/department.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
  ) {}

  async create(tenantId: string, createDto: CreateDepartmentDto) {
    // Kiểm tra trùng mã (code) trong cùng 1 trường ĐH (tenantId)
    const exists = await this.departmentRepo.findOne({
      where: { tenantId, code: createDto.code },
    });
    if (exists) {
      throw new BadRequestException('Mã đơn vị đã tồn tại trong hệ thống');
    }

    // Nếu có parentId, kiểm tra parent có tồn tại không
    if (createDto.parentId) {
      const parentExists = await this.departmentRepo.findOne({
        where: { id: createDto.parentId, tenantId },
      });
      if (!parentExists) {
        throw new BadRequestException('Đơn vị cha không tồn tại');
      }
    }

    const entity = this.departmentRepo.create({
      ...createDto,
      tenantId,
    });
    return this.departmentRepo.save(entity);
  }

  async findAllFlat(tenantId: string) {
    return this.departmentRepo.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
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

  async findOne(id: string, tenantId: string) {
    const entity = await this.departmentRepo.findOne({
      where: { id, tenantId },
    });
    if (!entity) {
      throw new NotFoundException('Không tìm thấy đơn vị');
    }
    return entity;
  }

  async update(id: string, tenantId: string, updateDto: UpdateDepartmentDto) {
    const entity = await this.findOne(id, tenantId);

    // Kiểm tra trùng mã
    if (updateDto.code && updateDto.code !== entity.code) {
      const exists = await this.departmentRepo.findOne({
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

    Object.assign(entity, updateDto);
    return this.departmentRepo.save(entity);
  }

  async remove(id: string, tenantId: string) {
    const entity = await this.findOne(id, tenantId);

    // Kiểm tra xem có đơn vị con không
    const children = await this.departmentRepo.count({
      where: { parentId: id, tenantId },
    });
    if (children > 0) {
      throw new BadRequestException(
        'Không thể xóa đơn vị vì đang chứa các đơn vị con',
      );
    }

    await this.departmentRepo.softRemove(entity);
    return { success: true, message: 'Đã xóa thành công' };
  }
}
